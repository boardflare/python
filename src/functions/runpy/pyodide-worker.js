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

    // Add test runner function
    self.pyodide.runPython(`
def run_tests(func, test_cases):
    for i, args in enumerate(test_cases):
        result = func(*args)
        excel_formula = f"={func.__name__.upper()}({', '.join(map(str, args))})"
        print(f"Case {i+1}: {args} -> {result} | Excel: {excel_formula}")
    `);

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

        // Set global args array from arg1 to args
        const args = arg1 ? arg1 : null;

        // Check if any args are arrays larger than 1x1
        const largerArrays = args?.some(arr => arr && (arr.length !== 1 || arr[0].length !== 1));

        // Use pandas only if in imports
        const usePandas = imports.includes("pandas") // || largerArrays;

        // Set individual globals from args
        if (args) {
            // Set the args array in Python
            self.pyodide.globals.set('args', args);

            if (usePandas) {
                // Automatically convert array args to DataFrames if using pandas
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
        let result = await self.pyodide.runPythonAsync(code);

        // Check if there's a result in Python globals
        const hasGlobalResult = self.pyodide.runPython(`'result' in globals()`);

        if (hasGlobalResult) {
            // Use Python convert_result() for all type checking and conversion
            if (usePandas) {
                self.pyodide.runPython(convert_result_pandas);
            } else {
                self.pyodide.runPython(convert_result_list);
            }
            result = self.pyodide.runPython(`convert_result()`);
        } else {
            // Handle direct function returns with JS validation
            if (result === undefined) {
                throw new Error("Your function returned None. If you wanted a blank cell, return an empty string ('') instead.");
            }

            const isValidScalar = (value) => ['number', 'string', 'boolean'].includes(typeof value);

            if (isValidScalar(result)) {
                result = [[result]];
            } else if (Array.isArray(result)) {
                if (result.length === 0) {
                    throw new Error("Result must be a scalar of type int, float, str, bool or a 2D list.");
                }

                if (!result.every(Array.isArray)) {
                    if (!result.every(isValidScalar)) {
                        throw new Error("All elements must be valid scalar types: int, float, str, bool.");
                    }
                    result = [result];
                }

                if (result.every(Array.isArray)) {
                    const innerLength = result[0].length;
                    result.forEach(innerArray => {
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
        if (result.toJs) {
            result = result.toJs({ create_proxies: false });
        }

        self.postMessage({ result, stdout });
    } catch (error) {
        self.postMessage({ error: error.message, stdout });
    }
};