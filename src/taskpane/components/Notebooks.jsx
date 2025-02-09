import * as React from "react";
import { getStoredNotebooks, addNotebook, removeNotebook, fetchDemoNotebooks, fetchNotebookUrl, DEFAULT_NOTEBOOK } from "../utils/notebooks";
import { saveFunctionToSettings } from "../utils/workbookSettings";
import { updateNameManager } from "../utils/nameManager";

const Notebooks = ({ onImportComplete }) => {
    const [myNotebooks, setMyNotebooks] = React.useState({});
    const [demoNotebooks, setDemoNotebooks] = React.useState({});
    const [url, setUrl] = React.useState('');
    const [isUrlSaving, setIsUrlSaving] = React.useState(false);
    const [saveSuccess, setSaveSuccess] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [isImporting, setIsImporting] = React.useState(false);
    const [selectedNotebook, setSelectedNotebook] = React.useState(DEFAULT_NOTEBOOK);

    React.useEffect(() => {
        const loadData = async () => {
            try {
                const [stored, demos] = await Promise.all([
                    getStoredNotebooks(),
                    fetchDemoNotebooks()
                ]);
                setMyNotebooks(stored);
                setDemoNotebooks(demos);
            } catch (error) {
                setError('Failed to load notebooks');
                console.error('Error loading notebooks:', error);
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
            const notebooks = await getStoredNotebooks();
            setMyNotebooks(notebooks);
            setUrl('');
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            setError(`Failed to add notebook: ${error.message}`);
        } finally {
            setIsUrlSaving(false);
        }
    };

    const handleRemove = async (url) => {
        try {
            await removeNotebook(url);
            const notebooks = await getStoredNotebooks();
            setMyNotebooks(notebooks);
        } catch (error) {
            setError('Failed to remove notebook');
        }
    };

    const handleImport = async () => {
        setIsImporting(true);
        try {
            const { functions } = await fetchNotebookUrl(selectedNotebook);

            for (const func of functions) {
                await saveFunctionToSettings(func);
                await updateNameManager(func);
            }

            onImportComplete();
            setError(null);
        } catch (error) {
            console.error("Error importing functions:", error);
            setError("Failed to import functions");
        } finally {
            setIsImporting(false);
        }
    };

    return (
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
                    onClick={handleImport}
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
    );
};

export default Notebooks;
