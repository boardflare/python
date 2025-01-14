import { parsePython } from './codeparser';
import { pythonLogs } from './logs';
let logRef;

let demoNotebooks = {};
export const DEFAULT_NOTEBOOK = '';

export const fetchDemoNotebooks = async () => {
    try {
        const response = await fetch('https://functions.boardflare.com/discovery/app-nb.json');
        demoNotebooks = await response.json();
        return demoNotebooks;
    } catch (error) {
        console.error('Failed to fetch demo notebooks:', error);
        return {};
    }
};

const fetchGistContent = async (url) => {
    const gistId = url.split('/').pop();
    const gistApiUrl = `https://api.github.com/gists/${gistId}`;
    const response = await fetch(gistApiUrl);
    const gistData = await response.json();
    const fileName = Object.keys(gistData.files)[0];
    return {
        content: JSON.parse(gistData.files[fileName].content),
        fileName
    };
};

const fetchNotebookMetadata = async (url) => {
    let notebook, fileName;
    if (url.includes('gist.github.com')) {
        const { content, fileName: gistFileName } = await fetchGistContent(url);
        notebook = content;
        fileName = gistFileName;
    } else {
        const response = await fetch(url);
        notebook = await response.json();
        fileName = url.split('/').pop();
    }
    return { fileName, ...notebook.metadata?.boardflare };
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
        await pythonLogs({ url, metadata }, logRef = "add notebook url");

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
    let notebook;
    if (url.includes('gist.github.com')) {
        const { content } = await fetchGistContent(url);
        notebook = content;
    } else {
        const response = await fetch(url);
        notebook = await response.json();
    }



    const codeCells = notebook.cells.filter(cell => cell.cell_type === 'code').slice(1);

    const allFunctions = codeCells.reduce((validFunctions, cell) => {
        try {
            const code = cell.source.filter(line => !line.startsWith('run_tests')).join('');
            validFunctions.push(parsePython(code));
        } catch (error) {
            console.warn('Skipping invalid code cell:', {
                error: error.message,
                code: cell.source.join(''),
            });
        }
        return validFunctions;
    }, []);

    await pythonLogs({ url, notebook, allFunctions }, logRef = "notebook fetched");

    return allFunctions;
};