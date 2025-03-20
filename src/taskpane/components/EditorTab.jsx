import * as React from "react";
import { MonacoEditor } from "./MonacoEditor";
import LLM from "./LLM";
import FunctionDialog from "./FunctionDialog";
import { DEFAULT_CODE } from "../utils/constants";
import { parsePython } from "../utils/codeparser";
import { EventTypes } from "../utils/constants";
import { runTests } from "../utils/testRunner";
import { TokenExpiredError } from "../utils/drive";
import { saveWorkbookOnly } from "../utils/save";  // Change import
import { pyLogs } from "../utils/logs";

const EditorTab = ({
    selectedFunction,
    setSelectedFunction,
    onTest,
    generatedCode,
    setGeneratedCode,
    functionsCache,
    workbookFunctions,
    onedriveFunctions,
    loadFunctions,
    unsavedCode,
    setUnsavedCode
}) => {
    const [notification, setNotification] = React.useState("");
    const [isLLMOpen, setIsLLMOpen] = React.useState(false);
    const [showConfirmModal, setShowConfirmModal] = React.useState(false);
    const [pendingFunction, setPendingFunction] = React.useState(null);
    const [showFunctionDialog, setShowFunctionDialog] = React.useState(false);
    const notificationTimeoutRef = React.useRef();
    const editorRef = React.useRef(null);
    const functionDialogOpenRef = React.useRef(false);

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
        }, 10000);
    };

    React.useEffect(() => {
        return () => {
            if (notificationTimeoutRef.current) {
                clearTimeout(notificationTimeoutRef.current);
            }
        };
    }, []);

    React.useEffect(() => {
        if (!editorRef.current) return;

        if (generatedCode) {
            editorRef.current.setValue(generatedCode);
            setGeneratedCode(null); // Clear after setting
            return;
        }

        if (unsavedCode !== null) {
            editorRef.current.setValue(unsavedCode);
            return;
        }

        const source = selectedFunction?.source || 'workbook';
        const id = source === 'workbook' ? selectedFunction?.name : selectedFunction?.fileName;
        const cacheKey = `${source}-${id}`;
        const cachedFunc = functionsCache.current.get(cacheKey);

        if (cachedFunc?.code && editorRef.current?.setValue) {
            editorRef.current.setValue(cachedFunc.code);
        } else if (selectedFunction?.code && editorRef.current?.setValue) {
            editorRef.current.setValue(selectedFunction.code);
        } else if (editorRef.current?.setValue) {
            editorRef.current.setValue(DEFAULT_CODE);
        }
    }, [selectedFunction?.name, selectedFunction?.fileName, generatedCode]); // Remove unsavedCode dependency

    // Add cleanup
    React.useEffect(() => {
        return () => {
            editorRef.current = null;
            setNotification("");
        };
    }, []);

    React.useEffect(() => {
        loadFunctions();
    }, []);

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        if (selectedFunction?.code) {
            editor.setValue(selectedFunction.code);
        } else {
            editor.setValue(DEFAULT_CODE);
        }
    };

    const handleSave = async () => {
        try {
            const code = editorRef.current.getValue();
            const parsedFunction = await parsePython(code);
            const updatedFunction = {
                ...selectedFunction,
                ...parsedFunction
            };

            const savedFunction = await saveWorkbookOnly(updatedFunction);
            await loadFunctions();
            setSelectedFunction({
                ...savedFunction,
                source: 'workbook'
            });
            setUnsavedCode(null);

            if (savedFunction.noName) {
                showNotification(`Saved! Click "Run Function" to insert in a cell.`, "success");
            } else {
                showNotification(`${savedFunction.signature} saved!`, "success");
            }
        } catch (err) {
            if (!(err instanceof TokenExpiredError)) {
                showNotification(err.message, "error");
            }
        }
    };

    const handleTest = async () => {
        const currentCode = editorRef.current.getValue();
        setUnsavedCode(currentCode);
        onTest();
        try {
            const parsedFunction = await parsePython(currentCode);
            await runTests(parsedFunction);
            showNotification("Tests completed successfully!", "success");
            pyLogs({
                message: `[Test] Function ${parsedFunction.name} tested successfully`,
                code: parsedFunction.code,
                ref: 'test_success'
            });
        } catch (err) {
            showNotification(err.message, "error");
            window.dispatchEvent(new CustomEvent(EventTypes.ERROR, { detail: err.message }));
            pyLogs({
                message: `[Test] Error: ${err.message}`,
                code: editorRef.current.getValue(),
                ref: 'test_error'
            });
        }
    };

    // Updated onSuccess callback from LLM – now only updates the UI.
    const handleLLMSuccess = (savedFunction, prompt) => {
        editorRef.current.setValue(savedFunction.code);
        setSelectedFunction({ ...savedFunction, source: 'workbook' });
        showNotification(`Function saved successfully!`, "success");
    };

    const handleFunctionChange = (func) => {
        if (func) {
            setSelectedFunction({
                ...func,
                source: 'workbook'
            });
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
            <div className="flex-1 overflow-hidden mt-2">
                <MonacoEditor
                    value={selectedFunction?.code || DEFAULT_CODE}
                    onMount={handleEditorDidMount}
                    onChange={(value) => {
                        setUnsavedCode(value);
                    }}
                />
            </div>

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
                    <button onClick={handleTest} className="px-2 py-1 bg-gray-500 text-white rounded">Test</button>
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
