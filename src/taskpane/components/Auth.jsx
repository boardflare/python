import * as React from "react";

const msalConfig = {
    auth: {
        clientId: "0c94fdd5-ec39-4167-84ea-06ea727149b1",
        authority: "https://login.microsoftonline.com/common",
        redirectUri: window.location.origin + "/auth.html",
    }
};

export function SignInButton({ onSuccess }) {
    const [isSignedIn, setIsSignedIn] = React.useState(false);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = await getStoredToken();
            setIsSignedIn(!!token);
        } catch (error) {
            console.error("Error checking auth status:", error);
        }
    };

    const signIn = async () => {
        try {
            console.log('Starting sign in process...');
            const dialogUrl = window.location.href.includes("preview")
                ? window.location.origin + "/preview/auth.html"
                : window.location.href.includes("prod")
                    ? window.location.origin + "/prod/auth.html"
                    : window.location.origin + "/auth.html";
            console.log("Using dialog URL:", dialogUrl);
            const token = await new Promise((resolve, reject) => {
                console.log('Opening auth dialog...');
                Office.context.ui.displayDialogAsync(
                    dialogUrl,
                    { height: 60, width: 30 },
                    (result) => {
                        console.log('Dialog callback result:', result);
                        if (result.status === Office.AsyncResultStatus.Failed) {
                            reject(new Error(result.error.message));
                        }

                        const dialog = result.value;
                        dialog.addEventHandler(Office.EventType.DialogMessageReceived, (args) => {
                            console.log('Dialog message received:', args.message);
                            dialog.close();
                            const message = JSON.parse(args.message);
                            console.log('Parsed message:', message);
                            if (message.status === 'error') {
                                reject(new Error(message.errorData.message));
                            } else {
                                console.log('MSAL Response:', message.msalResponse);
                                const tokenObj = {
                                    auth_token: message.msalResponse?.accessToken,
                                    graphToken: message.graphToken
                                };
                                console.log('Created token object:', tokenObj);
                                resolve(tokenObj);
                            }
                        });
                    }
                );
            });

            console.log('Token received, storing...', token);
            await storeToken(token);
            console.log('Token stored successfully');
            setIsSignedIn(true);
            onSuccess?.();
        } catch (error) {
            console.error("Detailed sign in error:", error);
            setError(error.message);
        }
    };

    const signOut = async () => {
        try {
            await removeToken();
            setIsSignedIn(false);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    if (isSignedIn) {
        return (
            <div>
                <button
                    onClick={signOut}
                    className="px-2 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
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
                className="px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
                Login
            </button>
            {error && <div className="text-red-500 mt-2">{error}</div>}
        </div>
    );
}

let dbConnection = null;

function initializeDB() {
    if (dbConnection) {
        if (dbConnection.objectStoreNames.contains("User")) {
            return Promise.resolve(dbConnection);
        }
        // DB exists but store is missing: force upgrade by closing and resetting connection.
        dbConnection.close();
        dbConnection = null;
    }

    const dbName = 'Boardflare';
    const storeName = 'User';
    const dbVersion = 1; // Changed from 2 to 1

    return new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            reject(new Error('IndexedDB is not supported in this browser'));
            return;
        }

        const request = indexedDB.open(dbName, dbVersion);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName);
            }
        };

        request.onerror = () => {
            console.error("IndexedDB error:", request.error);
            reject(request.error);
        };

        request.onsuccess = (event) => {
            dbConnection = event.target.result;
            resolve(dbConnection);
        };
    });
}

async function getStoredToken() {
    const storeName = 'User';
    const tokenKey = 'auth_token';

    try {
        const db = await initializeDB();
        return new Promise((resolve, reject) => {
            try {
                const transaction = db.transaction(storeName, 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.get(tokenKey);

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            } catch (error) {
                reject(error);
            }
        });
    } catch (error) {
        console.error('Failed to get token:', error);
        return null;
    }
}

async function storeToken(tokenObj) {
    console.log('storeToken called with:', tokenObj);
    const storeName = 'User';
    const authKey = 'auth_token';
    const graphKey = 'graphToken';

    try {
        const db = await initializeDB();
        console.log('DB initialized');
        return new Promise((resolve, reject) => {
            try {
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);

                console.log('Storing auth_token:', tokenObj.auth_token);
                const authRequest = store.put(tokenObj.auth_token, authKey);

                console.log('Storing graphToken:', tokenObj.graphToken);
                const graphRequest = store.put(tokenObj.graphToken, graphKey);

                transaction.oncomplete = () => {
                    console.log('Transaction completed successfully');
                    resolve();
                };
                transaction.onerror = (error) => {
                    console.error('Transaction error:', error);
                    reject(transaction.error);
                };
            } catch (error) {
                console.error('Store operation error:', error);
                reject(error);
            }
        });
    } catch (error) {
        console.error('DB initialization error:', error);
        throw error;
    }
}

async function removeToken() {
    const storeName = 'User';
    const authKey = 'auth_token';
    const graphKey = 'graphToken';

    try {
        const db = await initializeDB();
        return new Promise((resolve, reject) => {
            try {
                const transaction = db.transaction(storeName, 'readwrite');
                const store = transaction.objectStore(storeName);
                store.delete(authKey);
                store.delete(graphKey);
                transaction.oncomplete = () => resolve();
                transaction.onerror = () => reject(transaction.error);
            } catch (error) {
                reject(error);
            }
        });
    } catch (error) {
        console.error('DB initialization error during sign out:', error);
        throw error;
    }
}
