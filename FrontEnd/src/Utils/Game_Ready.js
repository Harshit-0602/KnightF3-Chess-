export const Game_Ready=(payload,tools)=>{
    tools.navigate(`/game/${sessionStorage.getItem("gameId")}`);
};