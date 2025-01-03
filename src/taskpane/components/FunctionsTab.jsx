import * as React from "react";
import { getFunctionFromSettings } from "../utils/workbookSettings";

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full p-5 text-center text-gray-600">
        <div className="text-4xl mb-4">📝</div>
        <div className="text-base mb-2">No functions found</div>
        <div>Create new functions using the Editor tab</div>
    </div>
);

const FunctionsGrid = ({ onEdit }) => {
    const [functions, setFunctions] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        const loadFunctions = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const functionsData = await getFunctionFromSettings();
                const functionsWithIds = (functionsData || []).map((func, index) => ({
                    ...func,
                    id: index + 1
                }));
                setFunctions(functionsWithIds);
            } catch (error) {
                console.error('Error loading functions:', error);
                setError('Failed to load functions. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };
        loadFunctions();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-5 text-center text-gray-600">
                <div className="text-base mb-2">{error}</div>
            </div>
        );
    }

    if (!functions.length) {
        return <EmptyState />;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
                <thead>
                    <tr>
                        <th className="py-2 px-4 border-b">Function Name</th>
                        <th className="py-2 px-4 border-b">Description</th>
                        <th className="py-2 px-4 border-b">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {functions.map((func) => (
                        <tr key={func.id}>
                            <td className="py-2 px-4 border-b">{func.name}</td>
                            <td className="py-2 px-4 border-b">{func.description}</td>
                            <td className="py-2 px-4 border-b">
                                <button
                                    className="text-blue-500 hover:underline"
                                    onClick={() => onEdit(func.name)}
                                >
                                    Edit
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export const FunctionsTab = ({ onEdit }) => {
    return (
        <div className="h-full">
            <FunctionsGrid onEdit={onEdit} />
        </div>
    );
};

export default FunctionsTab;
