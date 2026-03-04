import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// 在 Tauri 中，阻止全局的拖拽默认行为，防止文件被浏览器打开
window.addEventListener("dragover", (e) => {
  e.preventDefault();
}, false);

window.addEventListener("drop", (e) => {
  e.preventDefault();
}, false);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
