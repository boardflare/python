import * as React from "react";
import { deleteFunctionFromSettings } from "../utils/workbookSettings";
import { TokenExpiredError, deleteFile } from "../utils/drive";
import { runTests } from "../utils/testRunner";
import Notebooks from "./Notebooks";
import OneDrive from "./OneDrive";
import { saveToOneDriveOnly } from "../utils/save";
import { pyLogs } from "../utils/logs";  // Add this import
import FunctionDialog from "./FunctionDialog";  // Add this import

const FunctionsTab = ({
    onEdit,
    onTest,
    functionsCache,
    workbookFunctions,
    onedriveFunctions,
    isLoading,
    error,
    loadFunctions,
    folderUrl,
    isPreview
}) => {
    const [deleteConfirm, setDeleteConfirm] = React.useState(null);
    const [localError, setError] = React.useState(error || null);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [selectedFunction, setSelectedFunction] = React.useState(null);

    // Use effect to sync error prop with local state
    React.useEffect(() => {
        setError(error);
    }, [error]);

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

    const handleSaveToOneDrive = async (func) => {
        try {
            await saveToOneDriveOnly(func);
            await loadFunctions();
            setError(null);
            pyLogs({
                ref: 'save_to_onedrive_success',
                code: func.code
            });
        } catch (error) {
            console.error('Error saving to OneDrive:', error);
            setError(error.message);
            pyLogs({
                ref: 'save_to_onedrive_error',
                errorMessage: `Save to OneDrive error: ${error.message}`,
                code: func.code
            });
        }
    };

    const WorkbookFunctionTable = ({ functions }) => (
        <div className="overflow-x-auto">
            <h3 className="font-semibold mb-1 text-center">Workbook Functions</h3>
            <table className="min-w-full bg-white mb-6">
                <tbody>
                    {functions.map((func) => (
                        <tr key={func.name}>
                            <td className="py-0 px-2 border-b">
                                <code className="font-mono text-sm">{func.name.toUpperCase()}</code>
                            </td>
                            <td className="py-0 px-2 border-b w-fit">
                                <div className="flex gap-2 justify-end">
                                    <button
                                        className="text-blue-500 hover:text-blue-700"
                                        onClick={() => {
                                            const cacheKey = `workbook-${func.name}`;
                                            const cachedFunc = functionsCache.current.get(cacheKey);
                                            if (cachedFunc) {
                                                setSelectedFunction(cachedFunc);
                                                setDialogOpen(true);
                                            }
                                        }}
                                        title="Run function"
                                    >
                                        ▶️
                                    </button>
                                    {folderUrl && (
                                        <button
                                            className="text-blue-500 hover:text-blue-700"
                                            onClick={async () => {
                                                const cacheKey = `workbook-${func.name}`;
                                                const cachedFunc = functionsCache.current.get(cacheKey);
                                                if (cachedFunc) {
                                                    await handleSaveToOneDrive(cachedFunc);
                                                }
                                            }}
                                            title="Save to OneDrive"
                                        >
                                            ⬇️
                                        </button>
                                    )}
                                    <button
                                        className="text-blue-500 hover:text-blue-700"
                                        onClick={() => {
                                            const cacheKey = `workbook-${func.name}`;
                                            const cachedFunc = functionsCache.current.get(cacheKey);
                                            if (cachedFunc) {
                                                onEdit({
                                                    ...cachedFunc,
                                                    source: 'workbook'
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
                                        onClick={() => setDeleteConfirm({ name: func.name, source: 'workbook' })}
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
            {localError && (
                <div className="p-2 text-red-600 bg-red-50 mb-4 text-center">
                    {localError}
                </div>
            )}

            <div className="mt-2">
                {workbookFunctions.length > 0 && (
                    <WorkbookFunctionTable functions={workbookFunctions} />
                )}

                <OneDrive
                    onedriveFunctions={onedriveFunctions}
                    isLoading={isLoading}
                    folderUrl={folderUrl}
                    loadFunctions={loadFunctions}
                    onEdit={onEdit}
                    onTest={handleTest}
                    functionsCache={functionsCache}
                    error={localError}
                    onDelete={(func) => setDeleteConfirm({ name: func.name, source: 'onedrive', fileName: func.fileName })}
                    isPreview={isPreview}
                />

                {!isLoading && workbookFunctions.length === 0 && onedriveFunctions.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-5 text-center text-gray-600">
                        <div className="text-4xl mb-4">📝</div>
                        <div className="text-base mb-2">No functions found</div>
                        <div>Create a function using the <button onClick={() => onEdit("")} className="text-blue-500 hover:text-blue-700 hover:underline">Editor</button>, or select a notebook below to import example functions.  Check out the <a href="https://www.boardflare.com/apps/excel/python" target="_blank" rel="noopener" className="text-blue-500 underline">tutorial video</a> and <a href="https://www.boardflare.com/apps/excel/python" target="_blank" rel="noopener" className="text-blue-500 underline">documentation</a>.</div>
                    </div>
                )}
            </div>

            <Notebooks onImportComplete={() => loadFunctions()} />

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
                isOpen={dialogOpen}
                onClose={() => {
                    setDialogOpen(false);
                    setSelectedFunction(null);
                }}
                selectedFunction={selectedFunction}
            />
        </div>
    );
};

export default FunctionsTab;

