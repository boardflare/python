import * as React from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import { FluentProvider, webLightTheme } from "@fluentui/react-components";

// Global window properties
window.appName = 'Python';
window.appConfig = {
  app_version: "1.1.0",
  content_group: window.appName,
  content_type: "Excel",
};
window.supportsF16 = false;
window.isChromiumOrEdge = false;

const rootElement = document.getElementById("container");

if (rootElement) {
  const root = createRoot(rootElement);

  // Initialize browser info and analytics
  async function initializeBrowserInfo() {
    const adapter = await navigator.gpu?.requestAdapter();
    window.supportsF16 = adapter?.features.has('shader-f16');
    const memory = navigator.deviceMemory;
    const cores = navigator.hardwareConcurrency;
    const downlink = navigator.connection?.downlink;

    // Set isChromiumOrEdge value
    const brands = navigator.userAgentData?.brands;
    if (brands) {
      window.isChromiumOrEdge = brands.some(brand =>
        ["Chromium", "Microsoft Edge"].includes(brand.brand)
      );
    }

    // Initialize analytics
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', 'G-8XNNM225DV', {
      ...window.appConfig,
      supportsF16: window.supportsF16,
      memory,
      cores
    });
  }

  Office.onReady(async () => {
    await initializeBrowserInfo();

    root.render(
      <FluentProvider theme={webLightTheme}>
        <App title={window.appName} />
      </FluentProvider>
    );
  });

  if (module.hot) {
    module.hot.accept("./components/App", () => {
      const NextApp = require("./components/App").default;
      root.render(
        <FluentProvider theme={webLightTheme}>
          <NextApp title={window.appName} />
        </FluentProvider>
      );
    });
  }
} else {
  console.error("Root element not found");
}
