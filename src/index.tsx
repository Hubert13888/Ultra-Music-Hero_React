import React from "react";
import ReactDOM from "react-dom";

import App from "./AppCanvas";
import Menu from "./menu/Menu";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <React.StrictMode>
    <Menu />
  </React.StrictMode>,
  rootElement
);
