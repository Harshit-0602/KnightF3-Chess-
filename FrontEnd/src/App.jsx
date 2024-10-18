import { RecoilRoot } from "recoil";
import {Board} from "./Components/Board/Board.jsx";
export const App = () => {
    return (
        <RecoilRoot>
            <Board />
        </RecoilRoot>
    );
};
