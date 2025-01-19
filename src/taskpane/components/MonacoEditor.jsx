import * as React from "react";
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

export const MonacoEditor = ({ value, onChange, onMount }) => {
    const containerRef = React.useRef(null);
    const editorRef = React.useRef(null);

    React.useEffect(() => {
        if (!containerRef.current) return;

        const editor = monaco.editor.create(containerRef.current, {
            value: value,
            language: 'python',
            fontSize: 14,
            automaticLayout: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            folding: false,
            lineNumbersMinChars: 2
        });

        editor.onDidChangeModelContent(() => {
            const newValue = editor.getValue();
            onChange?.(newValue);
        });

        editorRef.current = editor;
        if (onMount) {
            onMount(editor, monaco);
        }

        return () => {
            editor.dispose();
        };
    }, []);

    React.useEffect(() => {
        if (editorRef.current && value !== editorRef.current.getValue()) {
            editorRef.current.setValue(value);
        }
    }, [value]);

    return <div ref={containerRef} className="h-full w-full" />;
};
