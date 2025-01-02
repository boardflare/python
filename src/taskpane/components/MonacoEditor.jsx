import * as React from "react";
import PropTypes from "prop-types";
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
            language="python"
            value={value}
            theme="vs"
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

MonacoEditor.propTypes = {
    value: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    onMount: PropTypes.func
};
