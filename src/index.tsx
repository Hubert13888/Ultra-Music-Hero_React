import React from "react";
import ReactDOM from "react-dom";

import reducers from "./redux/reducers";
import { Provider } from "react-redux";
import { createStore } from "redux";

import Menu from "./menu/Menu";

const store = createStore(reducers);
ReactDOM.render(
  <Provider store={store}>
    <React.StrictMode>
      <Menu />
    </React.StrictMode>
  </Provider>,
  document.getElementById("root")
);
