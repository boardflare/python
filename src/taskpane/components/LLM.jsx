import React, { useState } from "react";
import { pyLogs } from "../utils/logs";  // Add this import

const LLM_URL = process.env.NODE_ENV === 'development'
    ? 'http://127.0.0.1:8787'
    : 'https://codepy.boardflare.workers.dev';

const LLM = ({ isOpen, onClose, onSuccess }) => {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const examplePrompts = [
        { value: "", label: "Select an example prompt..." },
        { value: "Add two numbers and return the sum", label: "Add two numbers" },
        { value: "Convert a string to uppercase", label: "Convert to uppercase" },
        { value: "Calculate the average of a list of numbers", label: "Calculate average" },
        { value: "Find all prime numbers up to n", label: "Find prime numbers" },
    ];

    if (!isOpen) return null;

    const handleClear = () => {
        setInput("");
        setError("");
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError("");

        const genText = {
            model: 'mistral-large-2411',
            messages: [
                { role: 'system', content: "Create a single Python function with type hints and a docstring that fulfills the user's request. The function can only accept and return standard Python scalars (int, float, str, bool) or 2D nested lists of scalars. Do not include any print statements, example usage, or explanations." },
                { role: 'user', content: input },
            ],
            max_tokens: 1500,
            temperature: 0.1
        };

        try {
            const response = await fetch(LLM_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ genText }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate code');
            }

            const data = await response.json();
            let generatedCode = data.content;

            const codeMatch = generatedCode.match(/```(?:python)?\s*([\s\S]*?)\s*```/);
            if (codeMatch) {
                generatedCode = codeMatch[1].trim();
            }

            // Add logging
            await pyLogs({
                LLM: {
                    prompt: input,
                    content: generatedCode
                }
            });

            onSuccess(generatedCode);
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-2">
            <div className="bg-white rounded-lg p-3 w-full">
                <h2 className="text-xl mb-2">Create Function with AI</h2>
                {error && (
                    <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
                        {error}
                    </div>
                )}
                <select
                    className="w-full p-2 border rounded mb-2"
                    onChange={(e) => setInput(e.target.value)}
                    value={input}
                    disabled={isLoading}
                >
                    {examplePrompts.map((prompt, index) => (
                        <option key={index} value={prompt.value}>
                            {prompt.label}
                        </option>
                    ))}
                </select>
                <textarea
                    className="w-full h-32 p-2 border rounded mb-2"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe the function you need.  Or select an example prompt above."
                    disabled={isLoading}
                />
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={handleClear}
                        className="px-4 py-2 bg-gray-200 rounded"
                        disabled={isLoading}
                    >
                        Clear
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-red-500 text-white rounded"
                        disabled={isLoading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 bg-blue-500 text-white rounded flex items-center"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating...
                            </>
                        ) : (
                            'Submit'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LLM;