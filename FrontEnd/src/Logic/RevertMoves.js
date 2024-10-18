export const revert = (mat) => {
    // Create a deep copy of the grid
    let grid = mat.map((row) =>
        row.map((cell) => ({
            ...cell,
            highlight: false, // Reset highlight to false
            underAttack: false, // Reset underAttack to false
        }))
    );

    return grid; // Return the updated grid
};
