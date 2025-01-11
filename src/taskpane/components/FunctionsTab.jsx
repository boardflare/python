import * as React from "react";
import { getFunctionFromSettings } from "../utils/workbookSettings";
import { DEFAULT_FUNCTIONS_URL, getStoredUrl, setStoredUrl } from "../utils/examples";

const FunctionsTab = ({ onEdit }) => {
    const [functions, setFunctions] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);
    const [url, setUrl] = React.useState('');
    const [isUrlSaving, setIsUrlSaving] = React.useState(false);
    const [saveSuccess, setSaveSuccess] = React.useState(false);

    React.useEffect(() => {
        const loadUrl = async () => {
            const storedUrl = await getStoredUrl();
            setUrl(storedUrl);
        };
        loadUrl();
    }, []);

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

    const handleUrlSubmit = async (e) => {
        e.preventDefault();
        setIsUrlSaving(true);
        setSaveSuccess(false);
        try {
            await setStoredUrl(url);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000); // Hide after 3 seconds
        } catch (error) {
            setError('Failed to save URL');
        } finally {
            setIsUrlSaving(false);
        }
    };

    const handleReset = async () => {
        setUrl(DEFAULT_FUNCTIONS_URL);
        await setStoredUrl(DEFAULT_FUNCTIONS_URL);
    };

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
        return (
            <div className="flex flex-col items-center justify-center h-full p-5 text-center text-gray-600">
                <div className="text-4xl mb-4">📝</div>
                <div className="text-base mb-2">No functions found</div>
                <div>Create new functions using the Editor tab</div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            <form onSubmit={handleUrlSubmit} className="p-4 border-b">
                <div className="flex gap-2 items-center">
                    <input
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="flex-1 px-2 py-1 border rounded"
                        placeholder="Enter functions URL"
                    />
                    <button
                        type="submit"
                        disabled={isUrlSaving}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        {isUrlSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        Reset
                    </button>
                </div>
                {saveSuccess && (
                    <div className="mt-2 text-green-600 text-sm">
                        URL saved successfully!
                    </div>
                )}
            </form>

            <div className="flex-1 overflow-x-auto">
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th className="py-2 px-4 border-b">Name</th>
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
        </div>
    );
};

export default FunctionsTab;
