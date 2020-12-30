import React from "react";
import ReactDOM from "react-dom";

import App from "./App";
import AppCanvas from "./AppCanvas";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <AppCanvas />
  </React.StrictMode>,
  rootElement
);
