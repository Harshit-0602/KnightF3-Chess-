export const Player_Connected=(payload,color,tools)=>{
    tools.setGrid(payload.grid);
    tools.setTurn(payload.turn);
    tools.setSelected(payload.selected);
    tools.setKing(payload.king);
    tools.setElpassant(payload.enPassant);
    tools.setCastling(payload.castling);
    tools.setIsMate(payload.isMate);
    tools.setResult(payload.result);
    tools.setWinner(payload.winner);
    tools.setPromotion(payload.promotion);
    tools.setMyColor(color);
};