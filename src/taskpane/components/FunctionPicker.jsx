import * as React from "react";
import {
    TagPicker,
    TagPickerList,
    TagPickerInput,
    TagPickerControl,
    TagPickerOption,
    TagPickerGroup,
    TagPickerOptionGroup,
    Tag,
    Avatar,
    Field,
} from "@fluentui/react-components";

const builtInFunctions = ["SUM", "AVERAGE", "COUNT", "MAX", "MIN"];
const customFunctions = ["CUSTOMSUM", "CUSTOMAVG", "CUSTOMCOUNT"];

const FunctionPicker = () => {
    const [selectedOptions, setSelectedOptions] = React.useState([]);

    const onOptionSelect = (e, data) => {
        if (data.value === "no-options") {
            return;
        }
        setSelectedOptions(data.selectedOptions);
    };

    const unSelectedBuiltIn = builtInFunctions.filter(
        (option) => !selectedOptions.includes(option)
    );
    const unSelectedCustom = customFunctions.filter(
        (option) => !selectedOptions.includes(option)
    );

    return (
        <Field label="Select Functions" style={{ maxWidth: 400 }}>
            <TagPicker
                onOptionSelect={onOptionSelect}
                selectedOptions={selectedOptions}
            >
                <TagPickerControl>
                    <TagPickerGroup aria-label="Selected Functions">
                        {selectedOptions.map((option) => (
                            <Tag
                                key={option}
                                shape="rounded"
                                media={<Avatar aria-hidden name={option} color="colorful" />}
                                value={option}
                            >
                                {option}
                            </Tag>
                        ))}
                    </TagPickerGroup>
                    <TagPickerInput aria-label="Select Functions" />
                </TagPickerControl>
                <TagPickerList>
                    {unSelectedBuiltIn.length === 0 && unSelectedCustom.length === 0 && (
                        <TagPickerOption value="no-options">
                            No options available
                        </TagPickerOption>
                    )}

                    {unSelectedBuiltIn.length > 0 && (
                        <TagPickerOptionGroup label="Built-in Functions">
                            {unSelectedBuiltIn.map((option) => (
                                <TagPickerOption
                                    secondaryContent="Excel Built-in"
                                    media={
                                        <Avatar
                                            shape="square"
                                            aria-hidden
                                            name={option}
                                            color="colorful"
                                        />
                                    }
                                    value={option}
                                    key={option}
                                >
                                    {option}
                                </TagPickerOption>
                            ))}
                        </TagPickerOptionGroup>
                    )}

                    {unSelectedCustom.length > 0 && (
                        <TagPickerOptionGroup label="Custom Functions">
                            {unSelectedCustom.map((option) => (
                                <TagPickerOption
                                    secondaryContent="User Defined"
                                    media={
                                        <Avatar
                                            shape="square"
                                            aria-hidden
                                            name={option}
                                            color="colorful"
                                        />
                                    }
                                    value={option}
                                    key={option}
                                >
                                    {option}
                                </TagPickerOption>
                            ))}
                        </TagPickerOptionGroup>
                    )}
                </TagPickerList>
            </TagPicker>
        </Field>
    );
};

export default FunctionPicker;
