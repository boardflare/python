import { exec } from "../../functions/functions";
import { singleDemo } from "./demo";
import { pyLogs } from "./logs";

export async function runTests(parsedFunction) {
    const testCode = `

# Function code
${parsedFunction.code}

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
            raise TypeError(f"Case {i+1} should be a list, even if it only has one argument, e.g. [3]")
            
        try:
            # Simply pass all inputs directly to the function
            result = func(*case)
            print(f"Case {i+1}: {case} -> {result}")
        except Exception as e:
            print(f"Case {i+1} failed: {str(e)}")

# Run tests
run_tests(${parsedFunction.name}, test_cases)
    `.trim();

    let pyResult;
    try {
        pyResult = await exec(testCode, null);
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