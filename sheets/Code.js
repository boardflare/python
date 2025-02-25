// Store for pending Python requests and results
const PENDING_REQUESTS_KEY = "PENDING_PYTHON_REQUESTS";

/**
 * Custom function to execute Python code using Pyodide
 * 
 * @param {string} python_code - The Python code to execute
 * @return The result of executing the Python code
 * @customfunction
 */
function PYTHON(python_code) {
    const sheet = SpreadsheetApp.getActiveSheet();
    const cell = sheet.getActiveCell();
    const cellA1 = cell.getA1Notation();

    // Store the request with a unique identifier
    const requestId = Utilities.getUuid();
    const request = {
        id: requestId,
        code: python_code,
        cell: cellA1,
        timestamp: new Date().getTime()
    };

    // Get current pending requests
    const userProperties = PropertiesService.getUserProperties();
    const pendingRequestsJson = userProperties.getProperty(PENDING_REQUESTS_KEY) || "{}";
    const pendingRequests = JSON.parse(pendingRequestsJson);

    // Add this request
    pendingRequests[requestId] = request;

    // Store back
    userProperties.setProperty(PENDING_REQUESTS_KEY, JSON.stringify(pendingRequests));

    return "Calculating..."; // Placeholder until result is ready
}

/**
 * Shows the sidebar in the spreadsheet with the Pyodide runtime
 */
function showPythonSidebar() {
    const ui = HtmlService.createHtmlOutputFromFile('Sidebar')
        .setTitle('Python Runner')
        .setWidth(400);
    SpreadsheetApp.getUi().showSidebar(ui);
}

/**
 * Adds menu items when the spreadsheet opens
 */
function onOpen() {
    SpreadsheetApp.getUi()
        .createMenu('Python')
        .addItem('Open Python Runner', 'showPythonSidebar')
        .addToUi();
}

/**
 * Gets pending Python requests for the sidebar to process
 */
function getPendingRequests() {
    const userProperties = PropertiesService.getUserProperties();
    const pendingRequestsJson = userProperties.getProperty(PENDING_REQUESTS_KEY) || "{}";
    return JSON.parse(pendingRequestsJson);
}

/**
 * Marks requests as processed and saves results
 */
function saveResults(results) {
    const userProperties = PropertiesService.getUserProperties();

    // Get pending requests
    const pendingRequestsJson = userProperties.getProperty(PENDING_REQUESTS_KEY) || "{}";
    const pendingRequests = JSON.parse(pendingRequestsJson);

    // For each result, update the corresponding cell and remove from pending
    for (const requestId in results) {
        if (pendingRequests[requestId]) {
            const request = pendingRequests[requestId];
            const result = results[requestId];

            // Update the cell with the result
            const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
            try {
                sheet.getRange(request.cell).setValue(result);
            } catch (e) {
                console.error("Error updating cell:", e);
            }

            // Remove from pending
            delete pendingRequests[requestId];
        }
    }

    // Save updated pending requests
    userProperties.setProperty(PENDING_REQUESTS_KEY, JSON.stringify(pendingRequests));
}
