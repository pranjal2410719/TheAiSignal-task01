import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import ComparePage from "./Compare.jsx";
import "./index.css";

const isCompareRoute = window.location.pathname.replace(/\/$/, "") === "/compare";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {isCompareRoute ? <ComparePage /> : <App />}
  </React.StrictMode>,
);
