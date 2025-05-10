import * as React from "react";
import { pyLogs } from "../utils/logs";
import { PublicClientApplication } from "@azure/msal-browser";
import {
    initializeDB,
    getStoredToken,
    storeToken,
    removeToken,
    storeScopes,
    getScopes
} from "../utils/indexedDB";

// Initialize MSAL configuration
const msalConfig = {
    auth: {
        clientId: '7fc35253-f44d-4c02-aea9-9b0b7a0a4b61',
        authority: "https://login.microsoftonline.com/common/v2.0", // <-- use v2.0 endpoint
        redirectUri: window.location.origin + window.location.pathname
    },
    cache: {
        cacheLocation: 'localStorage'
    }
};

const pca = new PublicClientApplication(msalConfig);
pca.initialize();

// Convert base64url to standard base64 for atob compatibility
function base64UrlToBase64(base64Url) {
    // Replace characters used in base64url encoding with standard base64 characters
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Add padding if needed
    while (base64.length % 4) {
        base64 += '=';
    }

    return base64;
}

// Add helper to parse token claims
export function parseTokenClaims(token) {
    try {
        if (!token || typeof token !== 'string') return null;
        const parts = token.split('.');
        if (parts.length < 2) {
            // Silently return null if not a JWT (opaque token)
            return null;
        }
        const standardBase64 = base64UrlToBase64(parts[1]);
        const payload = atob(standardBase64);
        return JSON.parse(payload);
    } catch (error) {
        console.error("Error parsing token claims:", error);
        return null;
    }
}

// Helper to get claims from either idToken or accessToken (prefer idToken)
function getBestTokenClaims(response) {
    let claims = null;
    if (response?.idToken) {
        claims = parseTokenClaims(response.idToken);
    }
    if (!claims && response?.accessToken) {
        claims = parseTokenClaims(response.accessToken);
    }
    return claims;
}

export async function authenticateWithDialog() {
    let dialogUrl;
    if (window.location.href.includes("preview")) {
        dialogUrl = "https://addins.boardflare.com/python/preview/auth.html";
    } else if (window.location.href.includes("prod")) {
        dialogUrl = "https://addins.boardflare.com/python/prod/auth.html";
    } else {
        dialogUrl = window.location.origin + "/auth.html";
    }

    const token = await new Promise((resolve, reject) => {
        Office.context.ui.displayDialogAsync(
            dialogUrl,
            { height: 60, width: 30 },
            (result) => {
                if (result.status === Office.AsyncResultStatus.Failed) {
                    reject(new Error(result.error.message));
                }

                const dialog = result.value;
                dialog.addEventHandler(Office.EventType.DialogMessageReceived, (args) => {
                    dialog.close();
                    const message = JSON.parse(args.message);
                    if (message.status === 'error') {
                        console.error('[Auth] Dialog error message:', message);
                        reject(new Error(message.errorData.message));
                    } else {
                        // Log the full msalResponse for debugging
                        console.log('[Auth] Full msalResponse from dialog:', message.msalResponse);
                        pyLogs({ ref: 'auth_full_msalResponse', msalResponse: message.msalResponse });
                        // Try to get claims from accessToken, fallback to idToken if needed
                        const tokenClaims = getBestTokenClaims(message.msalResponse);
                        const tokenObj = {
                            auth_token: message.msalResponse?.accessToken,
                            graphToken: message.graphToken,
                            tokenClaims
                        };
                        console.log('[Auth] TokenObj from dialog:', tokenObj);
                        pyLogs({ ref: 'auth_tokenObj', tokenObj });
                        resolve(tokenObj);
                    }
                });
            }
        );
    });

    await storeToken(token);
    return token;
}

// Move refreshToken function here, outside of any component
export async function refreshToken() {
    try {
        const accounts = pca.getAllAccounts();
        if (accounts.length === 0) {
            return null;
        }
        const tokenRequest = {
            scopes: await getScopes(),
            account: accounts[0]
        };
        const response = await pca.acquireTokenSilent(tokenRequest);
        // Try to get claims from accessToken, fallback to idToken if needed
        const tokenClaims = getBestTokenClaims(response);
        const tokenObj = {
            auth_token: response.accessToken,
            graphToken: response.accessToken,
            tokenClaims
        };
        await storeToken(tokenObj);
        return tokenObj;
    } catch (error) {
        console.error("Error refreshing token:", error);
        await pyLogs({ message: error.message, ref: "auth_refreshToken_error" });
        return null;
    }
}

