import * as React from "react";
import { useState, useEffect } from "react";
import { codeToHtml } from 'shiki';

const exCode = `def hello(name):
    """ Returns a greeting message. """
    message = f"Hello {name}!"
    return message`;

const HomeTab = () => {
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
        <div>
            <div className="mb-5">
                <h2 className="text-center text-lg">Use Python functions in Excel🚀</h2>
                <p className="py-1"><span className="font-bold bg-gray-200">Step 1:</span> Write a Python function.</p>
                <div className="py-2" dangerouslySetInnerHTML={{ __html: exCodeHtml }} />
                <p className="py-1"><span className="font-bold bg-gray-200">Step 2:</span> Use it in Excel as a named LAMBDA.</p>
                <pre className="py-2"><code>=HELLO(name)</code></pre>
                💻 Code is stored and run locally.<br />
                🆓 100% free for unlimited use.<br />
                <p className="py-1">We highly recommend watching the tutorial video and reading the documentation.  Then get started creating your first function using the Editor.</p>
            </div>

            <div className="flex justify-center gap-2.5 mb-5">
                <a
                    className="btn-secondary"
                    href="https://www.boardflare.com/apps/excel/python"
                    target="_blank"
                    rel="noopener"
                >
                    Tutorial
                </a>
                <a
                    className="btn-secondary"
                    href="https://www.boardflare.com/apps/excel/python"
                    target="_blank"
                    rel="noopener"
                >
                    Documentation
                </a>
                <a
                    className="btn-secondary"
                    href="https://www.boardflare.com/company/support"
                    target="_blank"
                    rel="noopener"
                >
                    Support
                </a>
            </div>
        </div>
    );
};

export default HomeTab;
