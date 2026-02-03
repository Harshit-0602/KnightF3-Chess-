// src/context/GameContext.jsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { Castling, Elpassant, isMate, king, myColor, promotion, result, selected, turn, winner } from './Store/other';
import { grid_init } from './Store/grid';
import { Message_Dispatcher } from './Utils/Message_Dispatcher';

const GameContext = createContext();
export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
    const [ws, setWs] = useState(null);
    const navigate = useNavigate();
    
    // Get Recoil setters for all atoms
    const tools={
        setGrid: useSetRecoilState(grid_init),
        setTurn: useSetRecoilState(turn),
        setSelected: useSetRecoilState(selected),
        setKing: useSetRecoilState(king),
        setElpassant: useSetRecoilState(Elpassant),
        setCastling: useSetRecoilState(Castling),
        setIsMate:useSetRecoilState(isMate),
        setResult:useSetRecoilState(result),
        setWinner:useSetRecoilState(winner),
        setPromotion:useSetRecoilState(promotion),
        setMyColor:useSetRecoilState(myColor),
        navigate
    }

    const connectAndListen = () => {
        if (ws) return;

        const gameId=sessionStorage.getItem("gameId");
        const token=sessionStorage.getItem("token");

        // if game id or token doesnot exist cannot connect go back to the Home Page
        if(!gameId || !token) navigate("/");

        const socket = new WebSocket(`ws://localhost:8081?gameId=${gameId}&&token=${token}`);

        socket.onopen = () => console.log("WebSocket connected!");

        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const { type, payload,color} = message;
            Message_Dispatcher(type,payload,color,tools);
        };

        socket.onclose = () => {
            console.log("WebSocket disconnected.");
            setWs(null);
        };

        setWs(socket);
    };

    useEffect(() => {
        // This code runs once every time the app loads or is refreshed.
        const token = sessionStorage.getItem("token");
        
        // If a token is found, it means we were in an active session.
        if (token) {
            connectAndListen(); // Automatically reconnect.
        }
    }, []); // The empty array ensures this runs only once.

    const sendMessage = (type, payload) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type, payload }));
        }
    };
    
    const value = { connectAndListen, sendMessage };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    );
};