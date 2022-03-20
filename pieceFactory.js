const pieceFactory = (() => {
    const Piece = (x, y, color) => {
        const getX = () => x;
        const getY = () => y;
        const direction = color === "black" ? 1 : -1;
        const getColor = () => color;
        const getClass = () => [color.concat("-piece")];
        const getID = () => [x, y].join("");
        let tookPiece = false;
        const justTook = () => tookPiece;

        const getEveryDiagMove = (board) => {
            let options = [];
            for (let a = 0, i = -1; a < 2; a++, i *= -1) {
                const moveDiag = checkMoveDiag(x, y, direction, i, board);
                if (moveDiag) options.push(moveDiag);
            }
            return options;
        }

        const checkMoveDiag = (x, y, direction, orientation, board) => {
            const newX = x + direction;
            const newY = y + orientation;
            if (outOfRange(newX, newY, board)) return;
            const diag = board[newX][newY];
            if (diag === null) return [newX, newY].join("");
        }

        const outOfRange = (newX, newY, board) => {
            const xOutRange = !(newX < board.length && newX > -1);
            const yOutRange = !(newY < board.length && newY > -1);
            return xOutRange || yOutRange;
        }

        const getEveryDiagTake = (board) => {
            let options = [];
            for (let a = 0, i = -1; a < 2; a++, i *= -1) 
                for (let b = 0, j = -1; b < 2; b++, j *= -1) {
                    const takeDiag = checkTakeDiag(x, y, i, j, board);
                    if (takeDiag) options.push(takeDiag);
                }
            return options;
        }

        const checkTakeDiag = (x, y, direction, orientation, board) => {
            const newX = x + direction;
            const newY = y + orientation;
            if (outOfRange(newX, newY, board)) return;
            const diag = board[newX][newY];
            if (diag === null || diag.getColor() === color) return;
            return checkMoveDiag(newX, newY, direction, orientation, board);
        }

        const move = (newX, newY, board) => {
            checkTookPiece(newX, newY, x, y, board);
            board[newX][newY] = board[x][y];
            board[x][y] = null;
            x = newX;
            y = newY;
            const blackPromoted = color === "black" && x === board.length - 1;
            const bluePromoted = color === "blue" && x === 0;
            if (blackPromoted || bluePromoted) promote(board);
        }

        const checkTookPiece = (newX, newY, oldX, oldY, board) => {
            const deltaX = newX - oldX;
            const deltaY = newY - oldY;
            tookPiece = (deltaX !== 1 && deltaX !== -1);
            if (!tookPiece) return;
            const xTaken = deltaX > 0 ? newX - 1 : newX + 1;
            const yTaken = deltaY > 0 ? newY - 1 : newY + 1;
            board[xTaken][yTaken] = null;
        }

        const promote = (board) => {
            board[x][y] = kingPiece(x, y, color);
            tookPiece = false;
        }

        return {
            getX,
            getY,
            getID,
            getClass,
            getColor,
            move,
            checkTookPiece,
            promote,
            getEveryDiagMove,
            getEveryDiagTake,
            checkTakeDiag,
            checkMoveDiag,
            outOfRange,
            justTook,
        }
    };

    const kingPiece = (x, y, color) => {
        const prototype = Piece(x, y, color);
        const getID = () => [x, y].join("");

        const getClass = () => {
            const baseColor = prototype.getColor();
            const baseClass = baseColor.concat("-piece");
            return [baseClass, "king"];
        }

        const getEveryDiagMove = (board) => {
            let options = [];
            for (let a = 0, i = -1; a < 2; a++, i *= -1)
                for(let b = 0, j = -1; b < 2; b++, j *= -1) {
                    const moveDiag = prototype.checkMoveDiag(x, y, i, j, board);
                    if (moveDiag) options.push(moveDiag);
                }
            return options;
        }

        const getEveryDiagTake = (board) => {
            let options = [];
            for (let a = 0, i = -1; a < 2; a++, i *= -1) 
                for (let b = 0, j = -1; b < 2; b++, j *= -1) {
                    const oponent = findFirstOponent(x, y, i, j, board);
                    if (!oponent) continue;
                    const takeDiag = checkTakeDiag(oponent, i, j, board);
                    if (takeDiag) options.push(takeDiag);
                }
            return options;
        }

        const findFirstOponent = (x, y, direction, orientation, board) => {
            for (let i = 1; !prototype.outOfRange(x + i*direction, y + i*orientation, board); i++) {
                const diag = board[x + i*direction][y + i*orientation];
                if (diag === null) continue;
                if (diag.getColor() !== prototype.getColor()) return diag;
            }
        }

        const checkTakeDiag = (oponent, direction, orientation, board) => {
            const newX = oponent.getX() - direction;
            const newY = oponent.getY() - orientation;
            return prototype.checkTakeDiag(newX, newY, direction, orientation, board);
        }

        const move = (newX, newY, board) => {
            prototype.checkTookPiece(newX, newY, x, y, board);
            board[newX][newY] = board[x][y];
            board[x][y] = null;
            x = newX;
            y = newY;
        }

        return Object.assign(prototype, {getID, getClass, getEveryDiagMove, getEveryDiagTake, move})
    }

    return {
        createPiece: Piece,
    }
})();

export default pieceFactory