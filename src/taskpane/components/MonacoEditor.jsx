import * as React from "react";
import Editor from "@monaco-editor/react";

export const MonacoEditor = ({ value, onChange, onMount }) => {
    const editorRef = React.useRef(null);

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        if (onMount) {
            onMount(editor, monaco);
        }
    };

    return (
        <Editor
            height="100%"
            width="100%"
            language="python"
            value={value}
            options={{
                fontSize: 14,
                automaticLayout: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                folding: false,
                lineNumbersMinChars: 2
            }}
            onChange={onChange}
            onMount={handleEditorDidMount}
        />
    );
};
