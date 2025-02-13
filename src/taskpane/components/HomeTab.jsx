import * as React from "react";
import { MonacoEditor } from "./MonacoEditor";
import { DISPLAY_CODE } from "../utils/constants";
import LLM from "./LLM";
import { SignInButton } from "./Auth";
import Feedback from "./Feedback";
import Demo from "./Demo";

const HomeTab = ({ onTabClick, setGeneratedCode, setSelectedFunction, loadFunctions }) => {
    const [isLLMOpen, setIsLLMOpen] = React.useState(false);

    const handleLLMSuccess = (generatedCode, prompt) => {
        setGeneratedCode(generatedCode);
        setSelectedFunction({ name: "", code: generatedCode, prompt });
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
                </div>
                <p className="m-2">Check out the <a href="https://whistlernetworks.sharepoint.com/:p:/s/Boardflare/EavKXzTcSmJArk1FadRoH40BaFTd1xrff2cw3bGSRs3AFg?rtime=Mhp28Ns33Ug" target="_blank" rel="noopener" className="text-blue-500 underline">slideshow</a> and <a href="https://www.boardflare.com/apps/excel/python" target="_blank" rel="noopener" className="text-blue-500 underline">documentation</a>. Use the <span className="text-blue-500 underline cursor-pointer" onClick={() => onTabClick('editor')}>code editor</span> to create and edit functions. Import example functions on the <span className="text-blue-500 underline cursor-pointer" onClick={() => onTabClick('functions')}>functions</span> tab.</p>
                <div className="text-center mt-4 space-y-2">
                    <div className="space-x-2">
                        {/* <Demo loadFunctions={loadFunctions} /> */}
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
            />
            <div className="fixed bottom-3 w-full flex justify-between items-center mt-2 px-3">
                <a href="https://www.boardflare.com/company/support" target="_blank" rel="noopener" className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">Email Us!🛟</a>
                <SignInButton loadFunctions={loadFunctions} />
            </div>
        </>
    );
};

export default HomeTab;
