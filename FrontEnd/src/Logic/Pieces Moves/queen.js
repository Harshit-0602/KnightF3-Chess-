export const queen = (r, c, mat) => {
    let grid = mat.map((row) => row.map((cell) => ({ ...cell })));
    let my = grid[r][c];
    for (let i = r - 1, j = c - 1; i >= 0 && j >= 0; i--, j--) {
        let cell = grid[i][j];
        if (cell.piece[0] == my.piece[0]) break;
        else if (cell.piece != "" && cell.piece[0] != my.piece[0]) {
            cell.underAttack = true;
            break;
        }
        cell.highlight = true;
    }
    for (let i = r - 1, j = c + 1; i >= 0 && j < 8; i--, j++) {
        let cell = grid[i][j];
        if (cell.piece[0] == my.piece[0]) break;
        else if (cell.piece != "" && cell.piece[0] != my.piece[0]) {
            cell.underAttack = true;
            break;
        }
        cell.highlight = true;
    }
    for (let i = r + 1, j = c + 1; i < 8 && j < 8; i++, j++) {
        let cell = grid[i][j];
        if (cell.piece[0] == my.piece[0]) break;
        else if (cell.piece != "" && cell.piece[0] != my.piece[0]) {
            cell.underAttack = true;
            break;
        }
        cell.highlight = true;
    }
    for (let i = r + 1, j = c - 1; i < 8 && j >= 0; i++, j--) {
        let cell = grid[i][j];
        if (cell.piece[0] == my.piece[0]) break;
        else if (cell.piece != "" && cell.piece[0] != my.piece[0]) {
            cell.underAttack = true;
            break;
        }
        cell.highlight = true;
    }
    for (let i = c - 1; i >= 0; i--) {
        let cell = grid[r][i];
        if (cell.piece[0] == my.piece[0]) break;
        else if (cell.piece != "" && cell.piece[0] != my.piece[0]) {
            grid[r][i].underAttack = true;
            break;
        }
        grid[r][i].highlight = true;
    }
    for (let i = c + 1; i < 8; i++) {
        let cell = grid[r][i];
        if (cell.piece[0] == my.piece[0]) break;
        else if (cell.piece != "" && cell.piece[0] != my.piece[0]) {
            grid[r][i].underAttack = true;
            break;
        }
        grid[r][i].highlight = true;
    }
    for (let i = r + 1; i < 8; i++) {
        let cell = grid[i][c];
        if (cell.piece[0] == my.piece[0]) break;
        else if (cell.piece != "" && cell.piece[0] != my.piece[0]) {
            grid[i][c].underAttack = true;
            break;
        }
        grid[i][c].highlight = true;
    }
    for (let i = r - 1; i >= 0; i--) {
        let cell = grid[i][c];
        if (cell.piece[0] == my.piece[0]) break;
        else if (cell.piece != "" && cell.piece[0] != my.piece[0]) {
            grid[i][c].underAttack = true;
            break;
        }
        // console.log(grid[i][c].highlight);
        grid[i][c].highlight = true;
    }
    return grid;
};