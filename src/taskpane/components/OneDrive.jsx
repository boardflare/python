import * as React from "react";
import { loadFunctionFiles, deleteFile, TokenExpiredError } from "../utils/drive";
import { saveWorkbookOnly } from "../utils/save";
import { parsePython } from "../utils/codeparser";
import { storeScopes } from "../utils/indexedDB";
import { authenticateWithDialog } from "./Auth";
import { pyLogs } from "../utils/logs";

const OneDrive = ({ onEdit, isPreview, onLoadComplete, refreshKey, onWorkbookRefresh }) => {
    const [error, setError] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [onedriveFunctions, setOnedriveFunctions] = React.useState([]);
    const [folderUrl, setFolderUrl] = React.useState(null);
    const [deleteConfirm, setDeleteConfirm] = React.useState(null);

    const loadOnedriveFunctions = async () => {
        try {
            setIsLoading(true);
            setOnedriveFunctions([]); // Clear first

            const { driveFunctions, folderUrl } = await loadFunctionFiles();
            setOnedriveFunctions(driveFunctions || []);
            setFolderUrl(folderUrl);
            setError(null);
            onLoadComplete?.(true); // Signal successful load
        } catch (error) {
            console.error('Error loading OneDrive functions:', error);
            setOnedriveFunctions([]);
            if (!(error instanceof TokenExpiredError)) {
                setError('Failed to load OneDrive functions');
            }
            onLoadComplete?.(false); // Signal failed load
        } finally {
            setIsLoading(false);
        }
    };

    // Run loadOnedriveFunctions when refreshKey changes (also on mount)
    React.useEffect(() => {
        loadOnedriveFunctions();
    }, [refreshKey]);

    const handleSync = async (func) => {
        try {
            const { driveFunctions } = await loadFunctionFiles();
            const freshFunc = driveFunctions?.find(f => f.name === func.name);
            if (!freshFunc) {
                throw new Error('Function no longer exists in OneDrive');
            }
            const reparsedFunc = await parsePython(freshFunc.code); // Needed to ensure environment is set correctly for local, preview, etc.
            await saveWorkbookOnly(reparsedFunc);
            if (onWorkbookRefresh) await onWorkbookRefresh(); // refresh workbook functions
            await loadOnedriveFunctions();
            setError(null);
            pyLogs({
                ref: 'onedrive_sync_success',
                code: func.code
            });
        } catch (error) {
            console.error('Error syncing function:', error);
            setError(error.message || 'Failed to sync function to workbook');
            pyLogs({
                ref: 'onedrive_sync_error',
                message: `[OneDrive] Sync error: ${error.message}`,
                code: func.code
            });
        }
    };

    const handleDelete = async (func) => {
        try {
            await deleteFile(func.fileName);
            await loadOnedriveFunctions();
            setDeleteConfirm(null);
            pyLogs({
                ref: 'onedrive_delete_success',
                code: func.code
            });
        } catch (error) {
            console.error('Error deleting function:', error);
            setError(error.message || 'Failed to delete function');
            pyLogs({
                ref: 'onedrive_delete_error',
                message: `[OneDrive] Delete error: ${error.message}`,
                code: func.code
            });
        }
    };

    const handleLogin = async () => {
        try {
            const updatedScopes = await storeScopes(["Files.ReadWrite"]); // Capture returned scopes
            console.log('Updated scopes:', updatedScopes);
            await authenticateWithDialog();
            loadOnedriveFunctions?.();
            pyLogs({
                ref: 'onedrive_login_success'
            });
        } catch (error) {
            console.error("Error logging in:", error);
            pyLogs({
                message: `[OneDrive] Login error: ${error.message}`,
                ref: 'onedrive_login_error'
            });
        }
    };

    const OneDriveFunctionsHeader = () => {
        return (
            <div className="mb-1">
                <h3 className="font-semibold text-center flex items-center justify-center gap-2">
                    <div className="flex items-center">
                        <a href={folderUrl} target="_blank" rel="noopener noreferrer"
                            className="hover:text-blue-500" title="Open in OneDrive">
                            OneDrive Functions
                        </a>
                    </div>
                    {folderUrl && isPreview && (
                        <button onClick={loadOnedriveFunctions} className="text-blue-500 hover:text-blue-700"
                            title="Refresh OneDrive functions">
                            🔄
                        </button>
                    )}
                </h3>
            </div>
        );
    };

    if (!folderUrl) {
        return (
            <div className="flex flex-col items-center">
                <OneDriveFunctionsHeader />
                <div className="text-gray-500 px-2 mb-2">
                    Login to OneDrive to save functions to OneDrive and use them with other workbooks.
                </div>
                <button
                    onClick={handleLogin}
                    className="px-2 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-normal"
                >
                    Login to OneDrive
                </button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <>
                <OneDriveFunctionsHeader />
                <div className="p-4 text-gray-900 text-center">
                    Loading OneDrive functions...
                </div>
            </>
        );
    }

    if (onedriveFunctions.length === 0 && folderUrl) {
        return (
            <div>
                <OneDriveFunctionsHeader />
                <div className="text-center text-sm text-gray-500 mb-4">
                    No OneDrive functions found
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-x-auto">
                <OneDriveFunctionsHeader />
                <table className="min-w-full bg-white mb-2">
                    <tbody>
                        {onedriveFunctions.map((func) => (
                            <tr key={func.fileName}>
                                <td className="py-0 px-2 border-b">
                                    <code className="font-mono text-sm">{func.name.toUpperCase()}</code>
                                </td>
                                <td className="py-0 px-2 border-b w-fit">
                                    <div className="flex gap-2 justify-end">
                                        <button className="text-blue-500 hover:text-blue-700"
                                            onClick={() => handleSync(func)}
                                            title="Save to workbook">
                                            ⬆️
                                        </button>
                                        <button className="text-red-500 hover:text-red-700 text-lg"
                                            onClick={() => setDeleteConfirm(func)}
                                            title="Delete function">
                                            ❌
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div className="text-gray-500 px-2 mb-2 text-center">
                    ⬇️ to save from Workbook to OneDrive<br />
                    ⬆️ to save from OneDrive to Workbook<br />
                    Saving updates a function with the same name.
                </div>
            </div>

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-lg max-w-sm w-full">
                        <h3 className="text-lg font-semibold mb-4">Delete Function</h3>
                        <p className="mb-4">Are you sure you want to delete "{deleteConfirm.name}"?</p>
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
        </>
    );
};

export default OneDrive;
