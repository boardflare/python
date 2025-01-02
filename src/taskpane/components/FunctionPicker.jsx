import * as React from "react";
import {
    Dropdown,
    Option,
    OptionGroup,
    Field,
    makeStyles,
} from "@fluentui/react-components";
import { getFunctionFromSettings } from "../utils/workbookSettings";
import { exampleFunctions } from "../utils/examples";

const useStyles = makeStyles({
    root: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        maxWidth: '400px',
    },
    dropdownContainer: {
        position: 'relative',
        height: '32px',
        marginBottom: '8px'
    }
});

const FunctionPicker = ({ onFunctionSelect }) => {
    const [selectedValue, setSelectedValue] = React.useState("");
    const [workbookFunctions, setWorkbookFunctions] = React.useState([]);
    const styles = useStyles();

    React.useEffect(() => {
        const loadWorkbookFunctions = async () => {
            const functions = await getFunctionFromSettings();
            setWorkbookFunctions(Array.isArray(functions) ? functions : []);
        };
        loadWorkbookFunctions();
    }, []);

    const onSelect = (e, data) => {
        setSelectedValue(data.value);

        const selectedFunction = exampleFunctions.find(f => f.name === data.value) ||
            workbookFunctions.find(f => f.name === data.value);

        console.log('Selected function:', selectedFunction); // Add debug logging

        if (selectedFunction && selectedFunction.code) {
            console.log('Function code:', selectedFunction.code); // Add debug logging
            onFunctionSelect(selectedFunction);
        }
    };

    return (
        <Field label="Select Function">
            <div className={styles.root}>
                <div className={styles.dropdownContainer}>
                    <Dropdown
                        value={selectedValue}
                        onOptionSelect={onSelect}
                        placeholder="Choose a function"
                    >
                        {exampleFunctions.length > 0 && (
                            <OptionGroup label="Example Functions">
                                {exampleFunctions.map((func) => (
                                    <Option key={func.name} value={func.name}>
                                        {func.name}
                                    </Option>
                                ))}
                            </OptionGroup>
                        )}

                        {workbookFunctions.length > 0 && (
                            <OptionGroup label="Workbook Functions">
                                {workbookFunctions.map((func) => (
                                    <Option key={func.name} value={func.name}>
                                        {func.name}
                                    </Option>
                                ))}
                            </OptionGroup>
                        )}
                    </Dropdown>
                </div>
            </div>
        </Field>
    );
};

export default FunctionPicker;
