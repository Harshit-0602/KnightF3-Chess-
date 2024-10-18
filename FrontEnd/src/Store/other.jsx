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