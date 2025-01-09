import { runPy } from "../../functions/runpy/controller";
import { EventTypes } from "./constants";

export async function runTests(code, functionName) {
    const testCode = `
${code}

result = "Finished tests"
print(result)

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