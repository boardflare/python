const msalConfig = {
    auth: {
        clientId: "0c94fdd5-ec39-4167-84ea-06ea727149b1",
        authority: "https://login.microsoftonline.com/common",
        redirectUri: window.location.origin + "/auth.html",
    }
};

const tokenRequest = {
    scopes: ["User.Read", "Files.Read"]
};

export async function getStoredToken() {
    const dbName = 'Boardflare';
    const storeName = 'User';
    const tokenKey = 'auth_token';

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

export async function storeToken(token) {
    const dbName = 'Boardflare';
    const storeName = 'User';
    const tokenKey = 'auth_token';

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const putRequest = store.put(token, tokenKey);

            putRequest.onsuccess = () => resolve();
            putRequest.onerror = () => reject(putRequest.error);
        };

        request.onerror = () => reject(request.error);
    });
}

export async function signIn() {
    return new Promise((resolve, reject) => {
        Office.context.ui.displayDialogAsync(
            'https://localhost:3000/auth.html',
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
                        const token = message.msalResponse.accessToken;
                        storeToken(token)
                            .then(() => resolve(token))
                            .catch(reject);
                    }
                });
            }
        );
    });
}
