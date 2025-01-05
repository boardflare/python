import * as React from "react";
import { MonacoEditor } from "./MonacoEditor";
import { saveFunctionToSettings, getFunctionFromSettings } from "../utils/workbookSettings";
import { DEFAULT_CODE } from "../utils/constants";
import { parsePython } from "../utils/codeparser";
import { runPy } from "../../functions/runpy/controller";
import { EventTypes } from "../utils/constants";

const EditorTab = ({ initialFunction, onTest }) => {
    const [notification, setNotification] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [functions, setFunctions] = React.useState([]);
    const [selectedFunction, setSelectedFunction] = React.useState("");
    const notificationTimeoutRef = React.useRef();
    const editorRef = React.useRef(null);

    const showNotification = (message, type = "success") => {
        if (notificationTimeoutRef.current) {
            clearTimeout(notificationTimeoutRef.current);
        }
        setNotification({ message, type });
        notificationTimeoutRef.current = setTimeout(() => {
            setNotification("");
        }, 3000);
    };

    React.useEffect(() => {
        return () => {
            if (notificationTimeoutRef.current) {
                clearTimeout(notificationTimeoutRef.current);
            }
        };
    }, []);

    React.useEffect(() => {
        const loadFunctions = async () => {
            try {
                setIsLoading(true);
                const funcs = await getFunctionFromSettings();
                setFunctions(funcs);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        loadFunctions();
    }, []);

    React.useEffect(() => {
        if (initialFunction && editorRef.current) {
            const func = functions.find(f => f.name === initialFunction);
            if (func) {
                editorRef.current.setValue(func.code);
                setSelectedFunction(initialFunction);
            }
        }
    }, [initialFunction, functions]);

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
    };

    const handleSave = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const code = editorRef.current.getValue();
            const parsedFunction = parsePython(code);
            const result = await saveFunctionToSettings(parsedFunction);
            if (result) {
                showNotification("Function saved successfully!");
                const updatedFunctions = await getFunctionFromSettings();
                setFunctions(updatedFunctions);
                setSelectedFunction(parsedFunction.name);
                // No need to setValue here as the editor already has the correct code
            } else {
                showNotification("Failed to save function", "error");
            }
        } catch (err) {
            setError(err.message);
            showNotification(err.message, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        if (editorRef.current) {
            editorRef.current.setValue(DEFAULT_CODE);
            setSelectedFunction("");
            setError(null);
            setNotification("");
        }
    };

    const handleTest = async () => {
        onTest(); // Call this first to switch tabs immediately
        try {
            setIsLoading(true);
            setError(null);
            const code = editorRef.current.getValue();
            const parsedFunction = parsePython(code);
            window.dispatchEvent(new CustomEvent(EventTypes.CLEAR));
            for (let i = 0; i < parsedFunction.examples.length; i++) {
                const example = parsedFunction.examples[i];
                window.dispatchEvent(new CustomEvent(EventTypes.LOG, { detail: `Running: =${parsedFunction.name.toUpperCase()}(${example.join(', ')})` }));
                const result = await runPy(parsedFunction.code, parsedFunction.examplesAsRunpyArgs[i]);
                window.dispatchEvent(new CustomEvent(EventTypes.LOG, { detail: JSON.stringify(result) }));
            }
        } catch (err) {
            setError(err.message);
            window.dispatchEvent(new CustomEvent(EventTypes.ERROR, { detail: err.message }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="text-left">
                ⬅️ Drag task pane open for more space.
            </div>
            <div className="flex-1 overflow-hidden mt-2">
                <MonacoEditor
                    value={DEFAULT_CODE}
                    onMount={handleEditorDidMount}
                />
            </div>
            {notification && (
                <div className={`mt-2 p-2 rounded ${notification.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {notification.message}
                </div>
            )}
            {error && <div className="mt-2 p-2 bg-red-100 text-red-800 rounded">{error}</div>}
            {selectedFunction === "" && (
                <div className="mt-2 p-2 bg-yellow-100 rounded">
                    <h2 className="font-semibold mb-1">
                        💡Quick Tips: <span className="font-normal">see also <a href="https://www.boardflare.com/apps/excel/python/tutorial" target="_blank" rel="noopener" className="text-blue-500 underline">video</a> and <a href="https://www.boardflare.com/apps/excel/python/documentation" target="_blank" rel="noopener" className="text-blue-500 underline">documentation</a>.</span>
                    </h2>
                    <ul className="text-yellow-800 list-disc pl-5">
                        <li><span className="font-semibold">Naming:</span> Excel function names and arguments will be the same as the Python function.</li>
                        <li><span className="font-semibold">Docstrings:</span> First line in docstring becomes the function description in Excel.</li>
                        <li><span className="font-semibold">Arguments:</span> Array arguments in Excel are converted to Pandas DataFrames.</li>
                        <li><span className="font-semibold">Examples:</span> Examples will be used when you click the Run button.</li>
                    </ul>
                </div>
            )}
            <div className="flex justify-between items-center py-2">
                <select
                    value={selectedFunction}
                    onChange={(e) => {
                        const selectedCode = functions.find(f => f.name === e.target.value)?.code || DEFAULT_CODE;
                        editorRef.current.setValue(selectedCode);
                        setSelectedFunction(e.target.value);
                    }}
                    className="px-2 py-1 border rounded"
                >
                    <option value="">Select a function...</option>
                    {functions.map(f => (
                        <option key={f.name} value={f.name}>{f.name}</option>
                    ))}
                </select>
                <div className="space-x-2">
                    <button onClick={handleReset} className="px-2 py-1 bg-gray-200 rounded">Reset</button>
                    <button onClick={handleTest} className="px-2 py-1 bg-green-500 text-white rounded">Run</button>
                    <button onClick={handleSave} className="px-2 py-1 bg-blue-500 text-white rounded">Save</button>
                </div>
            </div>
        </div>
    );
};

export default EditorTab;
