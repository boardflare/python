import { exec } from "../../functions/functions";
import { singleDemo } from "./demo";
import { pyLogs } from "./logs";

export async function runTests(parsedFunction) {
    const testCode = `

# Function code
${parsedFunction.code}

# Same test runner used in notebooks
def run_tests(func, test_cases):
    if not test_cases:
        raise ValueError("No test cases provided.")
    
    if not isinstance(test_cases, list):
        raise TypeError("Test cases should be provided as a list.")
    
    for i, test_case in enumerate(test_cases):
        if not isinstance(test_case, list):
            raise TypeError(f"Test case {i+1} is not a list.")
        
        # Handle both single arguments and lists of arguments
        if not test_case:
            raise ValueError(f"Test case {i+1} is empty.")
        
        if isinstance(test_case[0], list):
            result = func(test_case)
            test_case_str = str(test_case)
        else:
            result = func(*test_case)
            test_case_str = str(test_case)
        
        print(f"Case {i+1}: {test_case_str} -> {result}")

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