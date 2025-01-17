import { exec } from "../../functions/functions";
import { singleDemo } from "./demo";

export async function runTests(parsedFunction) {
    const testCode = `

# code to run
${parsedFunction.code}

result = "No result"

try:
    test_cases
    has_test_cases = True
except NameError:
    print("No test_cases variable found. Please define 'test_cases' list/tuple with your test inputs.  See documentation on website for details.")
    has_test_cases = False

if has_test_cases:
    for test_args in test_cases:
        try:
            # Simplified argument handling
            if isinstance(test_args, (list, tuple)):
                args_str = ", ".join(repr(arg) for arg in test_args)
                test_result = ${parsedFunction.name}(*test_args)
            else:
                args_str = repr(test_args)
                test_result = ${parsedFunction.name}(test_args)
            print(f"${parsedFunction.name}({args_str}) --> {test_result}")
        except Exception as e:
            print(f"Error: {str(e)}")
        print()  # Add a newline after each test case

    `.trim();

    let pyResult;
    try {
        pyResult = await exec(testCode, null);
    } catch (error) {
        console.error("Python test error:", error);
        pyResult = `Error running Python tests: ${error.message}`;
    }

    // Run Excel demo independently if it exists
    if (parsedFunction.excelExample) {
        try {
            await singleDemo(parsedFunction);
        } catch (error) {
            console.error("Excel demo error:", error);
            // Continue execution - don't let Excel error affect Python result
        }
    }

    return pyResult;
}