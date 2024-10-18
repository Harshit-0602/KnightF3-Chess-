const fn = (cell,my) => {
    if (cell.piece[0] == my.piece[0]) return;
        else if (cell.piece != "" && cell.piece[0] != my.piece[0]) {
            cell.underAttack = true;
            return;
        }
        cell.highlight = true;
}
export const king = (r, c, mat) => {
    let grid = mat.map((row) => row.map((cell) => ({ ...cell })));
    let my = grid[r][c];
    if (r + 1 < 8) fn(grid[r + 1][c], my);//down
    if (r - 1 >= 0) fn(grid[r - 1][c], my);//up
    if (c - 1 >= 0) fn(grid[r][c - 1], my);//left
    if (c + 1 < 8) fn(grid[r][c + 1], my);//right
    if (r - 1 >= 0 && c - 1 >= 0) fn(grid[r - 1][c - 1], my);//up-left
    if (r - 1 >= 0 && c + 1 < 8) fn(grid[r - 1][c + 1], my);//up-right
    if (r + 1 < 8 && c - 1 >= 0) fn(grid[r + 1][c - 1], my);//down-left
    if (r + 1 < 8 && c + 1 < 8) fn(grid[r + 1][c + 1], my);//down-right
    return grid;
}; 