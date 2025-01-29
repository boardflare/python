import React, { useState } from "react";
import { execPython } from "../../functions/exec/controller";
import { insertWorksheetFromBase64 } from "../utils/demo";
import sheetTemplateCode from '../utils/xlsxwriter.py';

const LLM_URL = process.env.NODE_ENV === 'development'
    ? 'https://codepy.boardflare.workers.dev' //'http://127.0.0.1:8787'
    : 'https://codepy.boardflare.workers.dev';

const LLM = ({ isOpen, onClose, onSuccess }) => {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const examplePrompts = [
        { value: "", label: "Select an example prompt..." },
        { value: "Modify worksheet to create a mortgage payment calculator with inputs for principal, rate, and term.", label: "Mortgage Calculator" },
        { value: "Generate a sales forecast template using moving averages.", label: "Sales Forecast" },
        { value: "Build a project timeline tracker with start dates, end dates, and progress.", label: "Project Timeline" },
        { value: "Create an inventory management worksheet with formulas for reorder points.", label: "Inventory Management" },
        { value: "Make a personal budget worksheet with income and expense categories.", label: "Budget Template" }
    ];

    if (!isOpen) return null;

    const handleClear = () => {
        setInput("");
        setError("");
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        setError("");

        const promptText = input.trim() || examplePrompts[1].value;

        const genText = {
            model: 'mistral-large-2411',
            messages: [
                {
                    role: 'system',
                    content: `Update the following Python function to generate an Excel worksheet based on the user's request.  Only change the code as where outlined in the comments, and do not add any other code. Template function: 
                    
                    ${sheetTemplateCode}`
                },
                { role: 'user', content: promptText },
            ],
            max_tokens: 2000,
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

            // Execute the generated Python code to get base64 string
            let base64Result = await execPython({
                code: generatedCode,
                arg1: null
            });

            // Insert the worksheet from base64
            await insertWorksheetFromBase64(base64Result[0][0]);

            // Log the operation
            // await pyLogs({
            //     LLM: {
            //         prompt: input,
            //         content: generatedCode,
            //         result: "Worksheet inserted successfully"
            //     }
            // });

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
                <h2 className="text-xl mb-2">Generate Excel Worksheet</h2>
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
                    className="w-full h-60 p-2 border rounded mb-2"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe the Excel worksheet you want to create, including any calculations, formatting, or special features needed."
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