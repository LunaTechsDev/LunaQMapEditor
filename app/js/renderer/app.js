import React from "react";
import ReactDOM from "react-dom";

import Store from "./store";
import "./style/index";
import Layout from "./components/layout.jsx";

ReactDOM.render(<Layout store={Store} />, document.getElementById("app"));

window.onerror = function (errorMsg, url, lineNumber, column, errorObj) {
  Store.notify("ERROR", `${errorMsg}\n${url}:${lineNumber}`);
};
