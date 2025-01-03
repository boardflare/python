import * as React from "react";
import EditorTab from "./EditorTab";
import OutputTab from "./OutputTab";
import HomeTab from "./HomeTab";
import FunctionsTab from "./FunctionsTab";
import { EventTypes } from "../utils/constants";

const App = ({ title }) => {
  const [selectedTab, setSelectedTab] = React.useState("home");
  const [selectedFunction, setSelectedFunction] = React.useState("");
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
    setSelectedTab(event.target.value);
  };

  const handleFunctionEdit = (functionName) => {
    setSelectedFunction(functionName);
    setSelectedTab("editor");
  };

  const handleTest = () => {
    setSelectedTab("output");
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <main className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="flex space-x-4 p-2 border-b">
          <button className={`px-4 py-2 ${selectedTab === "home" ? "bg-blue-500 text-white" : "bg-gray-200"}`} value="home" onClick={handleTabSelect}>Home</button>
          <button className={`px-4 py-2 ${selectedTab === "editor" ? "bg-blue-500 text-white" : "bg-gray-200"}`} value="editor" onClick={handleTabSelect}>Edit</button>
          <button className={`px-4 py-2 ${selectedTab === "output" ? "bg-blue-500 text-white" : "bg-gray-200"}`} value="output" onClick={handleTabSelect}>Output</button>
          <button className={`px-4 py-2 ${selectedTab === "functions" ? "bg-blue-500 text-white" : "bg-gray-200"}`} value="functions" onClick={handleTabSelect}>Functions</button>
        </div>
        <div className="flex-1 overflow-hidden p-2">
          {selectedTab === "home" && <HomeTab />}
          {selectedTab === "editor" && <EditorTab initialFunction={selectedFunction} onTest={handleTest} />}
          {selectedTab === "output" && <OutputTab logs={logs} onClear={handleClear} setLogs={setLogs} />}
          {selectedTab === "functions" && <FunctionsTab onEdit={handleFunctionEdit} />}
        </div>
      </main>
    </div>
  );
};

export default App;
