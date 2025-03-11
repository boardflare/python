import * as React from "react";
import { TokenExpiredError } from "../utils/drive";
import { loadSharedFunctionFiles } from "../utils/shared";
import { pyLogs } from "../utils/logs";
import { saveWorkbookOnly } from "../utils/save";

const SharedFunctions = ({ onImportComplete }) => {
    const [sharedFunctions, setSharedFunctions] = React.useState([]);
    const [url, setUrl] = React.useState('');
    const [isUrlSaving, setIsUrlSaving] = React.useState(false);
    const [saveSuccess, setSaveSuccess] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [folderUrl, setFolderUrl] = React.useState(null);
    const [folderName, setFolderName] = React.useState(null);

    // Load saved URL from IndexedDB on mount
    React.useEffect(() => {
        const loadSavedUrl = async () => {
            const dbName = 'Boardflare';
            const storeName = 'User';
            const key = 'sharedLibraryUrl';

            return new Promise((resolve, reject) => {
                const request = indexedDB.open(dbName, 1);
                request.onsuccess = (event) => {
                    const db = event.target.result;
                    const transaction = db.transaction(storeName, 'readonly');
                    const store = transaction.objectStore(storeName);
                    const getRequest = store.get(key);

                    getRequest.onsuccess = () => {
                        if (getRequest.result) {
                            setUrl(getRequest.result);
                            loadFunctions(getRequest.result);
                        }
                        resolve();
                    };
                    getRequest.onerror = () => reject(getRequest.error);
                };
            });
        };

        loadSavedUrl();
    }, []);

    const loadFunctions = async (urlToLoad) => {
        try {
            const { sharedFunctions: functions, folderUrl: url, folderName } = await loadSharedFunctionFiles(urlToLoad);
            setSharedFunctions(functions);
            setFolderUrl(url);
            setFolderName(folderName);
            setError(null);
        } catch (error) {
            console.error('Error loading shared functions:', error);
            setError(error instanceof TokenExpiredError ? error.message : 'Failed to load shared functions');
            setSharedFunctions([]);
            setFolderName(null);
        }
    };

    const handleUrlSubmit = async (e) => {
        e.preventDefault();
        setIsUrlSaving(true);
        setSaveSuccess(false);
        try {
            // Save URL to IndexedDB
            const dbName = 'Boardflare';
            const storeName = 'User';
            const key = 'sharedLibraryUrl';

            await new Promise((resolve, reject) => {
                const request = indexedDB.open(dbName, 1);
                request.onsuccess = (event) => {
                    const db = event.target.result;
                    const transaction = db.transaction(storeName, 'readwrite');
                    const store = transaction.objectStore(storeName);
                    const putRequest = store.put(url, key);

                    putRequest.onsuccess = () => resolve();
                    putRequest.onerror = () => reject(putRequest.error);
                };
            });

            await loadFunctions(url);
            setSaveSuccess(true);
            pyLogs({ url, ref: 'shared_library_url_submitted' });
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            setError(`Failed to save shared library URL: ${error.message}`);
            pyLogs({ url, ref: 'shared_library_url_submit_error' });
        } finally {
            setIsUrlSaving(false);
        }
    };

    const handleImport = async (func) => {
        try {
            await saveWorkbookOnly(func);
            onImportComplete();
            pyLogs({ function: func.name, ref: 'imported_shared_function' });
        } catch (error) {
            console.error("Error importing function:", error);
            setError("Failed to import function");
            pyLogs({ function: func.name, ref: 'import_shared_function_error' });
        }
    };

    return (
        <details className="mt-0">
            <summary className="px-4 py-2 bg-gray-100 cursor-pointer font-bold">
                Shared Folder
            </summary>
            <div className="p-1">
                Import functions from a shared folder in SharePoint or OneDrive.  Add Files.Read.All permissions in settings ⚙️ and refresh login.
            </div>
            <div className="border-t pt-2">
                {sharedFunctions.length > 0 && (
                    <div className="overflow-x-auto mb-2">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b text-center" colSpan="2">
                                        {folderUrl ? (
                                            <a
                                                href={folderUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline flex items-center justify-center gap-2"
                                                title="Open shared folder"
                                            >
                                                Shared Functions
                                                <span>📂</span>
                                            </a>
                                        ) : (
                                            <span>Shared Functions</span>
                                        )}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sharedFunctions.map((func) => (
                                    <tr key={func.fileId}>
                                        <td className="py-2 px-4 border-b">
                                            <span className="font-mono">{func.name}</span>
                                        </td>
                                        <td className="py-2 px-4 border-b w-fit text-right">
                                            <button
                                                onClick={() => handleImport(func)}
                                                className="text-blue-500 hover:underline"
                                            >
                                                Import
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="px-4 mt-4 border-t pt-4">
                    <form onSubmit={handleUrlSubmit} className="mb-2">
                        <div className="flex gap-2 items-center">
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="flex-1 px-2 py-1 border rounded"
                                placeholder="Enter folder sharing link."
                            />
                            <button
                                type="submit"
                                disabled={isUrlSaving || !url.trim()}
                                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                            >
                                {isUrlSaving ? 'Saving...' : 'Save'}
                            </button>
                        </div>
                        {saveSuccess && (
                            <div className="mt-2 text-green-600 text-sm">
                                Shared library URL saved successfully!
                            </div>
                        )}
                        {error && (
                            <div className="mt-2 text-red-600 text-sm">
                                {error}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </details>
    );
};

export default SharedFunctions;
