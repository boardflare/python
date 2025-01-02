import * as React from "react";
import {
    MessageBar,
    MessageBarTitle,
    MessageBarBody,
    MessageBarIntent,
    makeStyles,
    Button,
} from "@fluentui/react-components";
import { getFunctionFromSettings, saveFunctionToSettings } from "../utils/workbookSettings";
import { parsePython } from "../utils/codeparser";

const useStyles = makeStyles({
    container: {
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        gap: "16px",
    },
});

export const SaveFunction = ({ code }) => {
    const styles = useStyles();
    const [status, setStatus] = React.useState({ message: "", intent: "success" });

    const handleSave = async () => {
        try {
            const functionData = parsePython(code);
            const existingFunction = await getFunctionFromSettings(functionData.name);

            if (existingFunction) {
                setStatus({
                    message: "A function with this name already exists",
                    intent: "error"
                });
                return;
            }

            await saveFunctionToSettings(functionData);
            setStatus({
                message: "Function saved successfully",
                intent: "success"
            });
        } catch (error) {
            setStatus({
                message: "Failed to save function: " + error.message,
                intent: "error"
            });
        }
    };

    return (
        <div className={styles.container}>
            <MessageBar intent={status.intent}>
                <MessageBarBody>
                    <MessageBarTitle>
                        {status.message || "Ready to Save"}
                    </MessageBarTitle>
                    {!status.message && "Your function has been validated and is ready to be saved to the workbook."}
                </MessageBarBody>
            </MessageBar>
            <Button appearance="primary" onClick={handleSave}>
                Save Function
            </Button>
        </div>
    );
};
