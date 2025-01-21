/*
* LLM is a react component that is launched from an AI✨ button at the bottom of the EditorTab next to the Reset button.  When the button is clicked, it opens a dialog with a text area form where the user can input what they would like their Python function to do.  After the user submits their input, the LLM will send the input to the LLM API.  When the response is received it will be set as the code in the Monaco editor in the EditorTab.  If the user clicks the AI button again, the dialog will open with the input form populated with the original input so the user can edit it.  There will be a Clear button on the dialog that will clear the input form. 
*
*/

import React, { useState } from "react";

const LLM = ({ isOpen, onClose, onSubmit }) => {
    const [input, setInput] = useState("");

    if (!isOpen) return null;

    const handleClear = () => {
        setInput("");
    };

    const handleSubmit = () => {
        onSubmit(input);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg p-6 w-1/2">
                <h2 className="text-xl mb-4">Generate Python Function</h2>
                <textarea
                    className="w-full h-32 p-2 border rounded mb-4"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Describe the function you need..."
                />
                <div className="flex justify-end space-x-2">
                    <button onClick={handleClear} className="px-4 py-2 bg-gray-200 rounded">Clear</button>
                    <button onClick={onClose} className="px-4 py-2 bg-red-500 text-white rounded">Cancel</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-blue-500 text-white rounded">Submit</button>
                </div>
            </div>
        </div>
    );
};

export default LLM;