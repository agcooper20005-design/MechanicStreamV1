import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AppProvider } from "./state/AppContext";
import { UIProvider } from "./state/UIContext";
import "./styles.css";
import "./print.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <UIProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </UIProvider>
  </React.StrictMode>,
);
