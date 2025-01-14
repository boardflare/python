import { runPy } from "../../functions/runpy/controller";

export async function runTests(parsedFunction) {
    const testCode = `
import micropip
await micropip.install(["pyodide_http"])
import pyodide_http
pyodide_http.patch_all()

${parsedFunction.code}

result = "No result"

try:
    test_cases
    has_test_cases = True
except NameError:
    print("No test_cases variable found. Please define 'test_cases' list/tuple with your test inputs.  See documentation on website for details.")
    has_test_cases = False

if has_test_cases:
    for args in test_cases:
        try:
            # Simplified argument handling
            if isinstance(args, (list, tuple)):
                args_str = ", ".join(repr(arg) for arg in args)
                test_result = ${parsedFunction.name}(*args)
            else:
                args_str = repr(args)
                test_result = ${parsedFunction.name}(args)
            print(f"${parsedFunction.name}({args_str}) --> {test_result}")
        except Exception as e:
            print(f"Error: {str(e)}")
        print()  # Add a newline after each test case
    `.trim();

    return await runPy(testCode, null);
}