import * as React from "react";
import { saveWorkbookOnly } from "../utils/save";
import { singleDemo, testCasesDemo } from "../utils/demo";
import { pyLogs } from "../utils/logs";
import { parsePython } from "../utils/codeparser";
import { getExecEnv } from "../utils/constants";

const AddFunctions = ({ loadFunctions, isPreview }) => {
    const [functions, setFunctions] = React.useState([]);
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadExampleFunctions();
    }, [isPreview]);

    // Add error timeout effect
    React.useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const loadExampleFunctions = async () => {
        try {
            setLoading(true);
            const url = isPreview
                ? 'https://preview.python-apps.pages.dev/example_functions.json'
                : 'https://python-apps.pages.dev/example_functions.json';
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch example functions');
            const data = await response.json();
            setFunctions(data);
            setError(null);
            console.log(`Loaded ${data.length} example functions from ${url}`);
        } catch (error) {
            console.error('Error loading example functions:', error);
            setError('Failed to load example functions');
            setFunctions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInsert = async (func) => {
        try {
            if (!func.code) {
                throw new Error("Function code missing");
            }

            // Merge all properties from func and parsed Python metadata
            const funcToSave = { ...func, ...(await parsePython(func.code)) };

            // Save workbook first and use returned function with noName set
            let savedFunction = await saveWorkbookOnly(funcToSave);

            // Only add demo sheet if noName is not true
            if (!savedFunction.noName) {
                await testCasesDemo(funcToSave);
            }

            await loadFunctions();

            await pyLogs({
                message: savedFunction.name,
                ref: 'imported_example_function'
            });
        } catch (error) {
            console.error("Error importing function:", error);
            setError("Failed to import function. Please try again. If the problem persists, please contact support.");
            await pyLogs({
                code: func.name,
                ref: 'import_example_function_error',
                message: error.message
            });
        }
    };

    if (loading) {
        return <div className="text-gray-600 text-sm px-4">Loading example functions...</div>;
    }

    if (error) {
        return <div className="text-red-600 text-sm px-4">{error}</div>;
    }

    if (functions.length === 0) {
        return null;
    }

    return (
        <div className="h-full flex flex-col">
            <div className="shrink-0 px-4 py-2 bg-gray-100 font-bold text-center">
                Examples
            </div>
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto">
                    <table className="min-w-full bg-white">
                        <tbody>
                            {functions.map((func) => (
                                <tr key={func.name}>
                                    <td className="py-1 px-2 border-b w-full">
                                        <div className="relative group w-full">
                                            <a href={func.link} target="_blank" rel="noopener noreferrer" className="font-mono cursor-help text-left block w-full text-blue-500 hover:underline">={func.name.toUpperCase()}</a>
                                            <div className="absolute left-0 top-full mt-2 w-64 p-2 bg-blue-50 text-black text-sm rounded shadow-lg hidden group-hover:block z-10">
                                                {func.description}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-1 px-2 border-b w-12 text-center">
                                        <div className="relative group">
                                            <button
                                                onClick={() => handleInsert(func)}
                                                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                                                aria-label="Insert function"
                                            >
                                                Add
                                            </button>
                                            <div className="absolute right-0 top-full mt-2 w-64 p-2 bg-blue-50 text-black text-sm rounded shadow-lg hidden group-hover:block z-10">
                                                Adds this function to the workbook.
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AddFunctions;
