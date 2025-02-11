import * as React from "react";
import { MonacoEditor } from "./MonacoEditor";
import LLM from "./LLM"; // Import LLM component
import { saveFunctionToSettings, getFunctionFromSettings } from "../utils/workbookSettings";
import { DEFAULT_CODE } from "../utils/constants";
import { parsePython } from "../utils/codeparser";
import { EventTypes } from "../utils/constants";
import { updateNameManager } from "../utils/nameManager";
import { runTests } from "../utils/testRunner";
import { saveFile, formatAsNotebook, loadFunctionFiles } from "../utils/drive";

const EditorTab = ({ selectedFunction, setSelectedFunction, onTest, generatedCode, setGeneratedCode, functionsCache }) => {
    const [notification, setNotification] = React.useState("");
    const [functions, setFunctions] = React.useState([]);
    const [isLLMOpen, setIsLLMOpen] = React.useState(false);
    const notificationTimeoutRef = React.useRef();
    const editorRef = React.useRef(null);
    const [workbookFunctions, setWorkbookFunctions] = React.useState([]);
    const [onedriveFunctions, setOnedriveFunctions] = React.useState([]);

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

    const loadFunctions = async () => {
        try {
            // Load workbook functions
            const workbookData = await getFunctionFromSettings();
            setWorkbookFunctions(workbookData || []);
            workbookData?.forEach(func => functionsCache.current.set(`workbook-${func.name}`, func));

            // Load OneDrive functions
            const driveFunctions = await loadFunctionFiles();
            setOnedriveFunctions(driveFunctions);
            driveFunctions?.forEach(func => functionsCache.current.set(`onedrive-${func.fileName}`, func));
        } catch (err) {
            showNotification(err.message, "error");
        }
    };

    React.useEffect(() => {
        loadFunctions();
    }, []);

    React.useEffect(() => {
        if (!editorRef.current) return;

        if (generatedCode) {
            editorRef.current.setValue(generatedCode);
            setGeneratedCode(null); // Clear after setting
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
    }, [selectedFunction?.name, selectedFunction?.fileName, generatedCode]);

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

            // Save to OneDrive
            const notebook = formatAsNotebook(parsedFunction);
            try {
                await saveFile(notebook, `${parsedFunction.name}.ipynb`);
            } catch (err) {
                if (!(err instanceof TokenExpiredError)) {
                    throw err;
                }
            }

            // Continue with existing save logic
            await saveFunctionToSettings(parsedFunction);
            await updateNameManager(parsedFunction);
            showNotification(`${parsedFunction.signature} saved!`, "success");

            // Reload functions to update dropdown
            await loadFunctions();

            // Update selected function with source
            setSelectedFunction({
                ...parsedFunction,
                source: 'workbook'  // New functions are always saved to workbook first
            });
        } catch (err) {
            if (!(err instanceof TokenExpiredError)) {
                showNotification(err.message, "error");
            }
        }
    };

    const handleReset = () => {
        if (editorRef.current) {
            editorRef.current.setValue(DEFAULT_CODE);
            setSelectedFunction({ name: "", code: DEFAULT_CODE });
            setNotification(""); // Only clear notification
        }
    };

    const handleTest = async () => {
        onTest();
        try {
            const code = editorRef.current.getValue();
            const parsedFunction = await parsePython(code);
            await runTests(parsedFunction);
            showNotification("Tests completed successfully!", "success");
        } catch (err) {
            showNotification(err.message, "error");
            window.dispatchEvent(new CustomEvent(EventTypes.ERROR, { detail: err.message }));
        }
    };

    const handleLLMSuccess = (generatedCode, prompt) => {
        editorRef.current.setValue(generatedCode);
        setSelectedFunction({ name: selectedFunction.name, code: generatedCode, prompt });
        showNotification("Function generated successfully!", "success");
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-hidden mt-2">
                <MonacoEditor
                    value={selectedFunction?.code || DEFAULT_CODE}
                    onMount={handleEditorDidMount}
                    onChange={(value) => {
                        if (value !== selectedFunction?.code) { // Only update if actually changed
                            setSelectedFunction(prev => ({ ...prev, code: value }));
                        }
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
                        <li>Your code ⚠️MUST BE A FUNCTION!⚠️</li>
                        <li>NO variable (e.g. *args) and optional (e.g. arg=4) args.</li>
                        <li>NO AUTO-SAVE, make sure to save your work.</li>
                        <li>Save: updates code if function already exists.</li>
                        <li>Reset: returns editor to example function.</li>
                        <li>Test: executes function using test_cases.</li>
                        <li>See <a href="https://whistlernetworks.sharepoint.com/:p:/s/Boardflare/EavKXzTcSmJArk1FadRoH40BaFTd1xrff2cw3bGSRs3AFg?rtime=Mhp28Ns33Ug" target="_blank" rel="noopener" className="text-blue-500 underline">slideshow</a> and <a href="https://www.boardflare.com/apps/excel/python/documentation" target="_blank" rel="noopener" className="text-blue-500 underline">documentation</a> for details.</li>
                    </ul>
                </div>
            )}
            <div className="flex justify-between items-center py-2">
                <select
                    value={selectedFunction ? `${selectedFunction.source || 'workbook'}-${selectedFunction.source === 'onedrive' ? selectedFunction.fileName : selectedFunction.name}` : ""}
                    onChange={(e) => {
                        const [source, id] = e.target.value.split('-');
                        const cacheKey = `${source}-${id}`;
                        const func = functionsCache.current.get(cacheKey);
                        if (func) {
                            editorRef.current.setValue(func.code);
                            setSelectedFunction({
                                ...func,
                                source: source
                            });
                        } else {
                            editorRef.current.setValue(DEFAULT_CODE);
                            setSelectedFunction({ name: "", code: DEFAULT_CODE });
                        }
                    }}
                    className="px-2 py-1 border rounded"
                >
                    <option value="">Select a function...</option>
                    {workbookFunctions.length > 0 && (
                        <optgroup label="Workbook Functions">
                            {workbookFunctions.map(f => (
                                <option key={`workbook-${f.name}`} value={`workbook-${f.name}`}>
                                    {f.name}
                                </option>
                            ))}
                        </optgroup>
                    )}
                    {onedriveFunctions.length > 0 && (
                        <optgroup label="OneDrive Functions">
                            {onedriveFunctions.map(f => (
                                <option key={`onedrive-${f.fileName}`} value={`onedrive-${f.fileName}`}>
                                    {f.name}
                                </option>
                            ))}
                        </optgroup>
                    )}
                </select>
                <div className="space-x-2">
                    <button onClick={handleReset} className="px-2 py-1 bg-gray-200 rounded">Reset</button>
                    <button onClick={handleTest} className="px-2 py-1 bg-green-500 text-white rounded">Test</button>
                    <button onClick={handleSave} className="px-2 py-1 bg-blue-500 text-white rounded">Save</button>
                    <button onClick={() => setIsLLMOpen(true)} className="px-2 py-1 bg-purple-500 text-white rounded">AI✨</button>
                </div>
            </div>
            <LLM
                isOpen={isLLMOpen}
                onClose={() => setIsLLMOpen(false)}
                onSuccess={handleLLMSuccess}
                prompt={selectedFunction.prompt}
            />
        </div>
    );
};

export default EditorTab;
