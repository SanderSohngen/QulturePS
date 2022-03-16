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
            const blackPromoted = color === "black" && x === 7;
            const bluePromoted = color === "blue" && x === 0;
            if (blackPromoted || bluePromoted) promote(board);
        }

        const checkTookPiece = (newX, newY, oldX, oldY, board) => {
            const deltaX = newX - oldX;
            const deltaY = newY - oldY;
            const took = (deltaX !== 1 && deltaX !== -1);
            tookPiece = took;
            if (!took) return;
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

const playerFactory = (() => {
    const Player = (color, winMessage, remainingPieces, board) => {
        const getWinMessage = () => winMessage;
        const getColor = () => color;

        const getPieces = () => {
            remainingPieces = updatePieces();
            return remainingPieces;
        }

        const createPieces = () => {
            const firstPosition = color === "black" ? 0 : 5;
            for (let i = firstPosition; i < firstPosition + 3; i++) {
                for (let j = (i + 1) % 2; j < board.length; j += 2) {
                    const piece = pieceFactory.createPiece(i, j, color);
                    remainingPieces.push(piece);
                    board[i][j] = piece;
                }
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

const game = (() => {
    const restartGame = () => {
        board = createBoard();
        blackPlayer = playerFactory.createBlackPlayer(board);
        bluePlayer = playerFactory.createBluePlayer(board);
        blackPlayer.createPieces();
        bluePlayer.createPieces();
        updatePieces(blackPlayer, bluePlayer);
        setNextTurn(blackPlayer, bluePlayer);
    }

    const createBoard = () => {
        const board = Array(8).fill().map(() => Array(8).fill(null));
        createBoardDOM(board);
        return board;
    }

    const createBoardDOM = (board) => {
        const content = document.querySelector("#content");
        const previousTable = document.querySelector("table");
        if (previousTable) content.removeChild(previousTable);
        const table = document.createElement("table");
    
        for (let i = 0; i < board.length; i++) {
            const tr = document.createElement("tr");
            table.appendChild(tr);
            for (let j = 0; j < board[i].length; j++) {
                const td = document.createElement("td");
                const blockedSquare = (i + j) % 2 === 0;
                if (blockedSquare) td.classList.add("blockedSquare");
                else {
                    const div = document.createElement("div");
                    div.id = [i, j].join('');
                    td.appendChild(div);
                }    
                tr.appendChild(td);
            }
        }
        content.appendChild(table);
    }
    
    const updatePieces = (blackPlayer, bluePlayer) => {
        removePreviousPieces();
        const pieces = [...blackPlayer.getPieces(), ...bluePlayer.getPieces()];
        for (let piece of pieces) {
            const id = piece.getID();
            const pieceDOM = document.getElementById(`${id}`);
            piece.getClass().forEach(class_ => pieceDOM.classList.add(class_));
        }
    }
    
    const removePreviousPieces = () => {
        const table = document.querySelector("table");
        table.querySelectorAll("div").forEach(node => {
            node.classList.remove(... node.classList);
        });
    }
    
    const setListeners = (player) => {
        const pieces = player.getPieces();
        for (let piece of pieces) {
            const id = piece.getID();
            const pieceDOM = document.getElementById(`${id}`);
            pieceDOM.addEventListener("click", allowToMove);
        }
    }
    
    const allowToMove = (event) => {
        toggleSelected(event)
        const id = event.target.id;
        const pieceSelected = getPieceFromID(id);
        const availableMoves = [... pieceSelected.getEveryDiagMove(board), ... pieceSelected.getEveryDiagTake(board)];
        setListenersToMove(availableMoves, pieceSelected);
    }
    
    const toggleSelected = (event) => {
        const previousSelected = document.querySelector(".selected");
        if (previousSelected) previousSelected.classList.remove("selected");
        const newSelected = event.target;
        newSelected.classList.add("selected");
    }
    
    const getPieceFromID = (id) =>{
        const x = id[0], y = id[1];
        return board[x][y];
    }
    
    const setListenersToMove = (availableMoves, pieceSelected) => {
        unhighlightOptions();
        removePreviousListeners(true);
        for (let id of availableMoves) {
            const moveTo = document.getElementById(`${id}`);
            moveTo.classList.add("highlight");
            moveTo.addEventListener("click", () => {
                const newX = parseInt(id[0]);
                const newY = parseInt(id[1]);
                pieceSelected.move(newX, newY, board);
                updatePieces(blackPlayer, bluePlayer);
                removePreviousListeners(false);
                analyzePosition(pieceSelected);
            });
        }
    }
    
    const unhighlightOptions = () => {
        const highlighted = document.querySelectorAll(".highlight");
        highlighted.forEach(node => node.classList.remove("highlight"));
    }
    
    const removePreviousListeners = (removeOnlyEmptySquares) => {
        const squares = document.querySelectorAll("table div");
        for (let square of squares) {
            const id = square.id;
            if (!id) continue
            const classes = square.classList;
            const isEmptySquare = classes.length === 0;
            if (removeOnlyEmptySquares && !isEmptySquare) continue;
            const node = document.getElementById(`${id}`);
            node.replaceWith(node.cloneNode(true));
        }
    }
    
    const analyzePosition = (pieceSelected) => {
        const currentPlayer = getCurrentPlayer(pieceSelected);
        const nextPlayer = getNextPlayer(pieceSelected);
        if (pieceSelected.justTook()) {
            const gameEnded = checkGameEnded(nextPlayer);
            if (gameEnded) {
                endGame(currentPlayer);  
                return;
            }
            const availableMoves = pieceSelected.getEveryDiagTake(board);
            if (availableMoves.length) {
                setListenersToMove(availableMoves, pieceSelected);
                return;
            }
        }
        setNextTurn(currentPlayer, nextPlayer);
    }
    
    const getCurrentPlayer  = (pieceSelected) => {
        const color = pieceSelected.getColor();
        const player = color === blackPlayer.getColor() ? blackPlayer : bluePlayer;
        return player;
    }
    
    const getNextPlayer = (pieceSelected) => {
        const color = pieceSelected.getColor();
        const player = color === blackPlayer.getColor() ? bluePlayer : blackPlayer;
        return player;
    }
    
    const checkGameEnded = (nextPlayer) => {
        const piecesRemaining = nextPlayer.getPieces();
        return piecesRemaining.length === 0
    }
    
    const setNextTurn = (currentPlayer, nextPlayer) => {
        changeTurnMessage(currentPlayer, nextPlayer);
        setListeners(nextPlayer);
    }
    
    const changeTurnMessage = (currentPlayer, nextPlayer) => {
        const currentDOM = getMessageDOM(currentPlayer);
        const nextDOM = getMessageDOM(nextPlayer);
        currentDOM.classList.remove("turn");
        nextDOM.classList.add("turn");
    }

    const getMessageDOM = (player) => {
        const color = player.getColor();
        const DOM = document.getElementById(`${color}Message`);
        return DOM;
    }
    
    const endGame = (currentPlayer) => {
        setWinMessage(currentPlayer);
        removePreviousListeners();
    }
    
    const setWinMessage = (currentPlayer) => {
        const WinMSG = currentPlayer.getWinMessage();
        const color = currentPlayer.getColor();
        const messageDOM = document.getElementById(`${color}Message`).firstChild;
        messageDOM.textContent = WinMSG;
    }

    const restart = document.querySelector("#restart");
    restart.addEventListener("click", restartGame);
    let board = createBoard();
    let blackPlayer = playerFactory.createBlackPlayer(board);
    let bluePlayer = playerFactory.createBluePlayer(board);
    
    return {
        restartGame,
    }
})();

game.restartGame();