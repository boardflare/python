import * as React from "react";

const HomeTab = () => {

    return (
        <div>
            <div className="mb-5">
                <h2 className="text-center text-lg">Run Python functions in Excel🚀</h2>
                <p>For example, a Python function</p>
                <pre><code className="language-python">{`def hello(name):
    return f"Hello {name}!"`}</code></pre>
                <p>becomes</p>
                <pre><code>=HELLO(name)</code></pre>
                <p>Get started by watching the tutorial video and reading the documentation first, then launch the Function Builder.</p>
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
