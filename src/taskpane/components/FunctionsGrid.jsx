import * as React from "react";
import {
    DataGrid,
    DataGridBody,
    DataGridRow,
    DataGridHeader,
    DataGridHeaderCell,
    DataGridCell,
    Button,
    createTableColumn,
    makeStyles,
    Spinner,
} from "@fluentui/react-components";
import { Edit24Regular } from "@fluentui/react-icons";
import { getFunctionFromSettings } from "../utils/workbookSettings";

const useStyles = makeStyles({
    emptyState: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "20px",
        textAlign: "center",
        color: "#666",
    },
    emptyStateIcon: {
        fontSize: "48px",
        marginBottom: "16px",
    },
    emptyStateText: {
        fontSize: "16px",
        marginBottom: "8px",
    },
});

const EmptyState = () => {
    const styles = useStyles();
    return (
        <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📝</div>
            <div className={styles.emptyStateText}>No functions found</div>
            <div>Create new functions using the Editor tab</div>
        </div>
    );
};

export const FunctionsGrid = ({ onEdit }) => {
    const styles = useStyles();
    const [functions, setFunctions] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        const loadFunctions = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const functionsData = await getFunctionFromSettings();
                const functionsWithIds = (functionsData || []).map((func, index) => ({
                    ...func,
                    id: index + 1
                }));
                setFunctions(functionsWithIds);
            } catch (error) {
                console.error('Error loading functions:', error);
                setError('Failed to load functions. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };
        loadFunctions();
    }, []);

    const columns = [
        createTableColumn({
            columnId: "name",
            renderHeaderCell: () => "Function Name",
            renderCell: (item) => item.name,
        }),
        createTableColumn({
            columnId: "description",
            renderHeaderCell: () => "Description",
            renderCell: (item) => item.description,
        }),
        createTableColumn({
            columnId: "actions",
            renderHeaderCell: () => "Actions",
            renderCell: (item) => (
                <Button
                    icon={<Edit24Regular />}
                    onClick={() => onEdit(item.name)}
                >
                    Edit
                </Button>
            ),
        }),
    ];

    if (isLoading) {
        return <Spinner />;
    }

    if (error) {
        return (
            <div className={styles.emptyState}>
                <div className={styles.emptyStateText}>{error}</div>
            </div>
        );
    }

    if (!functions.length) {
        return <EmptyState />;
    }

    return (
        <DataGrid
            items={functions}
            columns={columns}
            getRowId={(item) => item.id}
        >
            <DataGridHeader>
                <DataGridRow>
                    {({ renderHeaderCell }) => (
                        <DataGridHeaderCell>
                            {renderHeaderCell()}
                        </DataGridHeaderCell>
                    )}
                </DataGridRow>
            </DataGridHeader>
            <DataGridBody>
                {({ item, rowId }) => (
                    <DataGridRow key={rowId}>
                        {({ renderCell }) => (
                            <DataGridCell>
                                {renderCell(item)}
                            </DataGridCell>
                        )}
                    </DataGridRow>
                )}
            </DataGridBody>
        </DataGrid>
    );
};