import { execPython } from "../../functions/exec/controller";
import { singleDemo } from "./demo";
import { pyLogs } from "./logs";
import { EventTypes } from "./constants";

export async function runTests(parsedFunction) {
    // Clear logs before running tests
    window.dispatchEvent(new CustomEvent(EventTypes.CLEAR));

    const testCode = `${parsedFunction.code}

# Same test runner used in notebooks
def run_tests(func, test_cases):
    """
    Function to run test_cases which must be in Gradio examples format
    Args:
        func: The function to test
        test_cases: List of test_cases in same format as examples in gr.Interface
    """
    if not test_cases:
        raise ValueError("No test_cases provided")
    
    if not isinstance(test_cases, list):
        raise TypeError("test_cases should be provided as a list")

    print("=====================================")
    print(f"Running {len(test_cases)} test cases for {func.__name__}")
    print("=====================================")

    for i, case in enumerate(test_cases):
        if not isinstance(case, list):
            raise TypeError(f"Case {i+1} should be a list of args, or empty list if no args, e.g. [[]]")
            
        try:
            # For functions with no parameters, case should be an empty list
            result = func(*case)
            print(f"Case {i+1}: {case} -> {result}")
        except Exception as e:
            import traceback
            tb = traceback.extract_tb(e.__traceback__)
            error_line = tb[-1].lineno
            print(f"Case {i+1} failed at line {error_line} : {str(e)}")
            print(f"  Input: {case}")

# Run tests if test_cases exists, otherwise print message
try:
    test_cases
except NameError:
    print("No test cases defined. Skipping tests.")
else:
    run_tests(${parsedFunction.name}, test_cases)
    `.trim();

    let pyResult;
    try {
        pyResult = await execPython({ code: testCode, arg1: null }, false);
    } catch (error) {
        console.error("Python test error:", error);
        await pyLogs({
            errorMessage: error.message,
            code: testCode,
            ref: 'test_run_error'
        });
        pyResult = `Error running Python tests: ${error.message}`;
    }

    // Run Excel demo independently if it exists
    if (parsedFunction.excelExample) {
        try {
            await singleDemo(parsedFunction);
        } catch (error) {
            console.error("Excel demo error:", error);
            await pyLogs({
                errorMessage: error.message,
                code: parsedFunction,
                ref: 'excel_demo_error'
            });
            // Continue execution - don't let Excel error affect Python result
        }
    }

    return pyResult;
}