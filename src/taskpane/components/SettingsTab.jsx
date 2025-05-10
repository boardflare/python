import * as React from "react";
import { getScopes, storeScopes } from "../utils/indexedDB";
import { authenticateWithDialog } from "./Auth";

const REQUIRED_SCOPES = [
    "openid", "profile", "email", "offline_access",
    "User.Read", "Files.ReadWrite.AppFolder"
];

const SettingsTab = ({ loadFunctions }) => {
    const [scopes, setScopes] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        const fetchScopes = async () => {
            const storedScopes = await getScopes();
            setScopes(storedScopes);
        };
        fetchScopes();
    }, []);

    const handleScopeChange = (event) => {
        const { name, checked } = event.target;
        setScopes((prevScopes) => {
            if (checked) {
                return [...prevScopes, name];
            } else {
                return prevScopes.filter((scope) => scope !== name);
            }
        });
    };

    const updateToken = async () => {
        setIsLoading(true);
        try {
            // Always include required scopes
            const mergedScopes = Array.from(new Set([...scopes, ...REQUIRED_SCOPES]));
            await storeScopes(mergedScopes);
            await authenticateWithDialog();
            loadFunctions?.(); // Call loadFunctions after successful token update
        } catch (error) {
            console.error("Error updating token:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-2">
            <div className="mb-2">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-left font-semibold">Microsoft Permissions</h2>
                        <span
                            className="cursor-help"
                            title="Add permissions here to access data using your Microsoft account."
                        >
                            ℹ️
                        </span>
                    </div>
                    <button
                        onClick={updateToken}
                        className="px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-normal"
                        disabled={isLoading}
                    >
                        Refresh Login
                    </button>
                </div>
                <div className="">
                    <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="Files.ReadWrite"
                                checked={scopes.includes("Files.ReadWrite")}
                                onChange={handleScopeChange}
                            />
                            Files.ReadWrite
                        </label>
                        <span className="text-sm text-gray-600">
                            Read and write your OneDrive files.
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="Files.ReadWrite.All"
                                checked={scopes.includes("Files.ReadWrite.All")}
                                onChange={handleScopeChange}
                            />
                            Files.Read.All
                        </label>
                        <span className="text-sm text-gray-600">
                            Read all shared files in SharePoint or OneDrive.
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="Mail.Read"
                                checked={scopes.includes("Mail.Read")}
                                onChange={handleScopeChange}
                            />
                            Mail.Read
                        </label>
                        <span className="text-sm text-gray-600">
                            Read your email messages.
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="Mail.ReadWrite"
                                checked={scopes.includes("Mail.ReadWrite")}
                                onChange={handleScopeChange}
                            />
                            Mail.ReadWrite
                        </label>
                        <span className="text-sm text-gray-600">
                            Read and write your email messages.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsTab;
