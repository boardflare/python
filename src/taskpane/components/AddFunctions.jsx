import * as React from "react";
import { saveWorkbookOnly } from "../utils/save";
import { singleDemo } from "../utils/demo";
import { pyLogs } from "../utils/logs";
import { parsePython } from "../utils/codeparser";
// Import the example functions directly from assets
import exampleFunctions from '../../../assets/example_functions.json';

const AddFunctions = ({ loadFunctions }) => {
    const [functions, setFunctions] = React.useState([]);
    const [error, setError] = React.useState(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        loadExampleFunctions();
    }, []);

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
            // The functions are already parsed in the JSON file
            setFunctions(exampleFunctions);
            setError(null);
            console.log(`Loaded ${exampleFunctions.length} example functions`);
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

            // Parse the function code to get formula and metadata
            const funcToSave = await parsePython(func.code);
            // Include the excelExample from the original function
            funcToSave.excelExample = func.excelExample;

            await saveWorkbookOnly(funcToSave);
            await singleDemo(funcToSave);
            await loadFunctions();

            pyLogs({
                code: func.name,
                ref: 'imported_example_function',
                source: 'example'
            });
        } catch (error) {
            console.error("Error importing function:", error);
            setError("Failed to import function. Please try again. If the problem persists, please contact support.");
            pyLogs({
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
                Example Functions
            </div>
            <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto">
                    <table className="min-w-full bg-white">
                        <tbody>
                            {functions.map((func) => (
                                <tr key={func.name}>
                                    <td className="py-1 px-2 border-b w-full">
                                        <div className="relative group w-full">
                                            <span className="font-mono cursor-help text-left block w-full">={func.name.toUpperCase()}</span>
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
