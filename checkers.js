const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// Assumptions:
// - The board is always square
// - The canvas is always square
const BOARD_SIZE = 8;
const CELL_SIZE = canvas.width / BOARD_SIZE;
const PIECE_RADIUS = 20;

// Game state
const board = [];
let selectedPiece;
let availableMoves;
let currentTurn = 0;

// Helper methods
const distSq = (x1, y1, x2, y2) => (y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1);
const screenToTile = (coord) => Math.floor(coord / CELL_SIZE);
const tileToScreen = (coord) => coord * CELL_SIZE + CELL_SIZE / 2;
const getPiece = (x, y) => board.find(piece => piece.x == x && piece.y == y);
const inBounds = (x, y) => x >= 0 && y >= 0 && x < BOARD_SIZE && y < BOARD_SIZE;

const clearAll = () => {
    selectedPiece = null;
    availableMoves = null;
};

const nextTurn = () => currentTurn = !currentTurn;

const getKill = (piece, dx, dy) => {

    let toKill = getPiece(piece.x + dx, piece.y + dy);
    if(toKill && toKill.side != piece.side && inBounds(piece.x + 2 * dx, piece.y + 2 * dy) && !getPiece(piece.x + 2 * dx, piece.y + 2 * dy)) {
        return toKill;
    }

};

const canMove = (piece, dx, dy) => {
    return inBounds(piece.x + dx, piece.y + dy) && !getPiece(piece.x + dx, piece.y + dy) || getKill(piece, dx, dy);
};

const hasMoves = (piece) => {

    let dir = piece.side == 1 ? 1 : -1;
    return canMove(piece, -1, dir) || canMove(piece, 1, dir) || (piece.king && (canMove(piece, -1, -dir) || canMove(piece, 1, -dir)));

};

const getMoves = (piece, killed) => {

    let dir = piece.side == 1 ? 1 : -1;
    let moves = [];

    // simple moves
    if(!killed) {
        for(let dx of [-1, 1]) { 
            for(let dy of [-1, 1]) {
                if(dy != dir && !piece.king) continue;
                if(inBounds(piece.x + dx, piece.y + dy) && !getPiece(piece.x + dx, piece.y + dy)) {
                    moves.push({
                        x: piece.x + dx,
                        y: piece.y + dy
                    });
                }
            }
        }
    }

    for(let dx of [-1, 1]) {
        for(let dy of [-1, 1]) {
            if(dy != dir && !piece.king) continue;
            let toKill = getKill(piece, dx, dy);
            if(toKill) {
                moves.push({
                    x: piece.x + dx * 2,
                    y: piece.y + dy * 2,
                    toKill: toKill
                });
            }
        }
    }

    return moves;

};

const drawCheckerboard = () => {

    for(let x = 0; x < BOARD_SIZE; x++) {
        for(let y = 0; y < BOARD_SIZE; y++) {

            if(x % 2 ^ y % 2)
                ctx.fillStyle = "#a47a59";
            else
                ctx.fillStyle = "#e8d1a7";

            ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

        }
    }

};

// Optional x/y parameters (pixel) for animation
// Otherwise, draws x/y based on piece
const drawPiece = (piece, x, y) => {

    let screenX, screenY;
    if(x && y) {
        screenX = x;
        screenY = y;
    } else {
        screenX = tileToScreen(piece.x);
        screenY = tileToScreen(piece.y);
    }

    ctx.fillStyle = piece.side == 0 ? "#e32222" : "#222222";

    ctx.beginPath();
    ctx.arc(screenX, screenY, PIECE_RADIUS, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();

};

const drawRing = (x, y, color) => {

    ctx.strokeStyle = color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = color;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.arc(tileToScreen(x), tileToScreen(y), PIECE_RADIUS, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();

    ctx.shadowBlur = 0;

};

const drawPieces = () => {

    for(let piece of board) {
        if(!piece.hidden) drawPiece(piece);
    }

};

const drawSelection = () => {

    for(let piece of board) {

        if(piece.side == currentTurn) {
            if(piece == selectedPiece) {
                drawRing(piece.x, piece.y, "#ffff00");
            } else if(hasMoves(piece)) {
                drawRing(piece.x, piece.y, "#ffffff");
            }
        }

    }

};

const drawMoves = () => {

    if(!availableMoves) return;

    for(let move of availableMoves) {
        if(move.toKill) {
            drawRing(move.x, move.y, "#ff0000");
        } else {
            drawRing(move.x, move.y, "#00ff00");
        }
    }

};

const draw = () => {

    drawCheckerboard();
    drawPieces();
    drawSelection();
    drawMoves();

};

const initPieces = () => {

    for(let y = 0; y < 3; y++) {
        for(let x = 0; x < BOARD_SIZE / 2; x++) {
            board.push({
                x: x * 2 + !(y % 2),
                y: y,
                side: 1
            });
        }
    }

    for(let y = BOARD_SIZE - 3; y < BOARD_SIZE; y++) {
        for(let x = 0; x < BOARD_SIZE / 2; x++) {
            board.push({
                x: x * 2 + !(y % 2),
                y: y,
                side: 0
            });
        }
    }

};

const animateMove = function(move) {

    let frame = 0;
    let animatedPiece = {x: selectedPiece.x, y: selectedPiece.y, side: selectedPiece.side, king: selectedPiece.king};

    let initX = tileToScreen(animatedPiece.x);
    let initY = tileToScreen(animatedPiece.y);
    let finalX = tileToScreen(move.x);
    let finalY = tileToScreen(move.y);

    let frames = 15;
    let a = 1 / (frames * frames);

    let func = () => {
    
        let t = -a * (frame - frames) * (frame - frames) + 1;

        drawCheckerboard();
        drawPieces();
        drawPiece(animatedPiece, initX + (finalX - initX) * t, initY + (finalY - initY) * t);

        frame++;
        if(frame < frames) {
            requestAnimationFrame(func);
        } else {
            selectedPiece.hidden = false;
            clearAll();
            nextTurn();
            draw();
        }

    };
    
    func();

};

const onClickPiece = (piece) => {
    if(piece.side == currentTurn) {
        selectedPiece = piece;
        availableMoves = getMoves(selectedPiece);
        draw();
    }
};

const onClickMove = (move) => {
    animateMove(move);
    selectedPiece.x = move.x;
    selectedPiece.y = move.y;
    selectedPiece.hidden = true;
};

const addEventListeners = () => {

    canvas.addEventListener("click", (event) => {
        
        let tileX = screenToTile(event.offsetX);
        let tileY = screenToTile(event.offsetY);

        let piece = getPiece(tileX, tileY);
        if(piece && distSq(event.offsetX, event.offsetY, tileToScreen(piece.x), tileToScreen(piece.y)) < PIECE_RADIUS * PIECE_RADIUS) {
            return onClickPiece(piece);
        }

        if(availableMoves) {
            for(let move of availableMoves) {
                if(distSq(event.offsetX, event.offsetY, tileToScreen(move.x), tileToScreen(move.y)) < PIECE_RADIUS * PIECE_RADIUS) {
                    return onClickMove(move);
                }
            }
        }

        clearAll();
        draw();

    });

};

addEventListeners();
initPieces();
draw();