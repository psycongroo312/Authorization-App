import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

if (import.meta.env.DEV) {
  import("./moks/browser.ts")
    .then(async ({ worker }) => {
      await worker.start({
        onUnhandledRequest: "bypass",
        serviceWorker: {
          url: "/mockServiceWorker.js",
        },
      });
      console.log("MSW ready");

      startApp();
    })
    .catch((err) => console.error("MSW error:", err));
} else {
  startApp();
}

function startApp() {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
