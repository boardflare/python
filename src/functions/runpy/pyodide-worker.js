// Web worker that executes Python code using Pyodide.

importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js");
import { convert_result_pandas, convert_result_list } from "./convert_result.js";

async function loadPyodideAndPackages() {
    self.pyodide = await loadPyodide();
    await self.pyodide.loadPackage(["micropip"]);
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

        // empty cell passes [[null]] as arg
        // skipping args with commas passes null as arg
        // unfilled optional args in LAMBDA passes FALSE, so [[false]] as arg
        // no args passed, arg1 is []

        // Set global args array from arg1 to args, args is array of matrices, e.g. [[[2]], [[5]], ...]
        const args = arg1 ? arg1 : null;

        // Use pandas only if it is present in imports to avoid loading it unnecessarily.
        const usePandas = imports.includes("pandas") // || largerArrays;

        // Set individual globals from args if it is defined.
        if (args) {
            // Set the args array in Python to be used in the code
            self.pyodide.globals.set('args', args);

            if (usePandas) {
                // Convert array args to DataFrames if using pandas
                await self.pyodide.loadPackage(["pandas"]);
                self.pyodide.runPython(`
                    import pandas as pd
                    import numpy as np
                    import micropip
                    
                    for index, value in enumerate(args):
                        if value is None:
                            globals()[f'arg{index + 1}'] = None
                            continue
                        
                        df = pd.DataFrame(value)
                        
                        if df.size == 1:
                            single_value = df.iloc[0, 0]
                            if isinstance(single_value, (type(None), str, bool)):
                                value = single_value
                            else:
                                value = single_value.item()
                        else:
                            value = df
                        
                        globals()[f'arg{index + 1}'] = value
                `);
            } else {
                // Use lists for all other cases.
                self.pyodide.runPython(`
                    import micropip
                    
                    for index, value in enumerate(args):
                        if value is None:
                            globals()[f'arg{index + 1}'] = None
                            continue
                        
                        if len(value) == 1 and len(value[0]) == 1:
                            single_value = value[0][0]
                            globals()[f'arg{index + 1}'] = single_value
                        else:
                            globals()[f'arg{index + 1}'] = value
                `);
            }
        }

        // Execute the Python code
        let pyodideResult = await self.pyodide.runPythonAsync(code);

        // Check if there's a result variable in Python globals
        const hasGlobalResult = self.pyodide.runPython(`'result' in globals()`);

        if (hasGlobalResult) {
            // Use Python convert_result() for all type checking and conversion
            if (usePandas) {
                self.pyodide.runPython(convert_result_pandas);
            } else {
                self.pyodide.runPython(convert_result_list);
            }
            pyodideResult = self.pyodide.runPython(`convert_result()`); // update pyodideResult with convert_result() output
        } else {
            // Legacy: Handle direct function returns with JS validation
            if (pyodideResult === undefined) {
                throw new Error("Your function returned None. If you wanted a blank cell, return an empty string ('') instead.");
            }

            const isValidScalar = (value) => ['number', 'string', 'boolean'].includes(typeof value);

            if (isValidScalar(pyodideResult)) {
                pyodideResult = [[pyodideResult]];
            } else if (Array.isArray(pyodideResult)) {
                if (pyodideResult.length === 0) {
                    throw new Error("Result must be a scalar of type int, float, str, bool or a 2D list.");
                }

                if (!pyodideResult.every(Array.isArray)) {
                    if (!pyodideResult.every(isValidScalar)) {
                        throw new Error("All elements must be valid scalar types: int, float, str, bool.");
                    }
                    pyodideResult = [pyodideResult];
                }

                if (pyodideResult.every(Array.isArray)) {
                    const innerLength = pyodideResult[0].length;
                    pyodideResult.forEach(innerArray => {
                        if (innerArray.length !== innerLength) {
                            throw new Error("All rows must have the same length.");
                        }
                        if (!innerArray.every(isValidScalar)) {
                            throw new Error("All elements must be valid scalar types: int, float, str, bool.");
                        }
                    });
                } else {
                    throw new Error("Result must be a valid 2D list.");
                }
            } else {
                throw new Error("Result must be a scalar or 2D list.");
            }
        }

        // Convert to JavaScript array if needed
        if (pyodideResult.toJs) {
            pyodideResult = pyodideResult.toJs({ create_proxies: false });
        }

        self.postMessage({ result: pyodideResult, stdout });
    } catch (error) {
        self.postMessage({ error: error.message, stdout });
    }
};