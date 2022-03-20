import playerFactory from './playerFactory.js'

const game = (() => {
    const restartGame = () => {
        const boardSize = 8;
        board = createBoard(boardSize);
        blackPlayer = playerFactory.createBlackPlayer(board);
        bluePlayer = playerFactory.createBluePlayer(board);
        blackPlayer.createPieces();
        bluePlayer.createPieces();
        updatePieces(blackPlayer, bluePlayer);
        setNextTurn(blackPlayer, bluePlayer);
    }

    const createBoard = (n) => {
        const board = Array(n).fill().map(() => Array(n).fill(null));
        createBoardDOM(board);
        return board;
    }

    const createBoardDOM = (board) => {
        const content = document.querySelector("#content");
        const previousTable = document.querySelector("table");
        if (previousTable) content.removeChild(previousTable);
        const table = document.createElement("table");
        appendSquares(table, content, board);
        writeTurnMessages();
    }

    const appendSquares = (table, content, board) => {
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

    const writeTurnMessages = () => {
        const blackTurn = document.getElementById("blackMessage");
        const blueTurn = document.getElementById("blueMessage");
        blackTurn.textContent = "Black's turn";
        blueTurn.textContent = "Blue's turn";
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
        table.querySelectorAll("div").forEach(node => node.classList.remove(... node.classList));
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

export default game