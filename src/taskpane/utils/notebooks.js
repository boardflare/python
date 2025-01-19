import { parsePython } from './codeparser';
import { pyLogs } from './logs';

let demoNotebooks = {};
export const DEFAULT_NOTEBOOK = '';

export const fetchDemoNotebooks = async () => {
    try {
        const response = await fetch('https://functions.boardflare.com/discovery/app-nb.json');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        demoNotebooks = await response.json();
        return demoNotebooks;
    } catch (error) {
        await pyLogs({ errorMessage: error.message, code: null, ref: 'fetchDemoNotebooks_error' });
        console.error('Failed to fetch demo notebooks:', error);
        return {};
    }
};

const fetchGistContent = async (url) => {
    try {
        const gistId = url.split('/').pop();
        const gistApiUrl = `https://api.github.com/gists/${gistId}`;
        const response = await fetch(gistApiUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const gistData = await response.json();
        const fileName = Object.keys(gistData.files)[0];
        if (!fileName) throw new Error('No files found in gist');
        return {
            content: JSON.parse(gistData.files[fileName].content),
            fileName
        };
    } catch (error) {
        await pyLogs({ errorMessage: error.message, code: url, ref: 'fetchGistContent_error' });
        throw error;
    }
};

const fetchNotebookMetadata = async (url) => {
    let fileName;
    if (url.includes('gist.github.com')) {
        const { fileName: gistFileName } = await fetchGistContent(url);
        fileName = gistFileName;
    } else {
        fileName = url.split('/').pop();
    }
    return { fileName };
};

export const getStoredNotebooks = async () => {
    const dbName = 'Boardflare';
    const storeName = 'User';
    const storageKey = 'notebooks';

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const getRequest = store.get(storageKey);

            getRequest.onsuccess = () => {
                resolve(getRequest.result || {});
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

export const addNotebook = async (url) => {
    const dbName = 'Boardflare';
    const storeName = 'User';
    const storageKey = 'notebooks';

    try {
        const metadata = await fetchNotebookMetadata(url);
        const notebooks = await getStoredNotebooks();
        notebooks[url] = metadata;

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
                const putRequest = store.put(notebooks, storageKey);

                putRequest.onsuccess = () => resolve(true);
                putRequest.onerror = () => reject(putRequest.error);
            };

            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        throw new Error('Failed to fetch notebook metadata');
    }
};

export const removeNotebook = async (url) => {
    const notebooks = await getStoredNotebooks();
    delete notebooks[url];

    const dbName = 'Boardflare';
    const storeName = 'User';
    const storageKey = 'notebooks';

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const putRequest = store.put(notebooks, storageKey);

            putRequest.onsuccess = () => resolve(true);
            putRequest.onerror = () => reject(putRequest.error);
        };

        request.onerror = () => reject(request.error);
    });
};

export const fetchNotebookUrl = async (url = DEFAULT_NOTEBOOK) => {
    try {
        let notebook;
        if (url.includes('gist.github.com')) {
            const { content } = await fetchGistContent(url);
            notebook = content;
        } else {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            notebook = await response.json();
        }

        const codeCells = notebook.cells.filter(cell => cell.cell_type === 'code').slice(1);
        const allFunctions = codeCells.reduce((validFunctions, cell) => {
            try {
                const code = cell.source.filter(line => !line.startsWith('run_tests')).join('');
                validFunctions.push(parsePython(code));
            } catch (error) {
                pyLogs({
                    errorMessage: error.message,
                    code: cell.source.join(''),
                    ref: 'fetchNotebookUrl_cell_error'
                });
                console.warn('Skipping invalid code cell:', {
                    error: error.message,
                    code: cell.source.join(''),
                });
            }
            return validFunctions;
        }, []);

        return { functions: allFunctions };
    } catch (error) {
        await pyLogs({
            errorMessage: error.message,
            code: url,
            ref: 'fetchNotebookUrl_error'
        });
        throw error;
    }
};