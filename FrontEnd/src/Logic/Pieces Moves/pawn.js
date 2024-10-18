const valid = (i, j) => {
    if (i >= 8 || j >= 8 || i < 0 || j < 0) return false;
    else return true;
}

export const pawn = (r, c, mat) => {
    let grid = mat.map((row) => row.map((cell) => ({ ...cell })));
    let my = grid[r][c];
    let color = my.piece[0];
    let direction = 0;
    let valid_for_two = 0;
    if (color == 'w') {
        direction = -1;
        if (r === 6) valid_for_two = -1;
    }
    else {
        direction = 1;
        if (r === 1) valid_for_two = 1;
    }
    if (valid(r + direction, c) && grid[r + direction][c].piece == "") {
        grid[r + direction][c].highlight = true;
    }
    if (valid_for_two != 0 && grid[r + direction + valid_for_two][c].piece == "") {
        grid[r + direction + valid_for_two][c].highlight = true;
    }
    if (
        valid(r + direction, c - 1) &&
        grid[r + direction][c - 1].piece != "" &&
        grid[r + direction][c - 1].piece[0] != color
    ) {
        grid[r + direction][c - 1].underAttack = true;
    }
    if (
        valid(r + direction, c + 1) &&
        grid[r + direction][c + 1].piece != "" &&
        grid[r + direction][c + 1].piece[0] != color
    ) {
        grid[r + direction][c + 1].underAttack = true;
    }
    return grid;
};
