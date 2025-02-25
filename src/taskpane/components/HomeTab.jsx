import * as React from "react";
import { MonacoEditor } from "./MonacoEditor";
import { DISPLAY_CODE } from "../utils/constants";
import LLM from "./LLM";
import { SignInButton } from "./Auth";
import Feedback from "./Feedback";
import Demo from "./Demo";
import pdfUrl from "../../../assets/Python-v1.2.1.pdf"; // Updated path

const HomeTab = ({ onTabClick, setGeneratedCode, setSelectedFunction, loadFunctions }) => {
    const [isLLMOpen, setIsLLMOpen] = React.useState(false);
    const [isWebPlatform, setIsWebPlatform] = React.useState(false);

    React.useEffect(() => {
        try {
            setIsWebPlatform(Office?.context?.diagnostics?.platform === 'OfficeOnline');
        } catch (error) {
            console.warn('Failed to detect Office platform:', error);
            setIsWebPlatform(false);
        }
    }, []);

    const handleLLMSuccess = (savedFunction, prompt) => {
        setSelectedFunction({ ...savedFunction, source: 'workbook', prompt });
        onTabClick('editor');
    };

    return (
        <>
            <div className="p-1 mb-32">
                <h2 className="text-center text-lg font-semibold mb-2">Python functions in Excel</h2>
                <div className="py-1 border-gray-300 rounded-lg p-2 mb-2">
                    <p><span className="font-bold">Step 1:</span> Write a Python function in the <span className="text-blue-500 underline cursor-pointer" onClick={() => onTabClick('editor')}>editor</span>.</p>
                    <div className="py-2 h-[75px]">
                        <MonacoEditor
                            value={DISPLAY_CODE}
                            onMount={(editor) => {
                                editor.updateOptions({ readOnly: true });
                            }}
                        />
                    </div>
                </div>
                <div className="py-1 border-gray-300 rounded-lg p-2 mb-2">
                    <p><span className="font-bold">Step 2:</span> Save it to create a LAMBDA function.</p>
                    <div className="p-1 mt-1 bg-white"><code>=HELLO("Annie")</code> <br /><code>Hello Annie!</code></div>
                    {isWebPlatform && (
                        <p className="mt-1 text-orange-600">
                            Note: Function autocomplete does not work in Excel for Web for LAMBDA functions, but the functions are available.
                        </p>
                    )}
                </div>
                <p className="m-2">
                    Check out the <a href={pdfUrl} target="_blank" rel="noopener" className="text-blue-500 underline">slideshow</a> and <a href="https://www.boardflare.com/apps/excel/python" target="_blank" rel="noopener" className="text-blue-500 underline">documentation</a>. Use the <span className="text-blue-500 underline cursor-pointer" onClick={() => onTabClick('editor')}>code editor</span> to create and edit functions. Import example functions on the <span className="text-blue-500 underline cursor-pointer" onClick={() => onTabClick('functions')}>functions</span> tab.
                </p>
                <div className="text-center mt-4 space-y-2">
                    <div className="space-x-2">
                        <Demo loadFunctions={loadFunctions} />
                        <button
                            onClick={() => setIsLLMOpen(true)}
                            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                        >
                            Create Function with AI✨
                        </button>
                    </div>
                    <br />
                </div>
            </div>
            <LLM
                isOpen={isLLMOpen}
                onClose={() => setIsLLMOpen(false)}
                onSuccess={handleLLMSuccess}
                loadFunctions={loadFunctions}
            />
            <div className="fixed bottom-3 w-full flex justify-between items-center mt-2 px-3">
                <a href="https://www.boardflare.com/company/support" target="_blank" rel="noopener" className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">Email Us!🛟</a>
                <div className="group relative flex items-center gap-2">
                    <SignInButton loadFunctions={loadFunctions} />
                    <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-green-50 text-black text-sm py-2 px-4 rounded shadow-md border border-green-200 whitespace-normal min-w-[200px]">
                        Login to save functions to OneDrive for access in other workbooks.
                    </div>
                </div>
            </div>
        </>
    );
};

export default HomeTab;
