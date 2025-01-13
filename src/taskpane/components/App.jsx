import * as React from "react";
import EditorTab from "./EditorTab";
import OutputTab from "./OutputTab";
import HomeTab from "./HomeTab";
import FunctionsTab from "./FunctionsTab";
import { EventTypes } from "../utils/constants";

const App = ({ title }) => {
  const [selectedTab, setSelectedTab] = React.useState("home");
  const [selectedFunction, setSelectedFunction] = React.useState({ name: "", code: "" });
  const [logs, setLogs] = React.useState([]);

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
    // Preserve editor content when switching tabs
    if (event.target.value === "editor" && selectedFunction.code) {
      setSelectedTab("editor");
    } else {
      setSelectedTab(event.target.value);
    }
  };

  const handleFunctionEdit = (functionName) => {
    setSelectedFunction({ name: functionName, code: "" }); // code will be set by EditorTab when loaded
    setSelectedTab("editor");
  };

  const handleTest = () => {
    setSelectedTab("output");
  };

  const handleTabClick = (tab) => {
    setSelectedTab(tab);
  };

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
          {selectedTab === "home" && <HomeTab onTabClick={(tab) => handleTabClick(tab)} />}
          {selectedTab === "editor" && (
            <EditorTab
              selectedFunction={selectedFunction}
              setSelectedFunction={setSelectedFunction}
              onTest={handleTest}
            />
          )}
          {selectedTab === "output" && <OutputTab logs={logs} onClear={handleClear} setLogs={setLogs} />}
          {selectedTab === "functions" && <FunctionsTab onEdit={handleFunctionEdit} />}
        </div>
      </main>
    </div>
  );
};

export default App;
