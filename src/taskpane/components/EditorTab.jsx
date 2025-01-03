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

    const showNotification = (message) => {
        if (notificationTimeoutRef.current) {
            clearTimeout(notificationTimeoutRef.current);
        }
        setNotification(message);
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
                setFunctions(await getFunctionFromSettings());
                setSelectedFunction(parsedFunction.name); // Use parsedFunction directly
            } else {
                showNotification("Failed to save function");
            }
        } catch (err) {
            setError(err.message);
            showNotification("Error saving function");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        if (editorRef.current) {
            editorRef.current.setValue(DEFAULT_CODE);
            setSelectedFunction("");
        }
    };

    const handleTest = async () => {
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
            onTest();
        } catch (err) {
            setError(err.message);
            window.dispatchEvent(new CustomEvent(EventTypes.ERROR, { detail: err.message }));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-hidden mt-2">
                <MonacoEditor
                    value={DEFAULT_CODE}
                    onMount={handleEditorDidMount}
                />
            </div>
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
                <div>
                    <button onClick={handleReset} className="px-4 py-2 bg-gray-200 rounded m-2">Reset</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
                    <button onClick={handleTest} className="px-4 py-2 bg-green-500 text-white rounded">Test</button>
                </div>
            </div>
            {notification && <div className="mt-2 text-green-600">{notification}</div>}
            {error && <div className="mt-2 text-red-600">{error}</div>}
        </div>
    );
};

export default EditorTab;
