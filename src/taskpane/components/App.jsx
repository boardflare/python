import * as React from "react";
import EditorTab from "./EditorTab";
import OutputTab from "./OutputTab";
import HomeTab from "./HomeTab";
import FunctionsTab from "./FunctionsTab";
import { EventTypes } from "../utils/constants";
import { getFunctionFromSettings } from "../utils/workbookSettings";
import { loadFunctionFiles, TokenExpiredError } from "../utils/drive";

const App = ({ title }) => {
  const [selectedTab, setSelectedTab] = React.useState("home");
  const [selectedFunction, setSelectedFunction] = React.useState({ name: "", code: "" });
  const [logs, setLogs] = React.useState([]);
  const [generatedCode, setGeneratedCode] = React.useState(null);
  const functionsCache = React.useRef(new Map());
  const [workbookFunctions, setWorkbookFunctions] = React.useState([]);
  const [onedriveFunctions, setOnedriveFunctions] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

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
    // Just change the tab, no need to reload functions
    setSelectedTab(event.target.value);
  };

  const handleFunctionEdit = (func) => {
    const source = func.source || 'workbook';
    const id = source === 'workbook' ? func.name : func.fileName;
    const cacheKey = `${source}-${id}`;

    if (!functionsCache.current.has(cacheKey)) {
      functionsCache.current.set(cacheKey, func);
    }

    setSelectedFunction(func);
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
      // Load workbook functions
      const workbookData = await getFunctionFromSettings();
      setWorkbookFunctions(workbookData || []);
      workbookData?.forEach(func => {
        const fullFunc = {
          ...func,
          source: 'workbook',
          code: func.code || '',
          fileName: `${func.name}.ipynb`
        };
        functionsCache.current.set(`workbook-${func.name}`, fullFunc);
      });

      // Load OneDrive functions
      const driveFunctions = await loadFunctionFiles();
      setOnedriveFunctions(driveFunctions);
      driveFunctions?.forEach(func => {
        const fullFunc = {
          ...func,
          source: 'onedrive',
          code: func.code || ''
        };
        functionsCache.current.set(`onedrive-${func.fileName}`, fullFunc);
      });
    } catch (error) {
      console.error('Error loading functions:', error);
      setError(error instanceof TokenExpiredError ? error.message : 'Failed to load functions');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    loadFunctions();
  }, []); // This should only run once on mount

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <main className="flex-1 flex flex-col overflow-hidden min-h-0 text-sm bg-white">
        <div className="flex space p-0 border-b">
          <button className={`flex-grow px-2 py-2 ${selectedTab === "home" ? "border-b-2 border-blue-500" : ""}`} value="home" onClick={handleTabSelect}>Home</button>
          <button className={`flex-grow px-2 py-2 ${selectedTab === "editor" ? "border-b-2 border-blue-500" : ""}`} value="editor" onClick={handleTabSelect}>Editor</button>
          <button className={`flex-grow px-2 py-2 ${selectedTab === "functions" ? "border-b-2 border-blue-500" : ""}`} value="functions" onClick={handleTabSelect}>Functions</button>
          <button className={`flex-grow px-2 py-2 mr-2 ${selectedTab === "output" ? "border-b-2 border-blue-500" : ""}`} value="output" onClick={handleTabSelect}>Output</button>
        </div>
        <div className="flex-1 overflow-hidden">
          {selectedTab === "home" && (
            <HomeTab
              onTabClick={handleTabClick}
              setGeneratedCode={setGeneratedCode}
              setSelectedFunction={setSelectedFunction}
            />
          )}
          {selectedTab === "editor" && (
            <EditorTab
              selectedFunction={selectedFunction}
              setSelectedFunction={setSelectedFunction}
              onTest={handleTest}
              generatedCode={generatedCode}
              setGeneratedCode={setGeneratedCode}
              functionsCache={functionsCache}
              workbookFunctions={workbookFunctions}
              onedriveFunctions={onedriveFunctions}
              loadFunctions={loadFunctions}  // Changed from onFunctionSaved
            />
          )}
          {selectedTab === "output" && <OutputTab logs={logs} onClear={handleClear} setLogs={setLogs} />}
          {selectedTab === "functions" && (
            <FunctionsTab
              onEdit={handleFunctionEdit}
              onTest={handleTest}
              functionsCache={functionsCache}
              workbookFunctions={workbookFunctions}
              onedriveFunctions={onedriveFunctions}
              isLoading={isLoading}
              error={error}
              loadFunctions={loadFunctions}  // Changed from onFunctionDeleted
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
