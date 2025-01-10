import * as React from "react";
import { MonacoEditor } from "./MonacoEditor";
import { DISPLAY_CODE } from "../utils/constants";
import { exampleFunctions } from "../utils/examples";
import { parsePython } from "../utils/codeparser";
import { saveFunctionToSettings } from "../utils/workbookSettings";
import { updateNameManager } from "../utils/nameManager";

const HomeTab = ({ onEditorClick }) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [notification, setNotification] = React.useState("");
    const notificationTimeoutRef = React.useRef();

    const showNotification = (message, type = "success") => {
        if (notificationTimeoutRef.current) {
            clearTimeout(notificationTimeoutRef.current);
        }
        setNotification({ message, type });
        notificationTimeoutRef.current = setTimeout(() => {
            setNotification("");
        }, 5000);
    };

    React.useEffect(() => {
        return () => {
            if (notificationTimeoutRef.current) {
                clearTimeout(notificationTimeoutRef.current);
            }
        };
    }, []);

    const handleImportDemos = async () => {
        setIsLoading(true);
        try {
            for (const code of exampleFunctions) {
                const parsedFunction = parsePython(code);
                await saveFunctionToSettings(parsedFunction);
                await updateNameManager(parsedFunction);
            }
            showNotification("Demo functions added successfully!", "success");
        } catch (error) {
            console.error("Error importing demo functions:", error);
            showNotification("Error importing demo functions", "error");
        }
        setIsLoading(false);
    };

    return (
        <>
            <div className="p-2 mb-5">
                <h2 className="text-center text-lg font-semibold mb-2">Python functions in Excel</h2>
                <div className="py-1 bg-gray-200 shadow-md rounded-lg p-3 mb-4">
                    <p><span className="font-bold">Step 1:</span> Write a Python function in the <span className="text-blue-500 underline cursor-pointer" onClick={onEditorClick}>editor</span>.</p>
                    <div className="py-2 h-[100px]">
                        <MonacoEditor
                            value={DISPLAY_CODE}
                            onMount={(editor) => {
                                editor.updateOptions({ readOnly: true });
                            }}
                        />
                    </div>
                </div>
                <div className="py-1 bg-gray-200 shadow-md rounded-lg p-4 mb-4">
                    <p><span className="font-bold">Step 2:</span> Save it to create a LAMBDA function.</p>
                    <div className="p-1 mt-1 bg-white"><code>=HELLO("Annie")</code> <br /><code>Hello Annie!</code></div>
                </div>
                <p className="mb-1">Check out the <a href="https://www.boardflare.com/apps/excel/python/tutorial" target="_blank" rel="noopener" className="text-blue-500 underline">tutorial video</a> and <a href="https://www.boardflare.com/apps/excel/python/documentation" target="_blank" rel="noopener" className="text-blue-500 underline">documentation</a>. Use the <span className="text-blue-500 underline cursor-pointer" onClick={onEditorClick}>code editor</span> to create and edit functions.</p>
                <p className="mb-1">  We'd appreciate your <a href="https://www.boardflare.com/company/support" target="_blank" rel="noopener" className="text-blue-500 underline">feedback</a> if you find any bugs or have suggestions.🙂</p>
                <button
                    onClick={handleImportDemos}
                    disabled={isLoading}
                    className="text-sm mt-4 px-3 py-1 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:bg-gray-300 mx-auto block"
                >
                    {isLoading ? "Importing..." : "Add Demo Functions"}
                </button>
                {notification && (
                    <div className={`mt-2 text-center p-2 rounded ${notification.type === "success" ? "bg-green-50 text-green-900" : "bg-red-100 text-red-800"}`}>
                        {notification.message}
                    </div>
                )}
            </div>
        </>
    );
};

export default HomeTab;
