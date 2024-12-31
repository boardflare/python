import * as React from "react";
import PropTypes from "prop-types";
import { makeStyles, Tab, TabList } from "@fluentui/react-components";
import EditorTab from "./EditorTab";
import ConsoleTab from "./ConsoleTab";
import HelpTab from "./HelpTab";
import HomeTab from "./HomeTab";
import DialogTab from "./DialogTab";
import FunctionsTab from "./FunctionsTab";
import { EventTypes } from "../utils/constants";

const useStyles = makeStyles({
  root: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minHeight: 0
  },
  tabContent: {
    flex: 1,
    overflow: "hidden"
  }
});

const App = ({ title }) => {
  const styles = useStyles();
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

  const handleTabSelect = (event, data) => {
    setSelectedTab(data.value);
  };

  const handleFunctionEdit = (functionName) => {
    setSelectedFunction(functionName);
    setSelectedTab("editor");
  };

  return (
    <div className={styles.root}>
      <main className={styles.main}>
        <TabList selectedValue={selectedTab} onTabSelect={handleTabSelect}>
          <Tab value="home">Home</Tab>
          <Tab value="editor">Editor</Tab>
          <Tab value="console">Console</Tab>
          <Tab value="help">Help</Tab>
          <Tab value="dialog">Dialog</Tab>
          <Tab value="functions">Functions</Tab>
        </TabList>
        <div className={styles.tabContent}>
          {selectedTab === "home" && <HomeTab />}
          {selectedTab === "editor" && <EditorTab initialFunction={selectedFunction} />}
          {selectedTab === "console" && <ConsoleTab logs={logs} onClear={handleClear} />}
          {selectedTab === "help" && <HelpTab />}
          {selectedTab === "dialog" && <DialogTab />}
          {selectedTab === "functions" && <FunctionsTab onEdit={handleFunctionEdit} />}
        </div>
      </main>
    </div>
  );
};

App.propTypes = {
  title: PropTypes.string
};

export default App;
