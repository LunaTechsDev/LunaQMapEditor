try {
  process.env.PRODUCTION = false;
  require("babel-register");
} catch (err) {
  process.env.PRODUCTION = true;
}

if (
  (process.argv || []).indexOf("--dev") !== -1 ||
  process.env.NODE_ENV === "development"
) {
  require("electron-reload")("./");
}

import "./main.js";
