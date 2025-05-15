import * as React from "react";
import EditorTab from "./EditorTab";
import InfoTab from "./InfoTab";
import FunctionsTab from "./FunctionsTab";
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
      setError(null);
      let workbookData;

      try {
        workbookData = await getFunctions();
      } catch (error) {
        if (error?.code === "InvalidOperationInCellEditMode") {
          setError(error.message);
          try {
            workbookData = await getFunctionsWithDelay();
            setError(null);
          } catch (delayError) {
            pyLogs({ message: delayError.message, ref: "getFunctionsWithDelay_failed" });
            throw delayError;
          }
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
    <div className="h-screen flex flex-col overflow-hidden">
      <main className="flex-1 flex flex-col overflow-hidden min-h-0 text-sm bg-white">
        <div className="flex space p-0 border-b">
          <button className={`flex-grow px-2 py-2 ${selectedTab === "editor" ? "border-b-2 border-blue-500" : ""}`} value="editor" onClick={handleTabSelect}>Editor</button>
          <button className={`flex-grow px-2 py-2 ${selectedTab === "functions" ? "border-b-2 border-blue-500" : ""}`} value="functions" onClick={handleTabSelect}>Functions</button>
          <button className={`flex-grow px-2 py-2 ${selectedTab === "output" ? "border-b-2 border-blue-500" : ""} text-base`} value="output" onClick={handleTabSelect} title="Output">ℹ️</button>
        </div>
        <div className="flex-1 overflow-hidden">
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
          {selectedTab === "output" && <InfoTab logs={logs} onClear={handleClear} setLogs={setLogs} unsavedCode={unsavedCode} />}
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
        </div>
      </main>
    </div>
  );
};

export default App;
