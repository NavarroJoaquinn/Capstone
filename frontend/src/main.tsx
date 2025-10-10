import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const qc = new QueryClient();

async function enableMocks() {
  if (import.meta.env.VITE_USE_MOCKS === "true") {
    try {
      const { worker } = await import("./mocks/browser");
      await worker.start({ onUnhandledRequest: "bypass" });
      console.info("[MSW] started");
    } catch (e) {
      console.error("[MSW] failed to start:", e);
    }
  }
}

enableMocks().finally(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <QueryClientProvider client={qc}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>
  );
});