/**
 * Shows the sidebar in the spreadsheet with the Pyodide runtime
 */
function showPythonSidebar() {
    const ui = HtmlService.createTemplateFromFile('Sidebar')
        .evaluate()
        .setTitle('Python for Sheets')
    SpreadsheetApp.getUi().showSidebar(ui);
}

/**
 * Adds menu items when the spreadsheet opens
 */
function onOpen() {
    SpreadsheetApp.getUi()
        .createAddonMenu()
        .addItem('Start', 'showPythonSidebar')
        .addToUi();
}

/**
 * Helper function to include HTML templates
 */
function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getSelectedRange() {
    const selection = SpreadsheetApp.getActiveSpreadsheet().getSelection();
    const range = selection.getActiveRange();
    Logger.log(range.getValues());
    Logger.log(range.getA1Notation());
    if (!range) {
        return null;
    }
    return {
        values: range.getValues(),
        address: range.getA1Notation()
    };
}