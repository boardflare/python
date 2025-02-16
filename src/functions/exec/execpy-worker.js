// Web worker that executes Python code using Pyodide.

importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js");
import setupCode from './setup.py';
import resultCode from './result.py';

async function loadPyodideAndPackages() {
    self.pyodide = await loadPyodide();
    await self.pyodide.loadPackage(["micropip", "pyodide_http"]);
    self.micropip = self.pyodide.pyimport("micropip");

    // Import and patch pyodide_http
    const pyodide_http = self.pyodide.pyimport("pyodide_http");
    pyodide_http.patch_all();
}

let pyodideReadyPromise = loadPyodideAndPackages();

self.onmessage = async (event) => {
    await pyodideReadyPromise;
    const { code, arg1, graphToken } = event.data;

    let stdout = "";
    self.pyodide.setStdout({ batched: (msg) => { stdout += msg + "\n"; } });
    self.pyodide.setStderr({ batched: (msg) => { stdout += msg + "\n"; } });

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

        // Set global args array from arg1 to args
        if (arg1) {
            self.pyodide.globals.set('global_args', arg1);
        }

        // Set graphToken as global if provided
        if (graphToken) {
            self.pyodide.globals.set('graphToken', graphToken);
        }

        // Run setup code
        await self.pyodide.runPythonAsync(setupCode, { filename: "setup.py" });

        // Run user code
        await self.pyodide.runPythonAsync(code, { filename: "user_code" });

        // Run result conversion code
        const pyodideResult = await self.pyodide.runPythonAsync(resultCode, { filename: "result.py" });

        const result = pyodideResult?.toJs ? pyodideResult.toJs({ create_proxies: false }) : pyodideResult;
        self.postMessage({ result, stdout });
    } catch (error) {
        self.postMessage({ error: error.message, stdout });
    }
};