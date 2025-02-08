export async function getStoredToken() {
    const dbName = 'Boardflare';
    const storeName = 'User';
    const tokenKey = 'graphToken';

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const getRequest = store.get(tokenKey);

            getRequest.onsuccess = () => resolve(getRequest.result);
            getRequest.onerror = () => reject(getRequest.error);
        };

        request.onerror = () => reject(request.error);
    });
}


