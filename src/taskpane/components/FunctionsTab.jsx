import * as React from "react";
import { getFunctionFromSettings, deleteFunctionFromSettings } from "../utils/workbookSettings";
import { TokenExpiredError, deleteFile, loadFunctionFiles } from "../utils/drive";
import { runTests } from "../utils/testRunner";
import Notebooks from "./Notebooks";
import SharedFunctions from "./SharedFunctions";
import FunctionDialog from "./FunctionDialog";

const FunctionsTab = ({
    onEdit,
    onTest,
    functionsCache,
    workbookFunctions,
    onedriveFunctions,
    isLoading,
    error,
    loadFunctions, // This function refreshes both workbook and OneDrive functions
    folderUrl
}) => {
    const [deleteConfirm, setDeleteConfirm] = React.useState(null);
    const [dialogFunction, setDialogFunction] = React.useState(null);

    // Remove any useEffect hooks that might be calling loadFunctions

    const handleDelete = async (functionName, source, fileName) => {
        try {
            if (source === 'workbook') {
                await deleteFunctionFromSettings(functionName);
            } else {
                await deleteFile(fileName);
            }
            await loadFunctions();
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting function:', error);
            setError(error instanceof TokenExpiredError ? error.message : 'Failed to delete function');
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

    const FunctionTable = ({ functions, source }) => (
        <div className="overflow-x-auto">
            <h3 className="font-semibold mb-1 text-center flex items-center justify-center gap-2">
                {source === 'workbook' ? 'Workbook Functions' : (
                    <>
                        {folderUrl ? (
                            <a
                                href={folderUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-blue-500"
                                title="Open in OneDrive"
                            >
                                OneDrive Functions
                            </a>
                        ) : (
                            'OneDrive Functions'
                        )}
                        <button
                            onClick={loadFunctions}
                            className="text-blue-500 hover:text-blue-700"
                            title="Refresh OneDrive functions"
                        >
                            🔄
                        </button>
                    </>
                )}
            </h3>
            <table className="min-w-full bg-white mb-6">
                <tbody>
                    {functions.map((func) => (
                        <tr key={source === 'workbook' ? func.name : func.fileName}>
                            <td className="py-0 px-2 border-b">
                                <code className="font-mono text-sm">{func.name.toUpperCase()}</code>
                            </td>
                            <td className="py-0 px-2 border-b w-fit">
                                <div className="flex gap-2 justify-end">
                                    {window.location.hostname === 'localhost' && (
                                        <button
                                            className="text-gray-500 hover:text-gray-700"
                                            onClick={() => setDialogFunction(func)}
                                            title="Use function"
                                        >
                                            ⬆️
                                        </button>
                                    )}
                                    <button
                                        className="text-green-500 hover:text-green-700"
                                        onClick={() => handleTest(func)}
                                        title="Run tests"
                                    >
                                        ▶️
                                    </button>
                                    <button
                                        className="text-blue-500 hover:text-blue-700"
                                        onClick={() => {
                                            const cacheKey = `${source}-${source === 'workbook' ? func.name : func.fileName}`;
                                            const cachedFunc = functionsCache.current.get(cacheKey);
                                            if (cachedFunc) {
                                                onEdit({
                                                    ...cachedFunc,
                                                    source: source
                                                });
                                            }
                                        }}
                                        title="Edit function"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                    </button>
                                    <button
                                        className="text-red-500 hover:text-red-700 text-lg"
                                        onClick={() => setDeleteConfirm({ name: func.name, source, fileName: func.fileName })}
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
    );

    return (
        <div className="h-full flex flex-col overflow-y-auto">
            {error && (
                <div className="p-2 text-red-600 bg-red-50 mb-4 text-center">
                    {error}
                </div>
            )}

            <div className="mt-2">
                {workbookFunctions.length > 0 && (
                    <FunctionTable functions={workbookFunctions} source="workbook" />
                )}

                {!isLoading && !folderUrl && (
                    <div className="p-2 bg-blue-50 text-gray-800 rounded-lg mb-1">
                        <div className="flex items-center justify-center mb-2">
                            <span className="font-semibold">OneDrive Functions</span>
                        </div>
                        <p className="">
                            Add Files.ReadWrite permission in settings ⚙️ and refresh login to save functions to OneDrive also and use in other workbooks.
                        </p>
                    </div>
                )}

                {isLoading ? (
                    <div className="p-4 text-gray-900 text-center">
                        Loading OneDrive functions...
                    </div>
                ) : (
                    onedriveFunctions.length > 0 && (
                        <FunctionTable functions={onedriveFunctions} source="onedrive" />
                    )
                )}

                {!isLoading && workbookFunctions.length === 0 && onedriveFunctions.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-5 text-center text-gray-600">
                        <div className="text-4xl mb-4">📝</div>
                        <div className="text-base mb-2">No functions found</div>
                        <div>Create a function using the <button onClick={() => onEdit("")} className="text-blue-500 hover:text-blue-700 hover:underline">Editor</button>, or select a notebook below to import example functions.  Check out the <a href="https://www.boardflare.com/apps/excel/python" target="_blank" rel="noopener" className="text-blue-500 underline">tutorial video</a> and <a href="https://www.boardflare.com/apps/excel/python" target="_blank" rel="noopener" className="text-blue-500 underline">documentation</a>.</div>
                    </div>
                )}
            </div>

            <Notebooks onImportComplete={() => loadFunctions()} />
            <SharedFunctions onImportComplete={() => loadFunctions()} />

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
                                onClick={() => handleDelete(deleteConfirm.name, deleteConfirm.source, deleteConfirm.fileName)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <FunctionDialog
                isOpen={dialogFunction !== null}
                onClose={() => setDialogFunction(null)}
                selectedFunction={dialogFunction || {}}
            />
        </div>
    );
};

export default FunctionsTab;

