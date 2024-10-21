import { atom } from "recoil";

export const selected = atom({
    key: "selected",
    default: {
        isSelected: false,
        row: -1,
        col: -1,
    },
});


export const turn = atom({
    key: "turn",
    default:"w"
})


export const king = atom({
    key: "king",
    default: {
        "b": {
            pos: {
                row: 0,
                col: 4,
            },
            check: {
                status: false, // Indicates whether the king is in check
                allowed: [], // Array to track allowed moves while in check
            },
            pinned: [],
        },
        "w": {
            pos: {
                row: 7,
                col: 4,
            },
            check: {
                status: false, // Indicates whether the king is in check
                allowed: [], // Array to track allowed moves while in check
            },
            pinned: [],
        }
    }
});