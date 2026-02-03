export const Player_Disconnected=(payload,tools)=>{
    tools.navigate(`/waiting/${sessionStorage.getItem("gameId")}`);
}