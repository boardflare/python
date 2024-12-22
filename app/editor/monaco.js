let editor;

const DEFAULT_CODE = `def hello(name):
    """Say hello to someone
    
    Args:
        name (str): Person's name
        
    Returns:
        str: Greeting message
    """
    return f"Hello {name}!"`;

window.require.config({
    paths: {
        vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.0/min/vs'
    }
});

window.require(['vs/editor/editor.main'], function () {
    editor = monaco.editor.create(document.getElementById('monaco-editor-container'), {
        value: DEFAULT_CODE,
        language: 'python',
        theme: 'vs-dark',
        minimap: { enabled: false },
        fontSize: 14,
        lineHeight: 21,
        automaticLayout: true
    });
});

document.getElementById('editor-tab').addEventListener('shown.bs.tab', () => {
    if (editor) editor.layout();
});

document.getElementById('saveBtn').addEventListener('click', async () => {
    const code = editor.getValue();
    // TODO: Implement save functionality
    console.log('Saving:', { code });
});

document.getElementById('cancelBtn').addEventListener('click', () => {
    // TODO: Implement cancel functionality
    console.log('Cancel clicked');
});