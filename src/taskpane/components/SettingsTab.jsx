import * as React from "react";
import { getScopes, storeScopes, storeToken, parseTokenClaims } from "./Auth";

const SettingsTab = () => {
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
        await storeScopes(scopes);

        try {
            let dialogUrl;
            if (window.location.href.includes("preview")) {
                dialogUrl = "https://addins.boardflare.com/python/preview/auth.html";
            } else if (window.location.href.includes("prod")) {
                dialogUrl = "https://addins.boardflare.com/python/prod/auth.html";
            } else {
                dialogUrl = window.location.origin + "/auth.html";
            }
            await new Promise((resolve, reject) => {
                Office.context.ui.displayDialogAsync(
                    dialogUrl,
                    { height: 60, width: 30 },
                    (result) => {
                        if (result.status === Office.AsyncResultStatus.Failed) {
                            reject(new Error(result.error.message));
                        }

                        const dialog = result.value;
                        dialog.addEventHandler(Office.EventType.DialogMessageReceived, async (args) => {
                            dialog.close();
                            const message = JSON.parse(args.message);
                            if (message.status === 'error') {
                                reject(new Error(message.errorData.message));
                            } else {
                                const tokenObj = {
                                    auth_token: message.msalResponse?.accessToken,
                                    graphToken: message.graphToken,
                                    tokenClaims: parseTokenClaims(message.msalResponse?.accessToken)
                                };
                                await storeToken(tokenObj);
                                resolve();
                            }
                        });
                    }
                );
            });
        } catch (error) {
            console.error("Error updating token:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <div className="mb-4">
                <h3 className="font-semibold">Microsoft Graph Permissions</h3>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            name="Files.ReadWrite"
                            checked={scopes.includes("Files.ReadWrite")}
                            onChange={handleScopeChange}
                        />
                        Files.ReadWrite
                    </label>
                </div>
                <div>
                    <label>
                        <input
                            type="checkbox"
                            name="Files.ReadWrite.All"
                            checked={scopes.includes("Files.ReadWrite.All")}
                            onChange={handleScopeChange}
                        />
                        Files.ReadWrite.All
                    </label>
                </div>
                <button
                    onClick={updateToken}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    disabled={isLoading}
                >
                    Update Token
                </button>
            </div>
        </div>
    );
};

export default SettingsTab;
