import { abortController } from "./utils/common.js";
import { initGradioEditor } from './editor/gradio.js';
import { initMonacoEditor } from './editor/monaco.js';

window.appName = 'Python';
window.enableAdvancedFeatures = false; // Feature flag

// Google Analytics config
window.appConfig = {
    app_version: "1.1.0",
    content_group: window.appName,
    content_type: "Excel",
};

window.supportsF16 = false;
window.isChromiumOrEdge = false;

// Function to initialize browser info
async function initializeBrowserInfo() {
    // Browser info
    const adapter = await navigator.gpu.requestAdapter();
    window.supportsF16 = adapter?.features.has('shader-f16');
    const memory = navigator.deviceMemory;
    const cores = navigator.hardwareConcurrency;
    const downlink = navigator.connection.downlink;

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', 'G-8XNNM225DV', {
        ...window.appConfig,
        //debug_mode: true,
        supportsF16: window.supportsF16,
        memory: memory,
        cores: cores
    });

    // Set isChromiumOrEdge value
    const brands = navigator.userAgentData?.brands;
    if (brands) {
        isChromiumOrEdge = brands.some(brand => ["Chromium", "Microsoft Edge"].includes(brand.brand));
    }
}

// Show a specific tab programmatically
window.showTab = function (tabId) {
    const tab = new bootstrap.Tab(document.querySelector(`button[data-bs-target="#${tabId}"]`));
    tab.show();
};

// Setup page on load
document.addEventListener('DOMContentLoaded', async function () {
    await initializeBrowserInfo();

    // Hide advanced tabs and containers if features disabled
    if (!window.enableAdvancedFeatures) {
        ['editor-tab', 'demo-tab'].forEach(id => {
            const element = document.getElementById(id)?.closest('.nav-item');
            if (element) element.style.display = 'none';
        });
        // Also hide the editor containers
        ['monaco-editor-container', 'gradioContainer'].forEach(id => {
            const element = document.getElementById(id);
            if (element) element.style.display = 'none';
        });
    }

    // Initialize only needed editors
    await initMonacoEditor();
    if (window.enableAdvancedFeatures) {
        await initGradioEditor();
    }

    // cancel button
    const cancelButton = document.getElementById('cancelButton');
    cancelButton.addEventListener('click', function () {
        this.disabled = true; // disable the button after first click
        console.log('Cancel button clicked from taskpane!');
        // Abort ongoing tasks in p-queue
        abortController.abort();
        // Reload to reset the app
        setTimeout(function () {
            location.reload();
        }, 500);
    });
});