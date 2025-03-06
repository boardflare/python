import * as React from "react";
import { loadFunctionFiles } from "../utils/drive";
import { saveWorkbookOnly } from "../utils/save";
import FunctionDialog from "./FunctionDialog";
import { parsePython } from "../utils/codeparser";

const OneDrive = ({
    onedriveFunctions,
    isLoading,
    folderUrl,
    loadFunctions,
    onEdit,
    onTest,
    functionsCache,
    onDelete,  // Add this prop
    error: parentError
}) => {
    const [showTooltip, setShowTooltip] = React.useState(false);
    const [dialogFunction, setDialogFunction] = React.useState(null);
    const [error, setError] = React.useState(parentError);

    React.useEffect(() => {
        setError(parentError);
    }, [parentError]);

    const handleSync = async (func) => {
        try {
            const { driveFunctions } = await loadFunctionFiles();
            const freshFunc = driveFunctions?.find(f => f.name === func.name);
            if (!freshFunc) {
                throw new Error('Function no longer exists in OneDrive');
            }
            const reparsedFunc = await parsePython(freshFunc.code); // Needed to ensure environment is set correctly for local, preview, etc.
            await saveWorkbookOnly(reparsedFunc);
            await loadFunctions();
            setError(null);
        } catch (error) {
            console.error('Error syncing function:', error);
            setError(error.message || 'Failed to sync function to workbook');
        }
    };

    const OneDriveFunctionsHeader = () => {
        if (!folderUrl) return null;

        return (
            <div className="mb-1">
                <h3 className="font-semibold text-center flex items-center justify-center gap-2">
                    <div className="flex items-center relative">
                        <a href={folderUrl} target="_blank" rel="noopener noreferrer"
                            className="hover:text-blue-500" title="Open in OneDrive">
                            OneDrive Functions
                        </a>
                        <div className="relative ml-1">
                            <span className="text-blue-500 cursor-help text-sm"
                                onMouseEnter={() => setShowTooltip(true)}
                                onMouseLeave={() => setShowTooltip(false)}>
                                ⓘ
                            </span>
                            {showTooltip && (
                                <div className="absolute z-10 w-64 p-2 bg-blue-50 text-gray-800 text-xs rounded-lg shadow-lg left-0 transform -translate-x-1/2 mt-2">
                                    To save functions to OneDrive, add Files.ReadWrite permission in settings ⚙️ and refresh login. Once enabled, edit and save a function to see it in OneDrive.
                                </div>
                            )}
                        </div>
                    </div>
                    <button onClick={loadFunctions} className="text-blue-500 hover:text-blue-700"
                        title="Refresh OneDrive functions">
                        🔄
                    </button>
                </h3>
            </div>
        );
    };

    if (!folderUrl) return null;

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

    if (onedriveFunctions.length === 0) {
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
                <table className="min-w-full bg-white mb-6">
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
                                        {window.location.hostname === 'localhost' && (
                                            <button className="text-gray-500 hover:text-gray-700"
                                                onClick={() => setDialogFunction(func)}
                                                title="Use function">
                                                💻
                                            </button>
                                        )}
                                        <button className="text-blue-500 hover:text-blue-700"
                                            onClick={() => {
                                                const cacheKey = `onedrive-${func.fileName}`;
                                                const cachedFunc = functionsCache.current.get(cacheKey);
                                                if (cachedFunc) {
                                                    onEdit({
                                                        ...cachedFunc,
                                                        source: 'onedrive'
                                                    });
                                                }
                                            }}
                                            title="Edit function">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                        </button>
                                        <button className="text-red-500 hover:text-red-700 text-lg"
                                            onClick={() => onDelete(func)}
                                            title="Delete function">
                                            ❌
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <FunctionDialog
                isOpen={dialogFunction !== null}
                onClose={() => setDialogFunction(null)}
                selectedFunction={dialogFunction || {}}
            />
        </>
    );
};

export default OneDrive;
