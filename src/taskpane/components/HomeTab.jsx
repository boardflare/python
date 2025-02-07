import * as React from "react";
import { MonacoEditor } from "./MonacoEditor";
import { DISPLAY_CODE } from "../utils/constants";
import { feedback } from "../utils/logs";
import LLM from "./LLM";
import SheetLLM from "./SheetLLM";
import { signIn, getStoredToken } from "../utils/auth";

const HomeTab = ({ onTabClick, setGeneratedCode }) => {
    const [notification, setNotification] = React.useState("");
    const [feedbackText, setFeedbackText] = React.useState("");
    const [isLLMOpen, setIsLLMOpen] = React.useState(false);
    const [isSheetLLMOpen, setIsSheetLLMOpen] = React.useState(false);
    const [isSignedIn, setIsSignedIn] = React.useState(false);
    const notificationTimeoutRef = React.useRef();

    React.useEffect(() => {
        return () => {
            if (notificationTimeoutRef.current) {
                clearTimeout(notificationTimeoutRef.current);
            }
        };
    }, []);

    React.useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = await getStoredToken();
            setIsSignedIn(!!token);
        } catch (error) {
            console.error("Error checking auth status:", error);
        }
    };

    const showNotification = (message, type = "success") => {
        if (notificationTimeoutRef.current) {
            clearTimeout(notificationTimeoutRef.current);
        }
        setNotification({ message, type });
        notificationTimeoutRef.current = setTimeout(() => {
            setNotification("");
        }, 5000);
    };

    const handleSignIn = async () => {
        try {
            await signIn();
            setIsSignedIn(true);
            showNotification("Successfully signed in!", "success");
        } catch (error) {
            console.error("Sign in error:", error);
            showNotification(error.message || "Failed to sign in", "error");
        }
    };

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        try {
            await feedback({ text: feedbackText });
            showNotification("Thanks for the suggestion, we'll consider adding it!", "success");
            setFeedbackText("");
        } catch (error) {
            console.error("Error submitting feedback:", error);
            showNotification("Error submitting feedback", "error");
        }
    };

    const handleLLMSuccess = (generatedCode) => {
        setGeneratedCode(generatedCode); // Directly set the code
        onTabClick('editor');
    };

    return (
        <>
            <div className="p-1 mb-32">
                <h2 className="text-center text-lg font-semibold mb-2">Python functions in Excel 🧪</h2>
                <div className="text-right mb-2">
                    {!isSignedIn && (
                        <button
                            onClick={handleSignIn}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Sign in with Microsoft
                        </button>
                    )}
                </div>
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
                    <button
                        onClick={() => setIsLLMOpen(true)}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                    >
                        Create Function with AI ✨
                    </button>
                    <br />
                    {/* <button
                        onClick={() => setIsSheetLLMOpen(true)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        Generate Sheet using AI 📊
                    </button> */}
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0">
                {notification && (
                    <div className={`p-2 text-center ${notification.type === "success" ? "bg-green-50 text-green-900" : "bg-red-100 text-red-800"}`}>
                        {notification.message}
                    </div>
                )}
                <h2 className="text-center text-lg font-semibold">What do you want a function to do?</h2>
                <form onSubmit={handleFeedbackSubmit} className="mb-2 p-2">
                    <textarea
                        id="feedback"
                        value={feedbackText}
                        placeholder="e.g. extract numbers from a string and return their sum"
                        onChange={(e) => setFeedbackText(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md placeholder-gray-500"
                        rows="8"
                        required
                    ></textarea>
                    <div className="flex justify-between items-center mt-2">
                        <a href="https://www.boardflare.com/company/support" target="_blank" rel="noopener" className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">Email Us!🛟</a>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
            <LLM
                isOpen={isLLMOpen}
                onClose={() => setIsLLMOpen(false)}
                onSuccess={handleLLMSuccess}
            />
            {/* <SheetLLM
                isOpen={isSheetLLMOpen}
                onClose={() => setIsSheetLLMOpen(false)}
                onSuccess={handleLLMSuccess}
            /> */}
        </>
    );
};

export default HomeTab;
