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
    loadFunctions,  // Changed from onFunctionSaved
    unsavedCode,
    setUnsavedCode
}) => {
    const [notification, setNotification] = React.useState("");
    const [isLLMOpen, setIsLLMOpen] = React.useState(false);
    const [showConfirmModal, setShowConfirmModal] = React.useState(false);
    const [isFunctionDialogOpen, setIsFunctionDialogOpen] = React.useState(false);
    const [pendingFunction, setPendingFunction] = React.useState(null);
    const notificationTimeoutRef = React.useRef();
    const editorRef = React.useRef(null);

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

            if (selectedFunction.prompt) {
                parsedFunction.prompt = selectedFunction.prompt;
            }

            await saveWorkbookOnly(parsedFunction);  // Use saveWorkbookOnly instead
            showNotification(`${parsedFunction.signature} saved!`, "success");
            await loadFunctions();
            setSelectedFunction({
                ...parsedFunction,
                source: 'workbook'
            });
            setUnsavedCode(null); // Clear unsaved code after successful save
        } catch (err) {
            if (!(err instanceof TokenExpiredError)) {
                showNotification(err.message, "error");
            }
        }
    };

    const handleRun = async () => {
        const currentCode = editorRef.current.getValue();
        setUnsavedCode(currentCode);
        try {
            const parsedFunction = await parsePython(currentCode);
            setIsFunctionDialogOpen(true);
        } catch (err) {
            showNotification(err.message, "error");
            window.dispatchEvent(new CustomEvent(EventTypes.ERROR, { detail: err.message }));
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
                errorMessage: `[Test] Error: ${err.message}`,
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
                        setUnsavedCode(value); // Only track unsaved changes, don't update selectedFunction
                    }}
                />
            </div>
            {notification && (
                <div className={`mt-2 p-2 rounded ${notification.type === "success" ? "bg-green-50 text-green-900" : "bg-red-100 text-red-800"}`}>
                    {notification.message}
                </div>
            )}
            {selectedFunction.name === "" && (
                <div className="mt-2 p-2 bg-yellow-100 rounded">
                    <h2 className="font-semibold"> ⬅️ Drag task pane open for more room.</h2>
                    <ul className="list-disc pl-5">
                        <li>Your code MUST BE A FUNCTION!</li>
                        <li>Save will update code if function already exists.</li>
                        <li>See <a href="https://www.boardflare.com/apps/excel/python/documentation" target="_blank" rel="noopener" className="text-blue-500 underline">documentation</a> for details.</li>
                    </ul>
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
                <div className="space-x-2">
                    <button onClick={handleRun} className="px-2 py-1 bg-green-500 text-white rounded">Run</button>
                    <button onClick={handleTest} className="hidden">Test</button>
                    <button onClick={handleSave} className="px-2 py-1 bg-blue-500 text-white rounded">Save</button>
                    <button onClick={() => setIsLLMOpen(true)} className="px-2 py-1 bg-purple-500 text-white rounded">AI✨</button>
                </div>
            </div>

            {/* Add modal UI */}
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
                isOpen={isFunctionDialogOpen}
                onClose={() => setIsFunctionDialogOpen(false)}
                selectedFunction={selectedFunction}
            />
        </div>
    );
};

export default EditorTab;
