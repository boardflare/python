export const demoNotebooks = {
    'https://functions.boardflare.com/notebooks/demo/simple.ipynb': {
        title: 'Simple',
        description: 'Simple functions not using arrays or libraries.',
    },
}

export const DEFAULT_NOTEBOOK = 'https://functions.boardflare.com/notebooks/demo/simple.ipynb';

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

    const allFunctions = codeCells.map(cell => {
        const code = cell.source.filter(line => !line.startsWith('run_tests')).join('');
        const output = cell.outputs?.[0]?.text || [];
        const excelExample = output.find(line => line.includes('Excel:')).split('Excel: ')[1].trim();

        return { code, excel_example: excelExample };
    });

    return allFunctions;
};