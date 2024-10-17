import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import './index.css'
import {Board} from "./Components/Board/Board.jsx";
import { RecoilRoot } from "recoil";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RecoilRoot>
      <Board />
    </RecoilRoot>
  </StrictMode>
);
