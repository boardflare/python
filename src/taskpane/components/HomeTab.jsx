import * as React from "react";
import {
    makeStyles,
    Button,
    Dialog,
    DialogSurface,
    DialogTrigger,
} from "@fluentui/react-components";
import CreateWizard from "./CreateWizard";

const useStyles = makeStyles({
    surface: {
        padding: 0,
        border: "none",
        overflow: "hidden",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        borderRadius: 0
    },
    headerContent: {
        marginBottom: "20px",
    },
    linkButtons: {
        display: "flex",
        justifyContent: "center",
        gap: "10px",
        marginBottom: "20px"
    },
    createButton: {
        display: "flex",
        justifyContent: "center",
        marginBottom: "20px"
    }
});

const HomeTab = () => {
    const styles = useStyles();
    const [open, setModalOpen] = React.useState(false);

    return (
        <div>
            <div className={styles.headerContent}>
                <h2>Run Python functions in Excel🚀</h2>
                <p>For example, a Python function</p>
                <pre><code>{`def hello(name):
    return f"Hello {name}!"`}</code></pre>
                <p>becomes</p>
                <pre><code>=HELLO(name)</code></pre>
                <p>Get started by watching the tutorial video and reading the documentation first, then launch the Function Builder.</p>
            </div>

            <div className={styles.linkButtons}>
                <Button
                    appearance="secondary"
                    as="a"
                    href="https://www.boardflare.com/apps/excel/python"
                    target="_blank"
                    rel="noopener"
                >
                    Tutorial
                </Button>
                <Button
                    appearance="secondary"
                    as="a"
                    href="https://www.boardflare.com/apps/excel/python"
                    target="_blank"
                    rel="noopener"
                >
                    Documentation
                </Button>
                <Button
                    appearance="secondary"
                    as="a"
                    href="https://www.boardflare.com/company/support"
                    target="_blank"
                    rel="noopener"
                >
                    Support
                </Button>
            </div>

            <div className={styles.createButton}>
                <Dialog
                    modalType="alert"
                    open={open}
                    onOpenChange={(e, data) => setModalOpen(data.open)}
                >
                    <DialogTrigger>
                        <Button appearance="primary">Function Builder</Button>
                    </DialogTrigger>
                    <DialogSurface className={styles.surface}>
                        <CreateWizard onClose={() => setModalOpen(false)} />
                    </DialogSurface>
                </Dialog>
            </div>
        </div>
    );
};

export default HomeTab;
