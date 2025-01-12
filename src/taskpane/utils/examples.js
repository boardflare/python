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
    let notebook;

    if (url.includes('gist.github.com')) {
        const gistId = url.split('/').pop();
        const gistApiUrl = `https://api.github.com/gists/${gistId}`;
        const response = await fetch(gistApiUrl);
        const gistData = await response.json();
        const fileName = Object.keys(gistData.files)[0];
        notebook = JSON.parse(gistData.files[fileName].content);
    } else {
        const response = await fetch(url);
        notebook = await response.json();
    }

    const codeCells = notebook.cells.filter(cell => cell.cell_type === 'code').slice(1);

    const allFunctions = codeCells.map(cell => {
        const code = cell.source.filter(line => !line.startsWith('run_tests')).join('');
        const output = cell.outputs?.[0]?.text || [];
        const excelExample = output.find(line => line.includes('Excel:')).split('Excel: ')[1].trim();

        return { code, excel_example: excelExample };
    });

    return allFunctions;
};