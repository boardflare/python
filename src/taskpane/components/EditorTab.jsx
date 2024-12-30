import * as React from "react";
import { makeStyles, Spinner } from "@fluentui/react-components";
import { MonacoEditor } from "./MonacoEditor";
import { saveFunctionToSettings, getFunctionFromSettings } from "../utils/workbookSettings";
import { DEFAULT_CODE } from "../utils/constants";
import { parsePython } from "../utils/codeparser";

const useStyles = makeStyles({
    root: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden"
    },
    editorContainer: {
        flex: 1,
        overflow: "hidden",
        marginTop: "8px"
    },
    controls: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0"
    }
});

const EditorTab = () => {
    const styles = useStyles();
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

    return (
        <div className={styles.root}>
            <div className={styles.editorContainer}>
                <MonacoEditor
                    value={DEFAULT_CODE}
                    onMount={handleEditorDidMount}
                />
            </div>
            <div className={styles.controls}>
                <select value={selectedFunction} onChange={(e) => {
                    const selectedCode = functions.find(f => f.name === e.target.value)?.code || DEFAULT_CODE;
                    editorRef.current.setValue(selectedCode);
                    setSelectedFunction(e.target.value);
                }}>
                    <option value="">Select a function...</option>
                    {functions.map(f => (
                        <option key={f.name} value={f.name}>{f.name}</option>
                    ))}
                </select>
                <div>
                    <button onClick={handleReset}>Reset</button>
                    <button onClick={handleSave}>Save</button>
                </div>
            </div>
            {notification && <div>{notification}</div>}
            {error && <div className="error-message">{error}</div>}
            {isLoading && <Spinner />}
        </div>
    );
};

export default EditorTab;
