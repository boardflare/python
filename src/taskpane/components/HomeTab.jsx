import * as React from "react";
import { MonacoEditor } from "./MonacoEditor";
import { DISPLAY_CODE } from "../utils/constants";
import LLM from "./LLM";
import { SignInButton } from "./Auth";
import Feedback from "./Feedback";
import Demo from "./Demo";
import pdfUrl from "../../../assets/Python-v1.2.1.pdf"; // Updated path
import AddFunctions from "./AddFunctions";

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
        <div className="flex flex-col h-full overflow-hidden">
            <div className="shrink-0">
                <div className="px-4 py-2 bg-gray-100 font-bold text-center">
                    Create Functions
                </div>
                <div className="p-2">
                    <div className="border-gray-300 rounded-lg py-0">
                        <p><span className="font-bold">Step 1:</span> Write a Python function in the <span className="text-blue-500 underline cursor-pointer" onClick={() => onTabClick('editor')}>editor</span>.</p>
                        <div className="py-1 h-[60px]">
                            <MonacoEditor
                                value={DISPLAY_CODE}
                                onMount={(editor) => {
                                    editor.updateOptions({ readOnly: true });
                                }}
                            />
                        </div>
                    </div>
                    <div className="py-1">
                        <p><span className="font-bold">Step 2:</span> Save it to create a custom function.</p>
                        <div className="bg-white"><code>=HELLO("Annie")</code> <br />
                            {isWebPlatform && (
                                <p className="mt-1 text-orange-600">
                                    Autocomplete does not work in Excel for Web for LAMBDA functions, but they are there!
                                </p>
                            )}
                        </div>
                        <p className="mt-1">
                            Check out the <a href={pdfUrl} target="_blank" rel="noopener" className="text-blue-500 underline">slideshow</a> and <a href="https://www.boardflare.com/apps/excel/python" target="_blank" rel="noopener" className="text-blue-500 underline">documentation</a>.
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex-1 min-h-0">
                <AddFunctions loadFunctions={loadFunctions} />
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
                    <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-blue-50 text-black text-sm py-2 px-4 rounded shadow-md whitespace-normal min-w-[200px]">
                        Configure permissions to access data in settings ⚙️.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomeTab;
