import * as React from "react";
import { loadFunctionFiles } from "../utils/drive";
import { saveWorkbookOnly } from "../utils/save";
import { parsePython } from "../utils/codeparser";
import { storeScopes, authenticateWithDialog } from "./Auth";
import { pyLogs } from "../utils/logs";

const OneDrive = ({
    onedriveFunctions,
    isLoading,
    folderUrl,
    loadFunctions,
    onDelete,
    error: parentError
}) => {
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

    const handleLogin = async () => {
        try {
            await storeScopes(["Files.ReadWrite"]);
            await authenticateWithDialog();
            loadFunctions?.();
            pyLogs({
                message: "[OneDrive] Successfully logged in with Files.ReadWrite scope",
                ref: 'onedrive_login_success'
            });
        } catch (error) {
            console.error("Error logging in:", error);
            pyLogs({
                errorMessage: `[OneDrive] Login error: ${error.message}`,
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
                    {folderUrl && (
                        <button onClick={loadFunctions} className="text-blue-500 hover:text-blue-700"
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
                Login to OneDrive enables saving functions to your OneDrive and adding them to other workbooks.  It requires adding the Files.ReadWrite permission.
                </div>
                <button
                    onClick={handleLogin}
                    className="px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-normal"
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
        </>
    );
};

export default OneDrive;
