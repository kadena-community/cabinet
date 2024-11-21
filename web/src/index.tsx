import "@reach/dialog/styles.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App";
import KadenaProvider from "./features/components/KadenaProvider";
import "./styles/global-style.css";

const container = document.getElementById("root")!;
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <KadenaProvider>
        <App />
      </KadenaProvider>
    </Provider>
  </React.StrictMode>,
);
