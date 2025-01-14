import * as React from "react";
import { getFunctionFromSettings, deleteFunctionFromSettings } from "../utils/workbookSettings";
import { DEFAULT_NOTEBOOK, getStoredNotebooks, addNotebook, removeNotebook, demoNotebooks, fetchNotebookUrl } from "../utils/notebooks";
import { parsePython } from "../utils/codeparser";
import { saveFunctionToSettings } from "../utils/workbookSettings";
import { updateNameManager } from "../utils/nameManager";
import { multiDemo } from "../utils/demo";

const FunctionsTab = ({ onEdit }) => {
    // Original state for functions
    const [functions, setFunctions] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    // New state for notebooks
    const [myNotebooks, setMyNotebooks] = React.useState({});
    const [isNotebooksLoading, setIsNotebooksLoading] = React.useState(false);
    const [notebooksError, setNotebooksError] = React.useState(null);
    const [url, setUrl] = React.useState('');
    const [isUrlSaving, setIsUrlSaving] = React.useState(false);
    const [saveSuccess, setSaveSuccess] = React.useState(false);
    const [selectedNotebook, setSelectedNotebook] = React.useState(DEFAULT_NOTEBOOK);
    const [isImporting, setIsImporting] = React.useState(false);
    const [deleteConfirm, setDeleteConfirm] = React.useState(null);

    const loadFunctions = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const functionsData = await getFunctionFromSettings();
            const functionsWithIds = (functionsData || []).map((func, index) => ({
                ...func,
                id: index + 1
            }));
            setFunctions(functionsWithIds);
        } catch (error) {
            console.error('Error loading functions:', error);
            setError('Failed to load functions. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const loadNotebooks = async () => {
        setIsNotebooksLoading(true);
        setNotebooksError(null);
        try {
            const storedNotebooks = await getStoredNotebooks();
            setMyNotebooks(storedNotebooks);
        } catch (error) {
            console.error('Error loading notebooks:', error);
            setNotebooksError('Failed to load notebooks. Please try again.');
        } finally {
            setIsNotebooksLoading(false);
        }
    };

    // Combined loading effect
    React.useEffect(() => {
        loadFunctions();
        loadNotebooks();
    }, []);

    const handleUrlSubmit = async (e) => {
        e.preventDefault();
        setIsUrlSaving(true);
        setSaveSuccess(false);
        try {
            await addNotebook(url);
            await loadNotebooks();
            setUrl('');
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            setError('Failed to add notebook');
        } finally {
            setIsUrlSaving(false);
        }
    };

    const handleRemove = async (url) => {
        try {
            await removeNotebook(url);
            await loadNotebooks();
        } catch (error) {
            setError('Failed to remove notebook');
        }
    };

    const handleImportFunctions = async () => {
        setIsImporting(true);
        try {
            const parsedFunctions = await fetchNotebookUrl(selectedNotebook);

            for (const func of parsedFunctions) {
                await saveFunctionToSettings(func);
                await updateNameManager(func);
            }

            const notebookTitle = selectedNotebook in demoNotebooks
                ? demoNotebooks[selectedNotebook].title
                : myNotebooks[selectedNotebook]?.title || 'Custom Notebook';

            await multiDemo(parsedFunctions, `Demo_${notebookTitle}`);
            await loadFunctions();
            setError(null);
        } catch (error) {
            console.error("Error importing functions:", error);
            setError("Failed to import functions");
        } finally {
            setIsImporting(false);
        }
    };

    const handleDelete = async (functionName) => {
        try {
            await deleteFunctionFromSettings(functionName);
            await loadFunctions(); // Reload the functions list
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting function:', error);
            setError('Failed to delete function. Please try again.');
        }
    };

    return (
        <div className="h-full flex flex-col overflow-y-auto">
            {/* Functions Table */}
            <div className="mb-4">
                {isLoading ? (
                    <div className="flex justify-center items-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : error ? (
                    <div className="p-4 text-red-600">{error}</div>
                ) : functions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr>
                                    <th className="py-1 px-2 border-b">Name</th>
                                    <th className="py-1 px-2 border-b">Description</th>
                                    <th className="py-1 px-2 border-b">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {functions.map((func) => (
                                    <tr key={func.id}>
                                        <td className="py-1 px-2 border-b">{func.name}</td>
                                        <td className="py-1 px-2 border-b">{func.description}</td>
                                        <td className="py-1 px-2 border-b">
                                            <div className="flex gap-2">
                                                <button
                                                    className="text-blue-500 hover:text-blue-700"
                                                    onClick={() => onEdit(func.name)}
                                                    title="Edit function"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="text-red-500 hover:text-red-700 text-lg"
                                                    onClick={() => setDeleteConfirm(func.name)}
                                                    title="Delete function"
                                                >
                                                    ❌
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-5 text-center text-gray-600">
                        <div className="text-4xl mb-4">📝</div>
                        <div className="text-base mb-2">No functions found</div>
                        <div>Create new functions using the Editor tab</div>
                    </div>
                )}
            </div>

            {/* Notebooks Section */}
            <div className="border-t pt-2">
                <h2 className="text-lg font-semibold mb-2 px-4">Notebooks</h2>
                <p className="text-sm text-gray-600 px-4 mb-2">
                    Import functions from a Jupyter notebook. Select a demo notebook or add your own notebook URL.  See <a href="https://www.boardflare.com/apps/excel/python" target="_blank" rel="noopener" className="text-blue-500 underline">documentation</a> for details.
                </p>
                <div className="px-4 mb-4">
                    <select
                        value={selectedNotebook}
                        onChange={(e) => setSelectedNotebook(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm mb-2"
                    >
                        <optgroup label="Demo Notebooks">
                            {Object.entries(demoNotebooks).map(([url, { title }]) => (
                                <option key={url} value={url}>{title}</option>
                            ))}
                        </optgroup>
                        {Object.keys(myNotebooks).length > 0 && (
                            <optgroup label="Your Notebooks">
                                {Object.entries(myNotebooks).map(([url, { title }]) => (
                                    <option key={url} value={url}>{title || url}</option>
                                ))}
                            </optgroup>
                        )}
                    </select>
                    <button
                        onClick={handleImportFunctions}
                        disabled={isImporting}
                        className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                    >
                        {isImporting ? "Importing Functions..." : "Import Notebook Functions"}
                    </button>
                </div>
                {isNotebooksLoading ? (
                    <div className="flex justify-center items-center p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                ) : (
                    <>
                        {Object.keys(myNotebooks).length > 0 && (
                            <div className="overflow-x-auto mb-4">
                                <table className="min-w-full bg-white">
                                    <thead>
                                        <tr>
                                            <th className="py-2 px-4 border-b">Title</th>
                                            <th className="py-2 px-4 border-b">Description</th>
                                            <th className="py-2 px-4 border-b">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(myNotebooks).map(([url, notebook]) => (
                                            <tr key={url}>
                                                <td className="py-2 px-4 border-b">
                                                    <a href={url} target="_blank" rel="noopener noreferrer"
                                                        className="text-blue-500 hover:underline">
                                                        {notebook.title || notebook.fileName || 'Untitled'}
                                                    </a>
                                                </td>
                                                <td className="py-2 px-4 border-b">
                                                    {notebook.description || 'No description'}
                                                </td>
                                                <td className="py-2 px-4 border-b">
                                                    <button
                                                        className="text-red-500 hover:underline"
                                                        onClick={() => handleRemove(url)}
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        <form onSubmit={handleUrlSubmit} className="p-4 border-t">
                            <div className="flex gap-2 items-center">
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    className="flex-1 px-2 py-1 border rounded"
                                    placeholder="Enter notebook URL"
                                />
                                <button
                                    type="submit"
                                    disabled={isUrlSaving}
                                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                >
                                    {isUrlSaving ? 'Adding...' : 'Add'}
                                </button>
                            </div>
                            {saveSuccess && (
                                <div className="mt-2 text-green-600 text-sm">
                                    Notebook added successfully!
                                </div>
                            )}
                            {notebooksError && (
                                <div className="mt-2 text-red-600 text-sm">
                                    {notebooksError}
                                </div>
                            )}
                        </form>
                    </>
                )}
            </div>

            {/* Delete Confirmation Dialog */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-lg max-w-sm w-full">
                        <h3 className="text-lg font-semibold mb-4">Delete Function</h3>
                        <p className="mb-4">Are you sure you want to delete "{deleteConfirm}"?</p>
                        <div className="flex justify-end gap-2">
                            <button
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                                onClick={() => setDeleteConfirm(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                onClick={() => handleDelete(deleteConfirm)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FunctionsTab;
