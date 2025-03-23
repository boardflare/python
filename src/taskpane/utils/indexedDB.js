let dbInstance = null;
let dbInitializing = null;

export function initializeDB() {
    if (dbInstance) return Promise.resolve(dbInstance);
    if (dbInitializing) return dbInitializing;

    dbInitializing = new Promise((resolve, reject) => {
        if (!window.indexedDB) {
            return reject(new Error('IndexedDB is not supported in this browser'));
        }

        const dbName = 'Boardflare';
        const dbVersion = 1;
        const request = indexedDB.open(dbName, dbVersion);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create User store if it doesn't exist
            if (!db.objectStoreNames.contains('User')) {
                const userStore = db.createObjectStore('User');
                // Initialize with default scopes
                userStore.put(['User.Read', 'offline_access'], 'scopes');
            }

            // Create Logs store if it doesn't exist
            if (!db.objectStoreNames.contains('Logs')) {
                db.createObjectStore('Logs', { autoIncrement: true });
            }
        };

        request.onerror = () => {
            dbInitializing = null;
            console.error("IndexedDB error:", request.error);
            reject(request.error);
        };

        request.onsuccess = (event) => {
            dbInstance = event.target.result;
            dbInitializing = null;
            resolve(dbInstance);
        };
    });

    return dbInitializing;
}

// Helper function to ensure DB is ready
async function getDB() {
    if (!dbInstance && !dbInitializing) {
        await initializeDB();
    }
    return dbInstance || initializeDB();
}

// User store operations
export async function getStoredToken() {
    const storeName = 'User';
    const tokenKey = 'auth_token';
    const graphKey = 'graphToken';
    const claimsKey = 'tokenClaims';

    try {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const authRequest = store.get(tokenKey);
            const graphRequest = store.get(graphKey);
            const claimsRequest = store.get(claimsKey);

            let tokens = {};

            authRequest.onsuccess = () => {
                tokens.auth_token = authRequest.result;
            };

            graphRequest.onsuccess = () => {
                tokens.graphToken = graphRequest.result;
            };

            claimsRequest.onsuccess = () => {
                tokens.tokenClaims = claimsRequest.result;
            };

            transaction.oncomplete = () => {
                if (!tokens.auth_token || !tokens.graphToken) {
                    resolve(null);
                    return;
                }
                resolve(tokens);
            };

            transaction.onerror = () => reject(transaction.error);
        });
    } catch (error) {
        console.error('Failed to get token:', error);
        return null;
    }
}

export async function storeToken(tokenObj) {
    const storeName = 'User';
    const authKey = 'auth_token';
    const graphKey = 'graphToken';
    const claimsKey = 'tokenClaims';

    try {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);

            store.put(tokenObj.auth_token, authKey);
            store.put(tokenObj.graphToken, graphKey);
            store.put(tokenObj.tokenClaims, claimsKey);

            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    } catch (error) {
        console.error('DB initialization error:', error);
        throw error;
    }
}

export async function removeToken() {
    const storeName = 'User';
    const authKey = 'auth_token';
    const graphKey = 'graphToken';

    try {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            store.delete(authKey);
            store.delete(graphKey);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    } catch (error) {
        throw error;
    }
}

export async function storeScopes(newScopes) {
    const storeName = 'User';
    const scopesKey = 'scopes';

    try {
        const existingScopes = await getScopes();
        const combinedScopes = [...new Set([...existingScopes, ...newScopes])];

        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            store.put(combinedScopes, scopesKey);
            transaction.oncomplete = () => resolve();
            transaction.onerror = () => reject(transaction.error);
        });
    } catch (error) {
        throw error;
    }
}

export async function getScopes() {
    const storeName = 'User';
    const scopesKey = 'scopes';
    const defaultScopes = ["User.Read", "offline_access"];

    try {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(scopesKey);
            request.onsuccess = () => resolve(request.result || defaultScopes);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        return defaultScopes;
    }
}

export async function getTokenClaims() {
    const storeName = 'User';
    return new Promise((resolve, reject) => {
        getDB().then(db => {
            const tx = db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.get('tokenClaims');
            request.onsuccess = () => resolve(request.result || null);
            request.onerror = () => reject(request.error);
        });
    });
}

export async function getUserId() {
    const storeName = 'User';
    const storageKey = 'anonymous_id';

    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.get(storageKey);
        request.onsuccess = () => {
            let userId = request.result;
            if (!userId) {
                userId = crypto.randomUUID();
                store.put(userId, storageKey);
            }
            resolve(userId);
        };
        request.onerror = () => reject(request.error);
    });
}

// Logs store operations
export async function saveLogToIndexedDB(logEntity) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('Logs', 'readwrite');
        const store = tx.objectStore('Logs');
        const request = store.add(logEntity);
        request.onsuccess = () => {
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        };
        request.onerror = () => reject(request.error);
    });
}

export async function getAllLogs() {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('Logs', 'readonly');
        const store = tx.objectStore('Logs');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function clearLogs() {
    const db = await getDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('Logs', 'readwrite');
        const store = tx.objectStore('Logs');
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}
