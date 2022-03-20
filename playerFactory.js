import pieceFactory from './pieceFactory.js'

const playerFactory = (() => {
    const Player = (color, winMessage, remainingPieces, board) => {
        const getWinMessage = () => winMessage;
        const getColor = () => color;

        const getPieces = () => {
            remainingPieces = updatePieces();
            return remainingPieces;
        }

        const createPieces = () => {
            const halfSize = board.length / 2;
            const firstPosition = color === "black" ? 0 : halfSize + 1;
            for (let i = firstPosition; i < firstPosition + halfSize - 1; i++)
                for (let j = (i + 1) % 2; j < board.length; j += 2) {
                    const piece = pieceFactory.createPiece(i, j, color);
                    remainingPieces.push(piece);
                    board[i][j] = piece;
                }
        }

        const updatePieces = () => {
            let pieces = [];
            for (let i = 0; i < board.length; i++) 
                for (let j = 0; j < board.length; j++) {
                    const piece = board[i][j];
                    if (piece === null) continue;
                    if (color === piece.getColor()) pieces.push(piece);
                }
            return pieces;
        }

        return {
            getWinMessage,
            getColor,
            getPieces,
            createPieces,
            updatePieces,
        }
    }
 
    const blackPlayer = (board) => {
        const color = "black";
        const winMessage = "Black won"
        let remainingPieces = [];
        const prototype = Player(color, winMessage, remainingPieces, board);
        return prototype;
    }

    const bluePlayer = (board) => {
        const color = "blue";
        const winMessage = "Blue won"
        let remainingPieces = [];
        const prototype = Player(color, winMessage, remainingPieces, board);
        return prototype;
    }

    return {
        createBlackPlayer: blackPlayer,
        createBluePlayer: bluePlayer
    }
})();

export default playerFactory