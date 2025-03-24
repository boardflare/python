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
        authority: "https://login.microsoftonline.com/common",
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
        const parts = token.split('.');
        if (parts.length < 2) return null;
        const standardBase64 = base64UrlToBase64(parts[1]);
        const payload = atob(standardBase64);
        return JSON.parse(payload);
    } catch (error) {
        console.error("Error parsing token claims:", error);
        return null;
    }
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
                        reject(new Error(message.errorData.message));
                    } else {
                        const tokenObj = {
                            auth_token: message.msalResponse?.accessToken,
                            graphToken: message.graphToken,
                            tokenClaims: parseTokenClaims(message.msalResponse?.accessToken)
                        };
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

        // If no accounts, return null immediately
        if (accounts.length === 0) {
            return null;
        }

        const tokenRequest = {
            scopes: await getScopes(),
            account: accounts[0] // Always use first account if available
        };

        const response = await pca.acquireTokenSilent(tokenRequest);
        const tokenObj = {
            auth_token: response.accessToken,
            graphToken: response.accessToken,
            tokenClaims: parseTokenClaims(response.accessToken)
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
            await storeScopes(["User.Read", "offline_access"]);  // Store default scopes before auth
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
    try {
        // JWT tokens are base64 encoded and split by dots
        const [, payloadBase64] = token.split('.');
        if (!payloadBase64) return false;

        // Convert from base64url to standard base64 before decoding
        const standardBase64 = base64UrlToBase64(payloadBase64);

        // Decode the base64 payload
        const payload = JSON.parse(atob(standardBase64));

        // Check if token is expired
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp > currentTime;
    } catch (error) {
        console.error("Error validating token:", error);
        await pyLogs({ message: error.message, ref: "auth_validateToken_error" });
        return false;
    }
}
