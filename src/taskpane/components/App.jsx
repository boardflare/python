import * as React from "react";
import EditorTab from "./EditorTab";
import OutputTab from "./OutputTab";
import HomeTab from "./HomeTab";
import FunctionsTab from "./FunctionsTab";
import SettingsTab from "./SettingsTab";
import { EventTypes } from "../utils/constants";
import { getFunctionFromSettings } from "../utils/workbookSettings";

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
    loadFunctions(); // Load functions when App loads
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
    setUnsavedCode(null); // Only clear unsaved code when explicitly selecting a new function
    setSelectedTab("editor");
  };

  const handleTest = () => {
    setSelectedTab("output");
  };

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
  };

  const loadFunctions = async () => {
    try {
      setIsLoading(true);
      const workbookData = await getFunctionFromSettings();
      setWorkbookFunctions(workbookData || []);

      // Only set hello function if found
      const helloFunc = workbookData?.find(f => f.name.toLowerCase() === 'hello');
      if (helloFunc) {
        setSelectedFunction({ ...helloFunc, source: 'workbook' });
      }
    } catch (error) {
      console.error('Error loading functions:', error);
      setWorkbookFunctions([]);
      setError('Failed to load workbook functions');
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
          {isPreview && <button className={`flex-grow px-2 py-2 mr-2 ${selectedTab === "settings" ? "border-b-2 border-blue-500" : ""}`} value="settings" onClick={handleTabSelect}>⚙️</button>}
        </div>
        <div className="flex-1 overflow-hidden">
          {selectedTab === "home" && (
            <HomeTab
              onTabClick={handleTabClick}
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
              onTest={handleTest}
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
              onTest={handleTest}
              workbookFunctions={workbookFunctions}
              isLoading={isLoading}
              error={error}
              loadFunctions={loadFunctions}
              isPreview={isPreview}
            />
          )}
          {isPreview && selectedTab === "settings" && <SettingsTab loadFunctions={loadFunctions} />}
        </div>
      </main>
    </div>
  );
};

export default App;
