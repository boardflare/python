import * as React from "react";
import { deleteFunctionFromSettings } from "../utils/workbookSettings";
import OneDrive from "./OneDrive";
import { pyLogs } from "../utils/logs";
import FunctionDialog from "./FunctionDialog";
import { saveToOneDriveOnly } from "../utils/save";  // Add back import
import AddFunctions from "./AddFunctions";

// Add new state variable for refreshing OneDrive
const FunctionsTab = ({
    onEdit,
    workbookFunctions,
    isLoading,
    error,
    loadFunctions,
    isPreview
}) => {
    const [deleteConfirm, setDeleteConfirm] = React.useState(null);
    const [localError, setError] = React.useState(error || null);
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [selectedFunction, setSelectedFunction] = React.useState(null);
    const [oneDriveLoaded, setOneDriveLoaded] = React.useState(false);
    const [refreshOneDriveKey, setRefreshOneDriveKey] = React.useState(0);
    // Add state for platform detection
    const [isWebPlatform, setIsWebPlatform] = React.useState(false);

    // Use effect to sync error prop with local state
    React.useEffect(() => {
        setError(error);
    }, [error]);

    // useEffect to detect Office Online platform
    React.useEffect(() => {
        setIsWebPlatform(Office?.context?.diagnostics?.platform === 'OfficeOnline');
    }, []);

    const handleDelete = async (functionName) => {
        try {
            await deleteFunctionFromSettings(functionName);
            await loadFunctions();
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting function:', error);
            setError('Failed to delete function');
        }
    };

    const handleSaveToOneDrive = async (func) => {
        try {
            await saveToOneDriveOnly(func);
            setError(null);
            pyLogs({
                ref: 'save_to_onedrive_success',
                code: func.code
            });
            // Refresh OneDrive functions
            setRefreshOneDriveKey(prev => prev + 1);
        } catch (error) {
            console.error('Error saving to OneDrive:', error);
            setError(error.message);
            pyLogs({
                ref: 'save_to_onedrive_error',
                message: `Save to OneDrive error: ${error.message}`,
                code: func.code
            });
        }
    };

    // Styled table for Workbook Functions
    const WorkbookFunctionTable = ({ functions }) => (
        <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto">
                <table className="min-w-full bg-white">
                    <tbody>
                        {functions.map((func) => (
                            <tr key={func.name}>
                                <td className="py-1 px-2 border-b w-full">
                                    <div className="relative group w-full">
                                        <span className="font-mono cursor-help text-left block w-full">={func.name.toUpperCase()}</span>
                                        {func.description && (
                                            <div className="absolute left-0 top-full mt-2 w-64 p-2 bg-blue-50 text-black text-sm rounded shadow-lg hidden group-hover:block z-10">
                                                {func.description}
                                            </div>
                                        )}
                                    </div>
                                </td>
                                <td className="py-1 px-2 border-b w-24 text-center">
                                    <div className="flex gap-2 justify-end">
                                        <button
                                            className="text-blue-500 hover:text-blue-700"
                                            onClick={() => {
                                                setSelectedFunction(func);
                                                setDialogOpen(true);
                                            }}
                                            title="Run function"
                                        >
                                            ▶️
                                        </button>
                                        <button
                                            className="text-blue-500 hover:text-blue-700"
                                            onClick={() => onEdit({ ...func, source: 'workbook' })}
                                            title="Edit function"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                        </button>
                                        {oneDriveLoaded && (
                                            <button
                                                className="text-blue-500 hover:text-blue-700"
                                                onClick={() => handleSaveToOneDrive(func)}
                                                title="Save to OneDrive"
                                            >
                                                ⬇️
                                            </button>
                                        )}
                                        <button
                                            className="text-red-500 hover:text-red-700 text-lg"
                                            onClick={() => setDeleteConfirm({ name: func.name })}
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

                <div className="shrink-0 px-4 py-2 bg-gray-100 font-bold text-center">
                    Workbook
                </div>
                {workbookFunctions.length > 0 && (
                    <WorkbookFunctionTable functions={workbookFunctions} />
                )}

                {!isLoading && workbookFunctions.length === 0 && (
                    <div className="text-center mb-2 mt-1">Try adding an example function below.</div>
                )}

                {/* !isWebPlatform removed so OneDrive is always shown */}
                {/* {!isWebPlatform && ( */}
                <div className="mt-0">
                    <OneDrive
                        onEdit={onEdit}
                        isPreview={isPreview}
                        onLoadComplete={setOneDriveLoaded}
                        refreshKey={refreshOneDriveKey}
                        onWorkbookRefresh={loadFunctions}
                    />
                </div>
                {/* )} */}

                <div className="mt-2">
                    <AddFunctions loadFunctions={loadFunctions} />
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
                                onClick={() => handleDelete(deleteConfirm.name)}
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

