import * as React from "react";
import { MonacoEditor } from "./MonacoEditor";
import LLM from "./LLM";
import FunctionDialog from "./FunctionDialog";
import { DEFAULT_CODE } from "../utils/constants";
import { parsePython } from "../utils/codeparser";
import { saveWorkbookOnly } from "../utils/save";
import { pyLogs } from "../utils/logs";

const EditorTab = ({
    selectedFunction,
    setSelectedFunction,
    generatedCode,
    setGeneratedCode,
    workbookFunctions,
    loadFunctions,
    unsavedCode,
    setUnsavedCode,
    error
}) => {
    const [notification, setNotification] = React.useState("");
    const [isLLMOpen, setIsLLMOpen] = React.useState(false);
    const [showConfirmModal, setShowConfirmModal] = React.useState(false);
    const [pendingFunction, setPendingFunction] = React.useState(null);
    const [showFunctionDialog, setShowFunctionDialog] = React.useState(false);
    const [localError, setLocalError] = React.useState(error || null);
    const notificationTimeoutRef = React.useRef();
    const editorRef = React.useRef(null);
    const functionDialogOpenRef = React.useRef(false);

    // Update localError when prop changes
    React.useEffect(() => {
        setLocalError(error);
    }, [error]);

    // Update the ref whenever dialog state changes
    React.useEffect(() => {
        functionDialogOpenRef.current = showFunctionDialog;
    }, [showFunctionDialog]);

    const showNotification = (message, type = "success") => {
        if (notificationTimeoutRef.current) {
            clearTimeout(notificationTimeoutRef.current);
        }
        setNotification({ message, type });
        notificationTimeoutRef.current = setTimeout(() => {
            setNotification("");
        }, 7000);
    };

    React.useEffect(() => {
        if (!editorRef.current) return;

        if (generatedCode) {
            editorRef.current.setValue(generatedCode);
            setGeneratedCode(null); // Clear after setting
            return;
        }

        // Only update editor from selectedFunction or default code, not from unsavedCode
        // since unsavedCode is already set by the editor itself via onChange
        if (selectedFunction?.code && editorRef.current?.setValue && unsavedCode === null) {
            editorRef.current.setValue(selectedFunction.code);
        } else if (editorRef.current?.setValue && unsavedCode === null) {
            editorRef.current.setValue(DEFAULT_CODE);
        }
    }, [selectedFunction, generatedCode, unsavedCode]);

    // Combined cleanup effect
    React.useEffect(() => {
        return () => {
            // Clear any pending notification timeouts
            if (notificationTimeoutRef.current) {
                clearTimeout(notificationTimeoutRef.current);
            }
            // Clean up component resources
            editorRef.current = null;
            setNotification("");
            // Log component mounting
            pyLogs({ message: "Editor mounted.", ref: "editor_mounted" });
        };
    }, []);

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        if (unsavedCode !== null) {
            editor.setValue(unsavedCode);
        } else if (selectedFunction?.code) {
            editor.setValue(selectedFunction.code);
        } else {
            editor.setValue(DEFAULT_CODE);
        }
    };

    const handleSave = async () => {
        try {
            setLocalError(null); // Clear any previous errors
            const code = editorRef.current.getValue();
            const parsedFunction = await parsePython(code);

            // selectedFunction will have added metadata like prompt, function dialog args, etc.
            const updatedFunction = {
                ...selectedFunction,
                ...parsedFunction
            };

            const savedFunction = await saveWorkbookOnly(updatedFunction);
            await loadFunctions();
            setSelectedFunction(savedFunction); // removed source property
            setUnsavedCode(null);

            // Custom message if the save used the delay method
            if (savedFunction.noName) {
                showNotification(`Saved! Click "Run Function" to insert in a cell.`, "success");
            } else {
                showNotification(`${savedFunction.signature} saved!`, "success");
            }
        } catch (err) {
            await pyLogs({ message: err.message, ref: "handleSave_error" });
            showNotification(err.message, "error");
        }
    };

    const handleRun = async () => {
        try {
            const currentCode = editorRef.current.getValue();
            setUnsavedCode(currentCode);

            // Check if we need to create a function first
            if (!selectedFunction.name) {
                // Use the existing handleSave method to save the function first
                await handleSave();
            }

            // Now open the function dialog - handleSave will have created the function if needed
            setShowFunctionDialog(true);
        } catch (err) {
            await pyLogs({ message: err.message, ref: "handleRun_error" });
            showNotification(err.message, "error");
        }
    };

    // Updated onSuccess callback from LLM – now only updates the UI.
    const handleLLMSuccess = (savedFunction, prompt) => {
        editorRef.current.setValue(savedFunction.code);
        setSelectedFunction(savedFunction); // removed source property
        showNotification(`Function saved successfully!`, "success");
    };

    const handleFunctionChange = (func) => {
        if (func) {
            setSelectedFunction(func); // removed source property
            setUnsavedCode(null);
        } else {
            setSelectedFunction({ name: "", code: DEFAULT_CODE });
            setUnsavedCode(null);
        }
        setPendingFunction(null);
        setShowConfirmModal(false);
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {localError && (
                <div className="p-2 text-red-600 bg-red-50 mb-2 text-center">
                    {localError}
                </div>
            )}

            {notification && (
                <div className={`mt-2 p-4 rounded ${notification.type === "success" ? "bg-green-50 text-green-900" : "bg-red-100 text-red-800"} flex justify-between items-center`}>
                    <span>{notification.message}</span>
                    {notification.type === "success" && selectedFunction && selectedFunction.name && (
                        <button
                            onClick={() => setShowFunctionDialog(true)}
                            className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-700"
                        >
                            Run Function
                        </button>
                    )}
                </div>
            )}

            <div className="flex-1 overflow-hidden mt-2">
                <MonacoEditor
                    value={selectedFunction?.code || DEFAULT_CODE}
                    onMount={handleEditorDidMount}
                    onChange={(value) => {
                        setUnsavedCode(value);
                    }}
                />
            </div>

            <div className="flex justify-between items-center py-2">
                <select
                    value={selectedFunction ? selectedFunction.name : ""}
                    onChange={(e) => {
                        const func = workbookFunctions.find(f => f.name === e.target.value);
                        if (unsavedCode && unsavedCode !== selectedFunction?.code) {
                            setPendingFunction(func);
                            setShowConfirmModal(true);
                        } else {
                            handleFunctionChange(func);
                        }
                    }}
                    className="px-2 py-1 border rounded"
                >
                    <option value="">Select a function...</option>
                    {workbookFunctions.length > 0 && workbookFunctions.map(f => (
                        <option key={f.name} value={f.name}>
                            {f.name}
                        </option>
                    ))}
                </select>
                <div className="space-x-1">
                    <button onClick={handleSave} className="px-2 py-1 bg-blue-500 text-white rounded">Save</button>
                    {/* <button onClick={handleRun} className="px-2 py-1 bg-green-500 text-white rounded">Run</button> */}
                    <button onClick={() => setIsLLMOpen(true)} className="px-2 py-1 bg-purple-500 text-white rounded">AI✨</button>
                </div>
            </div>

            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-4 rounded-lg shadow-lg max-w-sm w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Unsaved Changes</h3>
                        <p className="mb-4">You have unsaved changes. Click Cancel to return to the Editor and save them.</p>
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleFunctionChange(pendingFunction)}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Discard Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <LLM
                isOpen={isLLMOpen}
                onClose={() => setIsLLMOpen(false)}
                onSuccess={handleLLMSuccess}
                prompt={selectedFunction.prompt}
                loadFunctions={loadFunctions} // NEW: pass loadFunctions for refreshing functions list
            />

            <FunctionDialog
                isOpen={showFunctionDialog}
                onClose={() => {
                    setShowFunctionDialog(false);
                }}
                selectedFunction={selectedFunction}
                loadFunctions={loadFunctions}
            />
        </div>
    );
};

export default EditorTab;
