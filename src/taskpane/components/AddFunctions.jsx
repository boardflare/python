import * as React from "react";
import { parseNotebook } from "../utils/notebooks";
import { saveFunctionToSettings } from "../utils/workbookSettings";
import { updateNameManager } from "../utils/nameManager";
import { singleDemo } from "../utils/demo";
import { pyLogs } from "../utils/logs";
import demoFunctions from '../utils/demo_functions.ipynb';

const AddFunctions = ({ loadFunctions }) => {
    const [functions, setFunctions] = React.useState([]);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        loadDemoFunctions();
    }, []);

    const loadDemoFunctions = async () => {
        try {
            const parsedFunctions = await parseNotebook(demoFunctions);
            setFunctions(parsedFunctions);
            setError(null);
        } catch (error) {
            console.error('Error loading demo functions:', error);
            setError('Failed to load example functions');
            setFunctions([]);
        }
    };

    const handleInsert = async (func) => {
        try {
            await saveFunctionToSettings(func);
            await updateNameManager(func);
            await singleDemo(func);
            await loadFunctions();
            pyLogs({ function: func.name, ref: 'imported_example_function' });
        } catch (error) {
            console.error("Error importing function:", error);
            setError("Failed to import function");
            pyLogs({ function: func.name, ref: 'import_example_function_error' });
        }
    };

    if (error) {
        return <div className="text-red-600 text-sm px-4">{error}</div>;
    }

    if (functions.length === 0) {
        return null;
    }

    return (
        <div className="h-full flex flex-col">
            <div className="shrink-0 px-4 py-2 bg-gray-100 font-bold text-center">
                Add Python Functions
            </div>
            <div className="flex-1 flex flex-col min-h-0"> {/* Container for table */}
                <table className="min-w-full bg-white">
                    <thead className="sticky top-0 bg-white z-10">
                        <tr>
                            <th className="py-2 px-4 border-b text-left w-full">Excel Function</th>
                            <th className="py-2 px-4 border-b w-12">Add</th>
                        </tr>
                    </thead>
                </table>
                <div className="flex-1 overflow-y-auto"> {/* Scrollable container */}
                    <table className="min-w-full bg-white">
                        <tbody>
                            {functions.map((func) => (
                                <tr key={func.name}>
                                    <td className="py-2 px-4 border-b w-full">
                                        <div className="relative group w-full">
                                            <span className="font-mono cursor-help text-left block w-full">={func.name.toUpperCase()}</span>
                                            <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-sm rounded shadow-lg hidden group-hover:block z-10">
                                                {func.description}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 border-b w-12 text-center">
                                        <div className="relative group">
                                            <button
                                                onClick={() => handleInsert(func)}
                                                className="text-blue-500 hover:text-blue-700 cursor-help"
                                                aria-label="Insert function"
                                            >
                                                ➕
                                            </button>
                                            <div className="absolute right-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-sm rounded shadow-lg hidden group-hover:block z-10">
                                                Adds this function to the workbook and creates a demo sheet showing how to use it
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
