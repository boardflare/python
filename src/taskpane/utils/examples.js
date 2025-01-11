export const DEFAULT_FUNCTIONS_URL = 'https://functions.boardflare.com/notebooks/simple/single.ipynb';

export const getStoredUrl = async () => {
    const dbName = 'Boardflare';
    const storeName = 'User';
    const storageKey = 'functions_url';

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const getRequest = store.get(storageKey);

            getRequest.onsuccess = () => {
                resolve(getRequest.result || DEFAULT_FUNCTIONS_URL);
            };

            getRequest.onerror = () => {
                reject(getRequest.error);
            };
        };

        request.onerror = () => {
            reject(request.error);
        };
    });
};

export const setStoredUrl = async (url) => {
    const dbName = 'Boardflare';
    const storeName = 'User';
    const storageKey = 'functions_url';

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName);
            }
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const putRequest = store.put(url, storageKey);

            putRequest.onsuccess = () => resolve(true);
            putRequest.onerror = () => reject(putRequest.error);
        };

        request.onerror = () => reject(request.error);
    });
};

export const remoteFunctions = async () => {
    const url = await getStoredUrl();
    const response = await fetch(url);
    const notebook = await response.json();
    const codeCells = notebook.cells.filter(cell => cell.cell_type === 'code').slice(1);

    const allFunctions = codeCells.map(cell => {
        const code = cell.source.join('');
        const output = cell.outputs?.[0]?.text || [];
        const excelExample = output.find(line => line.includes('Excel:')).split('Excel: ')[1].trim();

        return { code, excel_example: excelExample };
    });

    return allFunctions;
};