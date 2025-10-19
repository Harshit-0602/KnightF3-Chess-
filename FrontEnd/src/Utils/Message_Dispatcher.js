import { Game_Ready } from "./Game_Ready";
import { Move_Given } from "./Move_Given";
import { Move_Made } from "./Move_Made";
import { Player_Connected } from "./Player_Connected";
import { Player_Disconnected } from "./Player_Disconnected";

export const Message_Dispatcher=(type,payload,color,tools)=>{
    switch(type){
        case "Game_Ready":{
            console.log("Game Ready Both Socket Connected");
            Game_Ready(payload,tools);
            break;
        }
        case "Player_Connected":{
            console.log("One Socket Connected");
            Player_Connected(payload,color,tools);
            break;
        }
        case "Player_Disconnected":{
            console.log(`Player - ${payload.playerColor} disconnected`);
            Player_Disconnected(payload,tools);
            break;            
        }
        case "Move_Given":{
            console.log("Move Given Successfully !! ");
            Move_Given(payload,tools);
            break;
        }
        case "Move_Made":{
            console.log("Move Made Successfully !! ");
            Move_Made(payload,tools);
            break;       
        }
        default: // handles error
        {
            console.log("Some Error Occurred while Connecting to the WebSocket or Talking to it");
        } 
    }
};