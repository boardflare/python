import * as React from "react";
import EditorTab from "./EditorTab";
import OutputTab from "./OutputTab";
import HomeTab from "./HomeTab";
import FunctionsTab from "./FunctionsTab";
import SettingsTab from "./SettingsTab";
import { EventTypes } from "../utils/constants";
import { getFunctions, createDefaultFunction } from "../utils/workbookSettings";
import { pyLogs } from "../utils/logs";

const App = ({ title }) => {
  const [selectedTab, setSelectedTab] = React.useState("home");
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
    loadFunctions(); // Load functions when App loads, so any errors should be handled here.
  }, []);

  React.useEffect(() => {
    const handleLog = (event) => {
      setLogs(prev => [...prev, event.detail]);
    };

    const handleClearConsole = () => {
      setLogs([]);
    };

    window.addEventListener(EventTypes.LOG, handleLog);
    window.addEventListener(EventTypes.ERROR, handleLog);
    window.addEventListener(EventTypes.CLEAR, handleClearConsole);

    return () => {
      window.removeEventListener(EventTypes.LOG, handleLog);
      window.removeEventListener(EventTypes.ERROR, handleLog);
      window.removeEventListener(EventTypes.CLEAR, handleClearConsole);
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
      const workbookData = await getFunctions();

      if (!workbookData || workbookData.length === 0) {
        // No functions found, create a default function
        const defaultFunc = await createDefaultFunction();
        setWorkbookFunctions([defaultFunc]);
        setSelectedFunction(defaultFunc);
      } else {
        setWorkbookFunctions(workbookData);
        setSelectedFunction(workbookData[0]);
      }

    } catch (error) {
      setWorkbookFunctions([]);
      pyLogs({ message: error.message, ref: "app_loadFunctions_error" });
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden"> {/* Ensure full screen and hidden overflow */}
      <main className="flex-1 flex flex-col overflow-hidden min-h-0 text-sm bg-white"> {/* Allow shrinking */}
        <div className="flex space p-0 border-b">
          <button className={`flex-grow px-2 py-2 ${selectedTab === "home" ? "border-b-2 border-blue-500" : ""}`} value="home" onClick={handleTabSelect}>Home</button>
          <button className={`flex-grow px-2 py-2 ${selectedTab === "editor" ? "border-b-2 border-blue-500" : ""}`} value="editor" onClick={handleTabSelect}>Editor</button>
          <button className={`flex-grow px-2 py-2 ${selectedTab === "functions" ? "border-b-2 border-blue-500" : ""}`} value="functions" onClick={handleTabSelect}>Functions</button>
          <button className={`flex-grow px-2 py-2 ${selectedTab === "output" ? "border-b-2 border-blue-500" : ""}`} value="output" onClick={handleTabSelect}>Output</button>
          {/* {isPreview && <button className={`flex-grow px-2 py-2 mr-2 ${selectedTab === "settings" ? "border-b-2 border-blue-500" : ""}`} value="settings" onClick={handleTabSelect}>⚙️</button>} */}
        </div>
        <div className="flex-1 overflow-hidden">
          {selectedTab === "home" && (
            <HomeTab
              handleTabSelect={handleTabSelect}
              setGeneratedCode={setGeneratedCode}
              setSelectedFunction={setSelectedFunction}
              loadFunctions={loadFunctions}
              selectedFunction={selectedFunction}
            />
          )}
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
