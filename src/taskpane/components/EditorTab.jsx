import * as React from "react";
import { MonacoEditor } from "./MonacoEditor";
import { saveFunctionToSettings, getFunctionFromSettings } from "../utils/workbookSettings";
import { DEFAULT_CODE } from "../utils/constants";
import { parsePython } from "../utils/codeparser";
import { EventTypes } from "../utils/constants";
import { updateNameManager } from "../utils/nameManager";
import { singleDemo } from "../utils/demo";
import { runTests } from "../utils/testRunner";

const EditorTab = ({ selectedFunction, setSelectedFunction, onTest }) => {
    const [notification, setNotification] = React.useState("");
    const [functions, setFunctions] = React.useState([]);
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
        const loadFunctions = async () => {
            try {
                const funcs = await getFunctionFromSettings();
                setFunctions(funcs);
            } catch (err) {
                showNotification(err.message, "error");  // Use notification instead of error
            }
        };
        loadFunctions();
    }, []);

    React.useEffect(() => {
        if (selectedFunction.name && editorRef.current) {
            const func = functions.find(f => f.name === selectedFunction.name);
            if (func && !selectedFunction.code) {  // Only update if code is not already set
                editorRef.current.setValue(func.code);
                setSelectedFunction(func);
            }
        }
    }, [selectedFunction.name, functions]);

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        if (selectedFunction.code) {
            editor.setValue(selectedFunction.code);
        } else if (selectedFunction.name) {
            const func = functions.find(f => f.name === selectedFunction.name);
            if (func) {
                editor.setValue(func.code);
            }
        } else {
            editor.setValue(DEFAULT_CODE);
        }
    };

    const handleSave = async () => {
        try {
            const code = editorRef.current.getValue();
            const parsedFunction = parsePython(code);
            await saveFunctionToSettings(parsedFunction);
            await updateNameManager(parsedFunction);
            showNotification(`${parsedFunction.signature} saved!`, "success");
            const updatedFunctions = await getFunctionFromSettings();
            setFunctions(updatedFunctions);
            setSelectedFunction(parsedFunction);
        } catch (err) {
            showNotification(err.message, "error");
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
            const parsedFunction = parsePython(code);
            window.dispatchEvent(new CustomEvent(EventTypes.CLEAR));
            await runTests(parsedFunction);
            showNotification("Tests completed successfully!", "success");
        } catch (err) {
            showNotification(err.message, "error");
            window.dispatchEvent(new CustomEvent(EventTypes.ERROR, { detail: err.message }));
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-hidden mt-2">
                <MonacoEditor
                    value={selectedFunction.code || DEFAULT_CODE}
                    onMount={handleEditorDidMount}
                    onChange={(value) => setSelectedFunction(prev => ({ ...prev, code: value }))}
                />
            </div>
            {notification && (
                <div className={`mt-2 p-2 rounded ${notification.type === "success" ? "bg-green-50 text-green-900" : "bg-red-100 text-red-800"}`}>
                    {notification.message}
                </div>
            )}
            {selectedFunction.name === "" && (
                <div className="mt-2 p-2 bg-yellow-100 rounded">
                    <h2 className="font-semibold"> ⬅️ Drag task pane open for more room!</h2>
                    <ul className="list-disc pl-5">
                        <li><span className="font-semibold">Reset:</span> returns editor to example function.</li>
                        <li><span className="font-semibold">Test:</span> executes function using test_cases.</li>
                        <li><span className="font-semibold">Save:</span> updates code if function already exists.</li>
                        <li>See <a href="https://whistlernetworks.sharepoint.com/:p:/s/Boardflare/EavKXzTcSmJArk1FadRoH40BaFTd1xrff2cw3bGSRs3AFg?rtime=Mhp28Ns33Ug" target="_blank" rel="noopener" className="text-blue-500 underline">slideshow</a> and <a href="https://www.boardflare.com/apps/excel/python/documentation" target="_blank" rel="noopener" className="text-blue-500 underline">documentation</a> for details.</li>

                    </ul>
                </div>
            )}
            <div className="flex justify-between items-center py-2">
                <select
                    value={selectedFunction.name}
                    onChange={(e) => {
                        const func = functions.find(f => f.name === e.target.value);
                        const newCode = func?.code || DEFAULT_CODE;
                        editorRef.current.setValue(newCode);
                        setSelectedFunction({ name: e.target.value, code: newCode });
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
                    <button onClick={handleTest} className="px-2 py-1 bg-green-500 text-white rounded">Test</button>
                    <button onClick={handleSave} className="px-2 py-1 bg-blue-500 text-white rounded">Save</button>
                </div>
            </div>
        </div>
    );
};

export default EditorTab;
