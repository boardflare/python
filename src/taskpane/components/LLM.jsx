import React, { useState, useEffect } from "react";
import { pyLogs } from "../utils/logs";
// New imports for saving inside LLM:
import { parsePython } from "../utils/codeparser";
import { saveFunctionToSettings } from "../utils/workbookSettings";
import { updateNameManager } from "../utils/nameManager";

const LLM_URL = process.env.NODE_ENV === 'development'
    ? 'https://codepy.boardflare.workers.dev' //'http://127.0.0.1:8787'
    : 'https://codepy.boardflare.workers.dev';

const LLM = ({ isOpen, onClose, onSuccess, prompt, loadFunctions }) => { // NEW: added loadFunctions prop
    const [input, setInput] = useState(prompt || "");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isSaved, setIsSaved] = useState(false);
    const [savedFunction, setSavedFunction] = useState(null);

    // Add useEffect to update prompt state when prompt prop changes
    useEffect(() => {
        setInput(prompt || "");
    }, [prompt]);

    const examplePrompts = [
        { value: "", label: "Select an example ..." },
        { value: "Add two numbers and return their sum.", label: "Add two numbers" },
        { value: "Convert a single string, or 2D list of strings, to uppercase.", label: "Convert to uppercase" },
        { value: "Calculate the average of a 2D list of numbers", label: "Calculate average" },
        { value: "Find all prime numbers up to n", label: "Find prime numbers" },
        { value: "Implement a function that performs matrix multiplication on two 2D lists.", label: "Matrix multiplication" },
        { value: "Create a function that finds the longest common subsequence of two strings.", label: "Longest common subsequence" },
        { value: "Implement a function that performs binary search on a sorted 2D list.", label: "Binary search 2D" },
        { value: "Create a function that validates if a string represents a valid email address.", label: "Email validation" },
        { value: "Build a function that finds all anagrams in a 2D list of strings.", label: "Find anagrams" },
        { value: "Implement a function that performs flood fill on a 2D grid.", label: "Flood fill" },
        { value: "Create a function that calculates the edit distance between two strings.", label: "Edit distance" },
        { value: "Build a function that performs depth-first search on a 2D grid maze.", label: "DFS maze solver" },
        { value: "Implement a function that finds all palindromic substrings in a string.", label: "Palindromic substrings" }
    ];

    if (!isOpen) return null;

    const handleClear = () => {
        setInput("");
        setError("");
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError("");
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => abortController.abort(), 15000); // 15-second timeout

        // Use default prompt if input is empty
        const promptText = input.trim() || "Add two numbers and return their sum.";

        const genText = {
            model: 'mistral-large-2411',
            messages: [
                { role: 'system', content: `Create a single Python function with docstring that fulfills the user's request. The function args must be Python types float, str, bool, None or a 2D list of those types. Parameter names cannot contain numbers. Variable length arguments (e.g. *args or **kwargs) are not allowed. Do not include any print statements, example usage, type hints, or explanations.  Define a test_cases variable that is a list with nested lists of example args.  e.g. test_cases = [["hello"],[[["hello", "world"]]]] includes a case with a str arg, and a case with a 2D list arg.` },
                { role: 'user', content: promptText },
            ],
            max_tokens: 800,
            temperature: 0.1
        };

        try {
            const response = await fetch(LLM_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ genText }),
                signal: abortController.signal
            });

            clearTimeout(timeoutId); // clear timeout upon response

            if (!response.ok) {
                throw new Error('Failed to generate code');
            }

            const data = await response.json();
            let generatedCode = data.content;

            const codeMatch = generatedCode.match(/```(?:python)?\s*([\s\S]*?)\s*```/);
            if (codeMatch) {
                generatedCode = codeMatch[1].trim();
            }

            pyLogs({
                LLM: {
                    prompt: input,
                    content: generatedCode
                }
            });

            // NEW: Parse and save the generated function inside LLM
            const parsedFunction = await parsePython(generatedCode);
            await saveFunctionToSettings(parsedFunction);
            await updateNameManager(parsedFunction);
            // NEW: Refresh function list after saving
            if (loadFunctions) {
                await loadFunctions();
            }
            setSavedFunction(parsedFunction);
            setIsSaved(true);

        } catch (err) {
            if (err.name === "AbortError") {
                setError("Request timed out after 10 seconds.");
            } else {
                setError(err.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // If successfully saved, show success message with a button to continue to editor.
    if (isSaved) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-2">
                <div className="bg-white rounded-lg p-3 w-full">
                    <h2 className="text-xl mb-2">Function Created Successfully!</h2>
                    <p className="mb-4">Use your function in Excel as follows:</p>
                    <p className="mb-4">={savedFunction.signature}</p>
                    <p className="mb-4">Next, you will be taken to the code editor where you can edit the code generated by the AI and test the function.</p>
                    <button
                        onClick={() => { onSuccess(savedFunction, input); onClose(); }}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Continue
                    </button>
                </div>
            </div>
        );
    }

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
                    className="w-full h-60 p-2 border rounded mb-2 placeholder-gray-600"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe what your custom function should do, and the AI will try to create one like =EXTRACT_EMAILS or =CALCULATE_AVERAGE that you can save and use in your workbook.  You can't' ask it general questions, it can only create functions."
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