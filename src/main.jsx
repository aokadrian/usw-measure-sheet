import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MeasureSheet from "./MeasureSheet";
import FinalMeasure from "./FinalMeasure";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MeasureSheet />} />
        <Route path="/final-measure" element={<FinalMeasure />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
