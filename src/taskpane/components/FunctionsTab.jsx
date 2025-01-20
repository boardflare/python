import * as React from "react";
import { getFunctionFromSettings, deleteFunctionFromSettings } from "../utils/workbookSettings";
import { DEFAULT_NOTEBOOK, getStoredNotebooks, addNotebook, removeNotebook, fetchDemoNotebooks, fetchNotebookUrl } from "../utils/notebooks";
import { saveFunctionToSettings } from "../utils/workbookSettings";
import { updateNameManager } from "../utils/nameManager";
import { runTests } from "../utils/testRunner";

const FunctionsTab = ({ onEdit, onTest }) => {
    // Original state for functions
    const [functions, setFunctions] = React.useState([]);
    const [error, setError] = React.useState(null);

    // New state for notebooks
    const [myNotebooks, setMyNotebooks] = React.useState({});
    const [url, setUrl] = React.useState('');
    const [isUrlSaving, setIsUrlSaving] = React.useState(false);
    const [saveSuccess, setSaveSuccess] = React.useState(false);
    const [selectedNotebook, setSelectedNotebook] = React.useState(DEFAULT_NOTEBOOK);
    const [isImporting, setIsImporting] = React.useState(false);
    const [deleteConfirm, setDeleteConfirm] = React.useState(null);
    const [demoNotebooks, setDemoNotebooks] = React.useState({});

    const loadFunctions = async () => {
        try {
            const functionsData = await getFunctionFromSettings();
            setFunctions(functionsData || []);
        } catch (error) {
            console.error('Error loading functions:', error);
            setError('Failed to load functions. Please try again.');
        }
    };

    const loadNotebooks = async () => {
        try {
            const storedNotebooks = await getStoredNotebooks();
            setMyNotebooks(storedNotebooks);
        } catch (error) {
            console.error('Error loading notebooks:', error);
            setError('Failed to load notebooks. Please try again.');
        }
    };

    // Combined loading effect
    React.useEffect(() => {
        const loadData = async () => {
            try {
                await Promise.all([
                    loadFunctions(),
                    loadNotebooks(),
                    fetchDemoNotebooks().then(setDemoNotebooks)
                ]);
            } catch (error) {
                console.error('Error loading data:', error);
                setError('Failed to load data. Please try again.');
            }
        };

        loadData();
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
            const { functions: parsedFunctions } = await fetchNotebookUrl(selectedNotebook);

            for (const func of parsedFunctions) {
                await saveFunctionToSettings(func);
                await updateNameManager(func);
            }

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

    const handleTest = async (func) => {
        onTest(); // Switch to output tab
        try {
            await runTests(func);
        } catch (error) {
            console.error('Error running tests:', error);
            setError('Failed to run tests. Please try again.');
        }
    };

    return (
        <div className="h-full flex flex-col overflow-y-auto">
            {/* Consolidated Error Display */}
            {error && (
                <div className="p-4 text-red-600 bg-red-50 mb-4">
                    {error}
                </div>
            )}

            {/* Functions Table */}
            <div className="mt-2">
                {functions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <tbody>
                                {functions.map((func) => (
                                    <tr key={func.name}>
                                        <td className="py-2 px-2 border-b">
                                            <code className="font-mono text-sm">{func.name.toUpperCase()}</code>
                                        </td>
                                        <td className="py-2 px-2 border-b w-fit">
                                            <div className="flex gap-2 justify-end">
                                                <button
                                                    className="text-green-500 hover:text-green-700"
                                                    onClick={() => handleTest(func)}
                                                    title="Run tests"
                                                >
                                                    ▶️
                                                </button>
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
                        <div>Create a function using the <button onClick={() => onEdit("")} className="text-blue-500 hover:text-blue-700 hover:underline">Editor</button>, or select a notebook below to import example functions.  Check out the <a href="https://www.boardflare.com/apps/excel/python" target="_blank" rel="noopener" className="text-blue-500 underline">tutorial video</a> and <a href="https://www.boardflare.com/apps/excel/python" target="_blank" rel="noopener" className="text-blue-500 underline">documentation</a>.</div>
                    </div>
                )}
            </div>

            {/* Notebooks Section */}
            <div className="border-t pt-2">
                <div className="px-4 mb-4">
                    <select
                        value={selectedNotebook}
                        onChange={(e) => setSelectedNotebook(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm mb-2"
                    >
                        <option value="">Select a notebook with example functions...</option>
                        {Object.keys(myNotebooks).length > 0 && (
                            <optgroup label="Custom Notebooks">
                                {Object.entries(myNotebooks).map(([url, { fileName }]) => (
                                    <option key={url} value={url}>{fileName || url}</option>
                                ))}
                            </optgroup>
                        )}
                        {Object.entries(demoNotebooks).map(([category, notebooks]) => (
                            <optgroup key={category} label={category}>
                                {notebooks.map(({ url, title }) => (
                                    <option key={url} value={url}>{title}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                    <button
                        onClick={handleImportFunctions}
                        disabled={isImporting || !selectedNotebook}
                        className="w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                    >
                        {isImporting ? "Importing Functions..." : "Import Notebook Functions"}
                    </button>
                </div>

                <div className="px-4 mb-2">
                    <form onSubmit={handleUrlSubmit} className="mb-2">
                        <div className="flex gap-2 items-center">
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="flex-1 px-2 py-1 border rounded"
                                placeholder="Enter notebook URL (advanced)"
                            />
                            <button
                                type="submit"
                                disabled={isUrlSaving || !url.trim()}
                                className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                            >
                                {isUrlSaving ? 'Adding...' : 'Add'}
                            </button>
                        </div>
                        {saveSuccess && (
                            <div className="mt-2 text-green-600 text-sm">
                                Notebook added successfully!
                            </div>
                        )}
                    </form>
                </div>

                {Object.keys(myNotebooks).length > 0 && (
                    <div className="overflow-x-auto mb-2">
                        <table className="min-w-full bg-white">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b text-left">Custom Notebooks</th>
                                    <th className="py-2 px-4 border-b"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(myNotebooks).map(([url, notebook]) => (
                                    <tr key={url}>
                                        <td className="py-2 px-4 border-b">
                                            <a href={url} target="_blank" rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline">
                                                {notebook.fileName || 'Untitled'}
                                            </a>
                                        </td>
                                        <td className="py-2 px-4 border-b w-fit text-right">
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

