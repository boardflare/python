// Web worker that executes Python code using Pyodide.

importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js");

async function loadPyodideAndPackages() {
    self.pyodide = await loadPyodide();
    await self.pyodide.loadPackage(["micropip", "pandas"]);
    self.micropip = pyodide.pyimport("micropip");
}

let pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {
    await pyodideReadyPromise;
    const { code, arg1 } = event.data;

    // Clear the global state at the beginning
    self.pyodide.globals.clear();

    let stdout = "";

    // Reinitialize stdout and stderr handlers
    self.pyodide.setStdout({
        batched: (msg) => {
            stdout += msg + "\n";
        }
    });

    self.pyodide.setStderr({
        batched: (msg) => {
            stdout += "STDERR: " + msg + "\n";
        }
    });

    try {
        // Find imports in the Python code
        const imports = self.pyodide.pyodide_py.code.find_imports(code).toJs();

        // Load the imports that are not in sys.modules
        if (imports && imports.length > 0) {
            const sys = self.pyodide.pyimport("sys");
            const missingImports = imports.filter(pkg => !(pkg in sys.modules.toJs()));
            if (missingImports.length > 0) {
                await self.micropip.install(missingImports);
            }
        }

        // Execute the Python code
        let result = await self.pyodide.runPythonAsync(code);

        self.postMessage({ result, stdout });
    } catch (error) {
        self.postMessage({ error: error.message, stdout });
    }
};