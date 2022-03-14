const pieceFactory = (() => {
    const Piece = (x, y, direction) => {
        const getX = () => x;
        const getY = () => y;
        const getDirection = () => direction;
        const color = direction === 1 ? "black" : "blue";
        const getColor = () => color;
        const getClass = () => [color.concat("-piece")];
        const getID = () => [x, y].join("");
        
        let tookPiece = false;
        const justTook = () => tookPiece;

        const getEveryDiagMove = () => {
            let options = [];
            for (let a = 0, i = -1; a < 2; a++, i *= -1) {
                const moveDiag = checkMoveDiag(x, y, direction, i);
                if (moveDiag) options.push(moveDiag);
            }
            return options;
        }

        const checkMoveDiag = (x, y, direction, orientation) => {
            const newX = x + direction;
            const newY = y + orientation;
            if (outOfRange(newX, newY)) return;
            const diag = board[newX][newY];
            if (diag === null) return [newX, newY].join("");
        }

        const outOfRange = (newX, newY) => {
            const xOutRange = !(newX < board.length && newX > -1);
            const yOutRange = !(newY < board.length && newY > -1);
            return xOutRange || yOutRange;
        }

        const getEveryDiagTake = () => {
            let options = [];
            for (let a = 0, i = -1; a < 2; a++, i *= -1) 
                for (let b = 0, j = -1; b < 2; b++, j *= -1) {
                    const takeDiag = checkTakeDiag(x, y, i, j);
                    if (takeDiag) options.push(takeDiag);
                }
            return options;
        }

        const checkTakeDiag = (x, y, direction, orientation) => {
            const newX = x + direction;
            const newY = y + orientation;
            if (outOfRange(newX, newY)) return;
            const diag = board[newX][newY];
            if (diag === null || diag.getColor() === color) return;
            return checkMoveDiag(newX, newY, direction, orientation);
        }

        const move = (newX, newY) => {
            checkTookPiece(newX, newY, x, y);
            board[newX][newY] = board[x][y];
            board[x][y] = null;
            x = newX;
            y = newY;
            if (x === 0 || x === 7) promote();
        }

        const checkTookPiece = (newX, newY, oldX, oldY) => {
            const deltaX = newX - oldX;
            const deltaY = newY - oldY;
            const took = (deltaX !== 1 && deltaX !== -1);
            tookPiece = took;
            if (!took) return;
            const xTaken = deltaX > 0 ? newX - 1 : newX + 1;
            const yTaken = deltaY > 0 ? newY - 1 : newY + 1;
            board[xTaken][yTaken] = null;
        }

        const promote = () => board[x][y] = kingPiece(x, y, direction);
            
        return {
            getX,
            getY,
            getID,
            getDirection,
            getClass,
            getColor,
            move,
            promote,
            getEveryDiagMove,
            getEveryDiagTake,
            checkTakeDiag,
            outOfRange,
            justTook,
        }
    };

    const kingPiece = (x, y, direction) => {
        const prototype = Piece(x, y, direction);

        const getClass = () => {
            const baseColor = prototype.getColor();
            const baseClass = baseColor.concat("-piece");
            return [baseClass, "king"];
        }

        const getEveryDiagTake = () => {
            let options = [];
            for (let a = 0, i = -1; a < 2; a++, i *= -1) 
                for (let b = 0, j = -1; b < 2; b++, j *= -1) {
                    const oponent = findFirstOponent(x, y, i, j);
                    if (!oponent) continue;
                    const takeDiag = checkTakeDiag(oponent, i, j);
                    if (takeDiag) options.push(takeDiag);
                }
            return options;

        }

        const findFirstOponent = (x, y, direction, orientation) => {
            for (let i = 1; !prototype.outOfRange(x + i*direction, y + i*orientation); i++) {
                const diag = board[x + i*direction][y + i*orientation];
                if (diag === null) continue;
                if (diag.getColor() !== prototype.getColor()) return diag;
            }
        }

        const checkTakeDiag = (oponent, direction, orientation) => {
            const newX = oponent.getX() - direction;
            const newY = oponent.getY() - orientation;
            return prototype.checkTakeDiag(newX, newY, direction, orientation);
        }

        return Object.assign(prototype, {getEveryDiagTake, getClass})
    }

    return {
        createPiece: Piece
    }
})();

function getPieceFromID(id) {
    const x = id[0], y = id[1];
    return board[x][y];
}

function createBoard() {
    const board = Array(8).fill().map(() => Array(8).fill(null))
    createBoardDOM(board);
    return board;
}

