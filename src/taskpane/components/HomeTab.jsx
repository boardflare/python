import * as React from "react";
import { useState, useEffect } from "react";
import { codeToHtml } from 'shiki';

const exCode = `def hello(name):
    """ Says hello. """
    message = f"Hello {name}!"
    return message`;

const HomeTab = ({ onEditorClick }) => {
    const [exCodeHtml, setExCodeHtml] = useState("");

    useEffect(() => {
        const generateCodeHtml = async () => {
            const html = await codeToHtml(exCode, {
                lang: 'python',
                theme: 'github-light-high-contrast'
            });
            setExCodeHtml(html);
        };
        generateCodeHtml();
    }, []);

    return (
        <>
            <div className="mb-5">
                <h2 className="text-center text-lg font-semibold mb-2">Use Python functions in Excel</h2>
                <div className="py-1 bg-gray-200 shadow-md rounded-lg p-3 mb-4">
                    <p><span className="font-bold">Step 1:</span> Write a Python function.</p>
                    <div className="py-2" dangerouslySetInnerHTML={{ __html: exCodeHtml }} />
                </div>
                <div className="py-1 bg-gray-200 shadow-md rounded-lg p-4 mb-4">
                    <p><span className="font-bold">Step 2:</span> Use it as a named LAMBDA function.</p>
                    <div className="p-1 mt-1 bg-white"><code>=HELLO("Annie")</code> <br /><code>Hello Annie</code></div>
                </div>
                <p className="mb-1">Check out the <a href="https://www.boardflare.com/apps/excel/python/tutorial" target="_blank" rel="noopener" className="text-blue-500 underline">tutorial video</a> and <a href="https://www.boardflare.com/apps/excel/python/documentation" target="_blank" rel="noopener" className="text-blue-500 underline">documentation</a>, then use the <span className="text-blue-500 underline cursor-pointer" onClick={onEditorClick}>editor</span> to create/edit functions.</p>
                <p className="mb-1">  Uses <code>BOARDFLARE.RUNPY</code> function under the hood, which can still be used directly.</p>
                <p className="mb-1">  We'd really appreciate it if you'd <a href="https://www.boardflare.com/company/support" target="_blank" rel="noopener" className="text-blue-500 underline">email us</a> if you find any bugs or have suggestions.🙂</p>
            </div>
            <div className="fixed bottom-0 left-0 right-0 bg-gray-100 text-left py-2">
                ⬅️ PRO Tip: Drag your task pane open for room.
            </div>
        </>
    );
};

export default HomeTab;
