import { runPy } from "../../functions/runpy/controller";

export async function runTests(code, functionName) {
    const testCode = `
${code}

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
            if isinstance(args, (list, tuple)):
                # Format args as comma-separated values without brackets
                args_str = ", ".join(repr(arg) for arg in args)
                print(f"Running ${functionName}({args_str}):")
                result = ${functionName}(*args)
                print(result)
            else:
                print(f"Running ${functionName}({repr(args)}):")
                result = ${functionName}(args)
                print(result)
        except Exception as e:
            print(f"Error: {str(e)}")
        print()  # Add a newline after each test cases
    `.trim();

    return await runPy(testCode, null);
}