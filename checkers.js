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

// Helper methods
const distSq = (x1, y1, x2, y2) => (y2 - y1) * (y2 - y1) + (x2 - x1) * (x2 - x1);
const screenToTile = (coord) => Math.floor(coord / CELL_SIZE);
const tileToScreen = (coord) => coord * CELL_SIZE + CELL_SIZE / 2;
const getPiece = (x, y) => board.find(piece => piece.x == x && piece.y == y);

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

const drawPieces = () => {

    for(let piece of board) {
        drawPiece(piece);
    }

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

const addEventListeners = () => {

    canvas.addEventListener("click", (event) => {
        
        let tileX = screenToTile(event.offsetX);
        let tileY = screenToTile(event.offsetY);

        let piece = getPiece(tileX, tileY);
        if(piece && distSq(event.offsetX, event.offsetY, tileToScreen(piece.x), tileToScreen(piece.y)) < PIECE_RADIUS * PIECE_RADIUS) {
            console.log(piece);
        }

    });

};

addEventListeners();
initPieces();
drawCheckerboard();
drawPieces();