function createBoardDOM(board) {
    const content = document.querySelector("#content");
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

const board = createBoard();

const playerFactory = (() => {
    const Player = (color, turnMessage, winMessage, remainingPieces) => {
        const getTurnMessage = () => turnMessage;
        const getWinMessage = () => winMessage;

        const getPieces = () => {
            remainingPieces = updatePieces();
            return remainingPieces;
        }
        const createPieces = () => {
            const firstPosition = color === "black" ? 0 : 5;
            const direction = color === "black" ? 1 : -1;
            for (let i = firstPosition; i < firstPosition + 3; i++) {
                for (let j = (i + 1) % 2; j < board.length; j += 2) {
                    const piece = pieceFactory.createPiece(i, j, direction);
                    remainingPieces.push(piece);
                    board[i][j] = piece;
                }
            }
        }

        const updatePieces = () => {
            let pieces = [];
            for (let i = 0; i < board.length; i++) {
                for (let j = 0; j < board.length; j++) {
                    const piece = board[i][j];
                    if (piece === null) continue;
                    if (color === piece.getColor()) pieces.push(piece);
                }
            }
            return pieces;
        }

        return {
            getTurnMessage,
            getWinMessage,
            getPieces,
            createPieces,
            updatePieces,
        }
    }
 
    const blackPlayer = () => {
        const color = "black";
        const turnMessage = "Black's turn"
        const winMessage = "Black won"
        let remainingPieces = [];
        const prototype = Player(color, turnMessage, winMessage, remainingPieces);
        return prototype;
    }

    const bluePlayer = () => {
        const color = "blue";
        const turnMessage = "Blue's turn"
        const winMessage = "Blue won"
        let remainingPieces = [];
        const prototype = Player(color, turnMessage, winMessage, remainingPieces);
        return prototype;
    }

    return {
        createBlackPlayer: blackPlayer,
        createBluePlayer: bluePlayer
    }
})();

const black = playerFactory.createBlackPlayer();
const blue = playerFactory.createBluePlayer();
black.createPieces();
blue.createPieces();

function updatePieces() {
    removePreviousPieces();
    const pieces = [...black.getPieces(), ...blue.getPieces()];
    for (let piece of pieces) {
        const id = piece.getID();
        const pieceDOM = document.getElementById(`${id}`);
        piece.getClass().forEach(class_ => pieceDOM.classList.add(class_));
    }
}

function removePreviousPieces() {
    const table = document.querySelector("table");
    table.querySelectorAll("div").forEach(node => {
        node.classList.remove(... node.classList);
    });
}

updatePieces();

function setListeners(player) {
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
    const availableMoves = [... pieceSelected.getEveryDiagMove(), ... pieceSelected.getEveryDiagTake()];
    for (moveID of availableMoves) {
        console.log(moveID)
    }
    setListenersToMove(availableMoves, pieceSelected);
    
}

function toggleSelected(event) {
    const previousSelected = document.querySelector(".selected");
    if (previousSelected) previousSelected.classList.remove("selected");
    const newSelected = event.target;
    newSelected.classList.add("selected");
}

function setListenersToMove (availableMoves, pieceSelected) {
    unhighlightOptions()
    for (let id of availableMoves) {
        const moveTo = document.getElementById(`${id}`);
        moveTo.classList.add("highlight");
        moveTo.addEventListener("click", function() {
            const newX = parseInt(id[0]);
            const newY = parseInt(id[1]);
            pieceSelected.move(newX, newY);
            updatePieces();
            removePreviousListeners(availableMoves);
            analyzePosition(pieceSelected);
            
        });
    }
}

function unhighlightOptions() {
    const highlighted = document.querySelectorAll(".highlight");
    highlighted.forEach(node => node.classList.remove("highlight"));
}

function removePreviousListeners() {
    const squares = document.querySelectorAll("table div");
    for (let square of squares) {
        const id = square.id;
        if (!id) continue
        const node = document.getElementById(`${id}`);
        node.replaceWith(node.cloneNode(true));
    }
}


function analyzePosition (pieceSelected) {
    if (pieceSelected.justTook()) {
        const gameEnded = checkGameEnded(pieceSelected);
        if (gameEnded) setWinMessage(pieceSelected);
        const availableMoves = pieceSelected.getEveryDiagTake();
        if (availableMoves.length) {
            setListenersToMove(availableMoves, pieceSelected);
            return;
        }
    }
    const player = getNextPlayer(pieceSelected);
    setListeners(player)
}

function checkGameEnded(pieceSelected) {
    const player = getNextPlayer(pieceSelected);
    const piecesRemaining = player.getPieces();
    return piecesRemaining.length === 0
}

function getNextPlayer(pieceSelected) {
    const color = pieceSelected.getColor();
    const player = color === "black" ? blue : black;
    return player;
}

function setWinMessage(pieceSelected) {
    const color = pieceSelected.getColor();
    
}

setListeners(blue)