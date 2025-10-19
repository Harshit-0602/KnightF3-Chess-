import { RecoilRoot } from "recoil";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "./GameProvider.jsx"; // 1. Import your GameProvider
import { Board } from "./Components/Board/Board2.jsx";
import Home from "./Components/Home/Home.jsx";
import Waiting from "./Components/Waiting/Waiting.jsx"; 

export const App = () => {
    return (
        <RecoilRoot>
            <BrowserRouter>
                {/* 2. Wrap your routes with the GameProvider */}
                <GameProvider>
                    <Routes>
                        {/* Your routes remain unchanged */}
                        <Route path="/" element={<Home />} />
                        <Route path="/waiting/:gameId" element={<Waiting />} />
                        <Route path="/game/:gameId" element={<Board />} />
                    </Routes>
                </GameProvider>
            </BrowserRouter>
        </RecoilRoot>
    );
};