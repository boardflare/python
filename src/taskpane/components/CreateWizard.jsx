import * as React from "react";
import { MonacoEditor } from "./MonacoEditor";
import { TestFunction } from "./TestFunction";
import { SaveFunction } from "./SaveFunction";
import FunctionPicker from "./FunctionPicker";
import {
    makeStyles,
    tokens,
    Carousel,
    CarouselCard,
    CarouselNav,
    CarouselNavButton,
    CarouselViewport,
    CarouselSlider,
    Button,
} from "@fluentui/react-components";

const useStyles = makeStyles({
    carousel: {
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0 // Important for flex child
    },
    viewport: {
        flex: 1,
        minHeight: 0 // Important for flex child
    },
    slider: {
        height: '100%'
    },
    cardContainer: {
        alignContent: "center",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        minHeight: 0, // Important for flex child
        height: '400px' // Add fixed height
    },
    textContainer: {
        display: "flex",
        flexDirection: "column",
        padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
        "& h2": {
            margin: 0,
            marginBottom: tokens.spacingVerticalS
        },
        "& p": {
            margin: 0
        }
    },
    editorContainer: {
        flex: 1,
        minHeight: 0 // Important for flex child
    },
    footer: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "auto",
        padding: `${tokens.spacingVerticalS} ${tokens.spacingVerticalXXL} ${tokens.spacingVerticalXXL} ${tokens.spacingVerticalXXL}`,
    },
});

const CreateWizard = ({ onClose }) => {
    const styles = useStyles();
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [code, setCode] = React.useState('');
    const [selectedFunction, setSelectedFunction] = React.useState(null);
    const totalPages = 4; // We have 4 cards: select, code, test, and save

    const handleFunctionSelect = (func) => {
        console.log('CreateWizard received function:', func); // Add debug logging

        if (func && func.code) {
            console.log('Setting code:', func.code); // Add debug logging
            setSelectedFunction(func);
            setCode(func.code || ''); // Ensure we don't pass undefined
            setActiveIndex(1);
        }
    };

    const handleEditorChange = (value) => {
        console.log('Editor value changed:', value); // Add debug logging
        setCode(value || '');
    };

    const handleEditorMount = (editor) => {
        // No need to set up change handler here anymore
    };

    const handleNext = () => setActiveIndex(activeIndex + 1);
    const handlePrevious = () => setActiveIndex(activeIndex - 1);

    const renderNavigationButtons = () => {
        const isFirstPage = activeIndex === 0;
        const isLastPage = activeIndex === totalPages - 1;

        return (
            <div className={styles.footer}>
                <Button
                    onClick={isFirstPage ? onClose : handlePrevious}
                >
                    {isFirstPage ? "Cancel" : "Previous"}
                </Button>

                <CarouselNav appearance="brand">
                    {(index) => (
                        <CarouselNavButton aria-label={`Carousel Nav Button ${index}`} />
                    )}
                </CarouselNav>

                <Button
                    appearance="primary"
                    onClick={isLastPage ? onClose : handleNext}
                >
                    {isLastPage ? "Done" : "Next"}
                </Button>
            </div>
        );
    };

    return (
        <Carousel
            className={styles.carousel}
            groupSize={1}
            activeIndex={activeIndex}
            onActiveIndexChange={(e, data) => setActiveIndex(data.index)}
        >
            <CarouselViewport className={styles.viewport}>
                <CarouselSlider className={styles.slider}>
                    <CarouselCard
                        className={styles.cardContainer}
                        id="select-function"
                    >
                        <div className={styles.textContainer}>
                            <h2>Step 1: Select Function</h2>
                            <p>Select a function to edit from our samples or one of your existing functions.</p>
                        </div>
                        <div className={styles.editorContainer}>
                            <FunctionPicker onFunctionSelect={handleFunctionSelect} />
                        </div>
                    </CarouselCard>
                    <CarouselCard
                        className={styles.cardContainer}
                        id="code-function"
                    >
                        <div className={styles.textContainer}>
                            <h2>Step 2: Code Function</h2>
                            <p>Pro Tip: Drag your task pane wider for more room!</p>
                        </div>
                        <div className={styles.editorContainer}>
                            {code && ( // Only render editor when code exists
                                <MonacoEditor
                                    key={selectedFunction?.name} // Add key to force re-render
                                    value={code}
                                    onChange={handleEditorChange}
                                    onMount={handleEditorMount}
                                />
                            )}
                        </div>
                    </CarouselCard>
                    <CarouselCard
                        className={styles.cardContainer}
                        id="test-function"
                    >
                        <div className={styles.textContainer}>
                            <h2>Step 3: Test Function</h2>
                            <p>Click the button below to test your function using the examples you provided.</p>
                        </div>
                        <TestFunction code={code} />
                    </CarouselCard>
                    <CarouselCard
                        className={styles.cardContainer}
                        id="save-function"
                    >
                        <div className={styles.textContainer}>
                            <h2>Step 4: Save Function</h2>
                            <p>Click Save to store this function locally in your workbook.</p>
                        </div>
                        <SaveFunction code={code} />
                    </CarouselCard>
                </CarouselSlider>
            </CarouselViewport>
            {renderNavigationButtons()}
        </Carousel>
    );
};

export default CreateWizard;
