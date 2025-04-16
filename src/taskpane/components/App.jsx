import * as React from "react";
import EditorTab from "./EditorTab";
import OutputTab from "./OutputTab";
import HomeTab from "./HomeTab";
import FunctionsTab from "./FunctionsTab";
import SettingsTab from "./SettingsTab";
import { EventTypes } from "../utils/constants";
import { getFunctions, getFunctionsWithDelay } from "../utils/workbookSettings";
import { pyLogs } from "../utils/logs";

const App = ({ title }) => {
  const [selectedTab, setSelectedTab] = React.useState("editor");
  const [selectedFunction, setSelectedFunction] = React.useState({ name: "", code: "" });
  const [logs, setLogs] = React.useState([]);
  const [generatedCode, setGeneratedCode] = React.useState(null);
  const [workbookFunctions, setWorkbookFunctions] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [isPreview, setIsPreview] = React.useState(false);
  const [unsavedCode, setUnsavedCode] = React.useState(null);

  React.useEffect(() => {
    setIsPreview(
      window.location.pathname.toLowerCase().includes('preview') ||
      window.location.hostname === 'localhost'
    );
    loadFunctions();
    pyLogs({ message: "App loaded without error from loadfunctions.", ref: "app_loaded" });
  }, []);

  React.useEffect(() => {
    const handleLog = (event) => {
      setLogs(prev => [...prev, event.detail]);
    };

    const handleClearConsole = () => {
      setLogs([]);
    };

    const handleSaveStatus = (event) => {
      if (event.detail.type === "error") {
        setError(event.detail.message);
      } else if (event.detail.type === "clear") {
        setError(null);
      }
    };

    window.addEventListener(EventTypes.LOG, handleLog);
    window.addEventListener(EventTypes.ERROR, handleLog);
    window.addEventListener(EventTypes.CLEAR, handleClearConsole);
    window.addEventListener(EventTypes.SAVE, handleSaveStatus);

    return () => {
      window.removeEventListener(EventTypes.LOG, handleLog);
      window.removeEventListener(EventTypes.ERROR, handleLog);
      window.removeEventListener(EventTypes.CLEAR, handleClearConsole);
      window.removeEventListener(EventTypes.SAVE, handleSaveStatus);
    };
  }, []);

  const handleClear = () => {
    setLogs([]);
  };

  const handleTabSelect = (event) => {
    // Don't clear unsaved code when switching tabs
    setSelectedTab(event.target.value);
  };

  const handleFunctionEdit = (func) => {
    setSelectedFunction(func);
    setUnsavedCode(null);
    setSelectedTab("editor");
  };

  const loadFunctions = async () => {
    try {
      setIsLoading(true);
      setError(null); // Clear any previous errors
      let workbookData;

      try {
        // First try the standard method
        workbookData = await getFunctions();
      } catch (error) {

        // If cell edit mode error code, try the delayed method
        if (error?.code === "InvalidOperationInCellEditMode") {
          // Set raw error message as it is localized.
          setError(error.message);
          try {
            // Then try the method with delayForCellEdit
            workbookData = await getFunctionsWithDelay();

            // If we get here, the delayed function worked - clear the cell editing message
            setError(null);
          } catch (delayError) {
            // Both methods failed, set a more descriptive error
            pyLogs({ message: delayError.message, ref: "getFunctionsWithDelay_failed" });
            throw delayError; // Re-throw to be caught by outer catch
          }
          // If the error is a general exception, set a specific error message
        } else if (error?.code === "GeneralException") {
          setError(`${error.message} - Your workbook is out of sync with server, which blocks the Excel APIs used by the add-in.  Please try saving the workbook, and if that doesn't work, try closing and reopening the workbook.`);
          throw error;
        }
        else {
          setError(error.message);
          throw error;
        }
      }

      if (!workbookData || workbookData.length === 0) {
        // No functions found, but we won't create a default function automatically
        setWorkbookFunctions([]);
        setSelectedFunction({ name: "", code: "" });
      } else {
        setWorkbookFunctions(workbookData);
        setSelectedFunction(workbookData[0]);
      }
    } catch (error) {
      setWorkbookFunctions([]);
      pyLogs({ message: `Message: ${error.message}  Code:${error?.code}`, ref: "app_loadFunctions_error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden"> {/* Ensure full screen and hidden overflow */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0 text-sm bg-white"> {/* Allow shrinking */}
        <div className="flex space p-0 border-b">
          {/* <button className={`flex-grow px-2 py-2 ${selectedTab === "home" ? "border-b-2 border-blue-500" : ""}`} value="home" onClick={handleTabSelect}>Home</button> */}
          <button className={`flex-grow px-2 py-2 ${selectedTab === "editor" ? "border-b-2 border-blue-500" : ""}`} value="editor" onClick={handleTabSelect}>Editor</button>
          <button className={`flex-grow px-2 py-2 ${selectedTab === "functions" ? "border-b-2 border-blue-500" : ""}`} value="functions" onClick={handleTabSelect}>Functions</button>
          <button className={`flex-grow px-2 py-2 ${selectedTab === "output" ? "border-b-2 border-blue-500" : ""}`} value="output" onClick={handleTabSelect}>Output</button>
          {/* {isPreview && <button className={`flex-grow px-2 py-2 mr-2 ${selectedTab === "settings" ? "border-b-2 border-blue-500" : ""}`} value="settings" onClick={handleTabSelect}>⚙️</button>} */}
        </div>
        <div className="flex-1 overflow-hidden">
          {/* {selectedTab === "home" && (
            <HomeTab
              handleTabSelect={handleTabSelect}
              setGeneratedCode={setGeneratedCode}
              setSelectedFunction={setSelectedFunction}
              loadFunctions={loadFunctions}
              selectedFunction={selectedFunction}
              error={error}
            />
          )} */}
          {selectedTab === "editor" && (
            <EditorTab
              selectedFunction={selectedFunction}
              setSelectedFunction={setSelectedFunction}
              generatedCode={generatedCode}
              setGeneratedCode={setGeneratedCode}
              workbookFunctions={workbookFunctions}
              loadFunctions={loadFunctions}
              unsavedCode={unsavedCode}
              setUnsavedCode={setUnsavedCode}
              error={error}
            />
          )}
          {selectedTab === "output" && <OutputTab logs={logs} onClear={handleClear} setLogs={setLogs} unsavedCode={unsavedCode} />}
          {selectedTab === "functions" && (
            <FunctionsTab
              onEdit={handleFunctionEdit}
              workbookFunctions={workbookFunctions}
              isLoading={isLoading}
              error={error}
              loadFunctions={loadFunctions}
              isPreview={isPreview}
            />
          )}
          {/* {isPreview && selectedTab === "settings" && <SettingsTab loadFunctions={loadFunctions} />} */}
        </div>
      </main>
    </div>
  );
};

export default App;