export function SignInButton({ loadFunctions }) {
    const [isSignedIn, setIsSignedIn] = React.useState(false);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        // Initialize DB before checking auth status
        initializeDB().then(() => {
            checkAuthStatus();
        }).catch(error => {
            console.error("Failed to initialize database:", error);
            pyLogs({ message: error.message, ref: "auth_dbInit_error" });
        });
    }, []);

    const checkAuthStatus = async () => {
        try {

            // Now check stored token (either fresh or existing)
            const tokenObj = await getStoredToken();
            if (!tokenObj) {
                setIsSignedIn(false);
                return;
            }

            const isValid = await isTokenValid(tokenObj.auth_token);
            if (!isValid) {
                await removeToken();
                setIsSignedIn(false);
                return;
            }

            setIsSignedIn(true);
        } catch (error) {
            console.error("Error checking auth status:", error);
            await pyLogs({ message: error.message, ref: "auth_checkAuthStatus_error" });
            setIsSignedIn(false);
        }
    };

    const signIn = async () => {
        try {
            await storeScopes([
                "openid", "profile", "email", "offline_access",
                "User.Read", "Files.ReadWrite.AppFolder"
            ]);  // Always store all required scopes before auth
            await authenticateWithDialog();
            pyLogs({ message: "Sign in successful", ref: "auth_signin_success" });
            setIsSignedIn(true);
            loadFunctions?.();
        } catch (error) {
            console.error("Detailed sign in error:", error);
            await pyLogs({
                message: error.message,
                ref: "auth_signIn_error"
            });
            setError(error.message);
        }
    };

    const signOut = async () => {
        try {
            await removeToken();
            setIsSignedIn(false);
            setError(null);
            loadFunctions?.(); // This will now trigger the clearFunctions first
        } catch (error) {
            console.error("Error signing out:", error);
            await pyLogs({ message: error.message, ref: "auth_signOut_error" });
        }
    };

    if (isSignedIn) {
        return (
            <div>
                <button
                    onClick={signOut}
                    className="px-2 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                    Logout
                </button>
            </div>
        );
    }

    return (
        <div>
            <button
                onClick={signIn}
                className="px-2 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
                Login
            </button>
            {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
    );
}

async function isTokenValid(token) {
    if (!token) return false;
    // Parse claims; opaque (non-JWT) tokens return null
    const claims = parseTokenClaims(token);
    if (!claims) {
        return true;
    }
    try {
        const currentTime = Math.floor(Date.now() / 1000);
        return claims.exp > currentTime;
    } catch (error) {
        console.error("Error validating token claims:", error);
        await pyLogs({ message: error.message, ref: "auth_validateToken_error" });
        return false;
    }
}

// Add AuthContext to provide auth state and a refresh function
export const AuthContext = React.createContext();

export function AuthProvider({ children }) {
    const [refreshKey, setRefreshKey] = React.useState(0);
    const [isSignedIn, setIsSignedIn] = React.useState(false);
    const [userEmail, setUserEmail] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        let mounted = true;
        async function check() {
            try {
                await initializeDB();
                const tokenObj = await getStoredToken();
                if (!tokenObj) {
                    if (mounted) {
                        setIsSignedIn(false);
                        setUserEmail(null);
                        setLoading(false);
                        console.log('[AuthProvider] No tokenObj found, set isSignedIn to false');
                        pyLogs({ ref: 'auth_no_tokenObj', isSignedIn: false });
                    }
                    return;
                }
                const isValid = await isTokenValid(tokenObj.auth_token);
                if (!isValid) {
                    await removeToken();
                    if (mounted) {
                        setIsSignedIn(false);
                        setUserEmail(null);
                        setLoading(false);
                        console.log('[AuthProvider] Token invalid, set isSignedIn to false');
                        pyLogs({ ref: 'auth_token_invalid', isSignedIn: false });
                    }
                    return;
                }
                if (mounted) {
                    setIsSignedIn(true);
                    const claims = tokenObj.tokenClaims || {};
                    setUserEmail(claims.email || claims.upn || claims.preferred_username || null);
                    setLoading(false);
                    console.log('[AuthProvider] Token valid, set isSignedIn to true, claims:', claims);
                    pyLogs({ ref: 'auth_token_valid', isSignedIn: true, claims });
                }
            } catch (error) {
                if (mounted) {
                    setIsSignedIn(false);
                    setUserEmail(null);
                    setLoading(false);
                    console.log('[AuthProvider] Error in check, set isSignedIn to false:', error);
                    pyLogs({ ref: 'auth_check_error', isSignedIn: false, error: error.message });
                }
            }
        }
        check();
        return () => { mounted = false; };
    }, [refreshKey]);

    // Logout: remove token and clear MSAL cache
    const logout = async (onLogout) => {
        // Clear local tokens and state
        localStorage.clear();
        sessionStorage.clear();
        await removeToken();
        setIsSignedIn(false);
        setUserEmail(null);
        // Logout does not actually revoke consent, so is only useful to clear the cache.
        // try {
        //     let logoutUrl;
        //     if (window.location.href.includes("preview")) {
        //         logoutUrl = "https://addins.boardflare.com/python/preview/logout.html";
        //     } else if (window.location.href.includes("prod")) {
        //         logoutUrl = "https://addins.boardflare.com/python/prod/logout.html";
        //     } else {
        //         logoutUrl = window.location.origin + "/logout.html";
        //     }
        //     Office.context.ui.displayDialogAsync(
        //         logoutUrl,
        //         { height: 60, width: 30 },
        //         () => { }
        //     );
        // } catch (e) {
        //     // Ignore errors
        // }
        if (onLogout)
            onLogout();
    };

    // Call this after login to refresh auth state
    const refreshAuth = () => setRefreshKey(k => k + 1);

    return (
        <AuthContext.Provider value={{ isSignedIn, userEmail, loading, logout, refreshAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return React.useContext(AuthContext);
}
