// constants

// colors
const WHITE = 0;
const BLACK = 1;

// piece types
const PAWN = 0;
const KING = 1;
const QUEEN = 2;
const BISHOP = 3;
const KNIGHT = 4;
const ROOK = 5;

// move types
const SIMPLE = 0;
const ENPASSANT = 1;
const CASTLE = 2;
const PROMOTION = 3;

// some constants for drawing the board
const BOARD_SIDE_LENGTH = window.innerHeight;
const SQUARE_SIDE_LENGTH = BOARD_SIDE_LENGTH / 8;

// colors of the squares
const WHITE_SQUARE_COLOR = 'lightgray';
const BLACK_SQUARE_COLOR = 'gray';

const otherColor = (color) =>
      color === WHITE ? BLACK : WHITE;

// compares squares, squares are simple arrays with structure: [file, rank]
const squareEquals = (square1, square2) =>
      square1[0] === square2[0] &&
      square1[1] === square2[1];

// base class for a piece
class Piece {
    constructor(type, color, square) {
	this.type = type;
	this.color = color;
	this.square = square;
    }

    makeMoveList(piece, board, nextSquare) {
	const { square, color } = piece;

	const squares = [];

	let curSquare = nextSquare(square);

	while (true) {
	    if (!Board.squareExists(curSquare)) break;

	    const piece = board.findPiece(curSquare);

	    if (piece) {
		if (piece.color !== color) {
		    squares.push(curSquare);
		}

		break;
	    }

	    squares.push(curSquare);
	    curSquare = nextSquare(curSquare);
	}


	return squares
	    .map((square) => ({ type: SIMPLE, to: square }));
    }
}

// provides a utility function to create a list of moves for pieces that move in "lines" (that is: the bishop, rook and queen)
// let lineMoveMixin = Base => class extends Base {
//     accrueMoves(board, color, currentSquare, getNextSquare, squares = []) {

//     }
// }

class Pawn extends Piece {
    constructor(color, square) {
	super(PAWN, color, square);
	this.hasMoved = false;
	this.moved2SquaresLastTurn = false;
    }

    getMoves(board) {
	const moves = this.color === WHITE ?
	      this.getMovesForWhite(board) :
	      this.getMovesForBlack(board);

	return moves.map((move) => {
	    const rank = move.to[1];

	    if (rank === 1 || rank === 8) {
		return { ...move, type: PROMOTION };
	    }

	    return move;
	});
    }

    getMovesForWhite(board) {
	const [file, rank] = this.square;

	const moves = [];

	if (!board.findPiece([file, rank + 1])) {
	    moves.push({ type: SIMPLE, to: [file, rank + 1] });

	    if (!this.hasMoved && !board.findPiece([file, rank + 2])) {
		moves.push({ type: SIMPLE, to: [file, rank + 2] });
	    }
	}

	const forwardLeftPiece = board.findPiece([file - 1, rank + 1]);
	if (forwardLeftPiece && forwardLeftPiece.color !== this.color) {
	    moves.push({ type: SIMPLE, to: [file - 1, rank + 1] });
	}

	const forwardRightPiece = board.findPiece([file + 1, rank + 1]);
	if (forwardRightPiece && forwardRightPiece.color !== this.color) {
	    moves.push({ type: SIMPLE, to: [file + 1, rank + 1] });
	}

	const leftPiece = board.findPiece([file - 1, rank]);
	if (leftPiece &&
	    leftPiece.color !== this.color &&
	    leftPiece.moved2SquaresLastTurn &&
	    !forwardLeftPiece) {
	    moves.push({ type: ENPASSANT, to: [file - 1, rank + 1], enemyPiece: leftPiece });
	}

	const rightPiece = board.findPiece([file + 1, rank]);
	if (rightPiece &&
	    rightPiece.color !== this.color &&
	    rightPiece.moved2SquaresLastTurn &&
	    !forwardRightPiece) {
	    moves.push({ type: ENPASSANT, to: [file + 1, rank + 1], enemyPiece: rightPiece });
	}

	return moves;
    }

    getMovesForBlack(board) {
	const [file, rank] = this.square;

	const moves = [];

	if (!board.findPiece([file, rank - 1])) {
	    moves.push({ type: SIMPLE, to: [file, rank - 1] });

	    if (!this.hasMoved && !board.findPiece([file, rank - 2])) {
		moves.push({ type: SIMPLE, to: [file, rank - 2] });
	    }
	}

	const forwardLeftPiece = board.findPiece([file - 1, rank - 1]);
	if (forwardLeftPiece && forwardLeftPiece.color !== this.color) {
	    moves.push({ type: SIMPLE, to: [file - 1, rank - 1] });
	}

	const forwardRightPiece = board.findPiece([file + 1, rank - 1]);
	if (forwardRightPiece && forwardRightPiece.color !== this.color) {
	    moves.push({ type: SIMPLE, to: [file + 1, rank - 1] });
	}

	const leftPiece = board.findPiece([file - 1, rank]);
	if (leftPiece &&
	    leftPiece.color !== this.color &&
	    leftPiece.moved2SquaresLastTurn &&
	    !forwardLeftPiece) {
	    moves.push({ type: ENPASSANT, to: [file - 1, rank - 1], enemyPiece: leftPiece });
	}

	const rightPiece = board.findPiece([file + 1, rank]);
	if (rightPiece &&
	    rightPiece.color !== this.color &&
	    rightPiece.moved2SquaresLastTurn &&
	    !forwardRightPiece) {
	    moves.push({ type: ENPASSANT, to: [file + 1, rank - 1], enemyPiece: rightPiece });
	}

	return moves;
    }

    clone() {
	const copy = new Pawn(
	    this.color,
	    this.square.slice()
	);

	copy.hasMoved = this.hasMoved;
	copy.moved2SquaresLastTurn = this.moved2SquaresLastTurn;
	return copy;
    }
}

class King extends Piece {
    constructor(color, square) {
	super(KING, color, square);
	this.hasMoved = false;
    }

    getMoves(board) {
	const [file, rank] = this.square;

	const moves = [
	    [file, rank + 1],
	    [file + 1, rank + 1],
	    [file + 1, rank],
	    [file + 1, rank - 1],

	    [file, rank - 1],
	    [file - 1, rank - 1],
	    [file - 1, rank],
	    [file - 1, rank + 1],
	]
	      .filter(square => board.canOccupy(square, this.color))
	      .map((square) => ({ type: SIMPLE, to: square }));

	const castlingMoves = this.color === WHITE ?
	      this.getCastlingMovesForWhite(board) :
	      this.getCastlingMovesForBlack(board);

	return [...moves, ...castlingMoves];
    }

    getCastlingMovesForWhite(board) {
	if (this.hasMoved) return [];

	const [file, rank] = this.square;

	const moves = [];

	const rightPiece = board.findPiece([file + 1, rank]);
	const farRightPiece = board.findPiece([file + 2, rank]);
	const rightRook = board.findPiece([file + 3, rank]);

	if (!rightPiece &&
	    !farRightPiece &&
	    rightRook &&
	    !rightRook.hasMoved) {

	    moves.push({
		type: CASTLE,
		to: [file + 2, rank],
		rookFrom: rightRook.square,
		rookTo: [file + 1, rank]
	    });
	}

	const leftPiece = board.findPiece([file - 1, rank]);
	const farLeftPiece = board.findPiece([file - 2, rank]);
	const fartherLeftPiece = board.findPiece([file - 3, rank]);
	const leftRook = board.findPiece([file - 4, rank]);

	if (!leftPiece &&
	    !farLeftPiece &&
	    !fartherLeftPiece &&
	    leftRook &&
	    !leftRook.hasMoved) {

	    moves.push({
		type: CASTLE,
		to: [file - 2, rank],
		rookFrom: leftRook.square,
		rookTo: [file - 1, rank]
	    });
	}

	return moves;
    }

    getCastlingMovesForBlack(board) {
	if (this.hasMoved) return [];

	const [file, rank] = this.square;

	const moves = [];

	const rightPiece = board.findPiece([file - 1, rank]);
	const farRightPiece = board.findPiece([file - 2, rank]);
	const fartherRightPiece = board.findPiece([file - 3, rank]);
	const rightRook = board.findPiece([file - 4, rank]);

	if (!rightPiece &&
	    !farRightPiece &&
	    !fartherRightPiece &&
	    rightRook &&
	    !rightRook.hasMoved) {

	    moves.push({
		type: CASTLE,
		to: [file - 2, rank],
		rookFrom: rightRook.square,
		rookTo: [file - 1, rank]
	    });
	}

	const leftPiece = board.findPiece([file + 1, rank]);
	const farLeftPiece = board.findPiece([file + 2, rank]);
	const leftRook = board.findPiece([file + 3, rank]);

	if (!leftPiece &&
	    !farLeftPiece &&
	    leftRook &&
	    !leftRook.hasMoved) {

	    moves.push({
		type: CASTLE,
		to: [file + 2, rank],
		rookFrom: leftRook.square,
		rookTo: [file + 1, rank]
	    });
	}

	return moves;
    }

    clone() {
	const copy = new King(
	    this.color,
	    this.square.slice()
	);

	copy.hasMoved = this.hasMoved;
	return copy;
    }
}

let diagonalMoveMixin = Base => class extends Base {
    diagonalMoves(board) {
	const forwardLeftMoves = super.makeMoveList(
	    this, board,
	    ([file, rank]) => [file - 1, rank + 1]);

	const forwardRightMoves = super.makeMoveList(
	    this, board,
	    ([file, rank]) => [file + 1, rank + 1]);

	const backwardLeftMoves = super.makeMoveList(
	    this, board,
	    ([file, rank]) => [file - 1, rank - 1]);

	const backwardRightMoves = super.makeMoveList(
	    this, board,
	    ([file, rank]) => [file + 1, rank - 1]);

	return [
	    ...forwardLeftMoves,
	    ...backwardLeftMoves,
	    ...forwardRightMoves,
	    ...backwardRightMoves
	];
    }
};

let crossMoveMixin = Base => class extends Base {
    crossMoves(board) {
	const forwardMoves = super.makeMoveList(
	    this, board,
	    ([file, rank]) => [file, rank + 1]);

	const backwardMoves = super.makeMoveList(
	    this, board,
	    ([file, rank]) => [file, rank - 1]);

	const leftMoves = super.makeMoveList(
	    this, board,
	    ([file, rank]) => [file - 1, rank]);

	const rightMoves = super.makeMoveList(
	    this, board,
	    ([file, rank]) => [file + 1, rank]);

	return [
	    ...forwardMoves,
	    ...backwardMoves,
	    ...leftMoves,
	    ...rightMoves
	];
    }
};

class Queen extends
crossMoveMixin(diagonalMoveMixin(Piece)) {
    constructor(color, square) {
	super(QUEEN, color, square);
    }

    getMoves(board) {
	return [
	    ...this.crossMoves(board),
	    ...this.diagonalMoves(board)
	];
    }

    clone() {
	return new Queen(
	    this.color,
	    this.square.slice()
	);
    }
}

class Bishop extends diagonalMoveMixin(Piece) {
    constructor(color, square) {
	super(BISHOP, color, square);
    }

    getMoves(board) {
	return this.diagonalMoves(board);
    }

    clone() {
	return new Bishop(
	    this.color,
	    this.square.slice()
	);
    }
}

class Knight extends Piece {
    constructor(color, square) {
	super(KNIGHT, color, square);
    }

    getMoves(board) {
	const [file, rank] = this.square;

	return [
	    [file - 2, rank + 1],
	    [file - 1, rank + 2],
	    [file + 1, rank + 2],
	    [file + 2, rank + 1],

	    [file - 2, rank - 1],
	    [file - 1, rank - 2],
	    [file + 1, rank - 2],
	    [file + 2, rank - 1],
	]
	    .filter(square => board.canOccupy(square, this.color))
	    .map((square) => ({ type: SIMPLE, to: square }));
    }

    clone() {
	return new Knight(
	    this.color,
	    this.square.slice()
	);
    }
}

class Rook extends crossMoveMixin(Piece) {
    constructor(color, square) {
	super(ROOK, color, square);
	this.hasMoved = false;
    }

    getMoves(board) {
	return this.crossMoves(board);
    }

    clone() {
	const copy = new Rook(
	    this.color,
	    this.square.slice()
	);

	copy.hasMoved = this.hasMoved;
	return copy;
    }
}

class Board {
    constructor(pieces) {
	this.pieces = pieces;
	this.removedPieces = [];
    }

    removePiece(piece) {
	this.pieces.splice(this.pieces.indexOf(piece), 1);
	this.removedPieces.push(piece);
    }

    applyMove(piece, move) {
	if (move.type === SIMPLE) {
	    const pieceOnTo = this.findPiece(move.to);
	    if (pieceOnTo && pieceOnTo.color !== piece.color) {
		this.removePiece(pieceOnTo);
	    }

	    this.pieces
		.filter((piece) => piece.type === PAWN)
		.forEach((piece) => {
		    piece.moved2SquaresLastTurn = false;
		});

	    if (piece.type === PAWN &&
		Math.abs(piece.square[1] - move.to[1]) === 2) {
		piece.moved2SquaresLastTurn = true;
	    }

	} else if (move.type === ENPASSANT) {
	    this.removePiece(move.enemyPiece);
	} else if (move.type === PROMOTION) {
	    this.removePiece(piece);
	    this.pieces.push(new Queen(piece.color, move.to));
	} else if (move.type === CASTLE) {
	    const rook = this.findPiece(move.rookFrom);
	    rook.square = move.rookTo;
	}

	if (piece.type === PAWN ||
	    piece.type === KING ||
	    piece.type === ROOK) {
	    piece.hasMoved = true;
	}

	piece.square = move.to;
    }

    moveResultsInCheck(piece, move) {
	const copy = this.clone();

	const copyPiece = copy.findPiece(piece.square);
	copy.applyMove(copyPiece, move);

	return copy.isKingInCheck(piece.color);
    }

    isKingInCheck(color) {
	return this.pieces
	    .filter((piece) => piece.color !== color)
	    .some((piece) => piece
		  .getMoves(this)
		  .some((move) => {
		      const foundPiece = this.findPiece(move.to);
		      if (!foundPiece) return false;

		      return foundPiece.type === KING &&
			  foundPiece.color === color;
		  }));
    }

    isKingInCheckMate(color) {
	if (!this.isKingInCheck(color)) return false;

	return this.pieces
	    .filter((piece) => piece.color === color)
	    .every((piece) => piece.getMoves(this)
		   .every((move) => this.moveResultsInCheck(piece, move)));
    }

    isInStaleMate(color) {
	return this.pieces
	    .filter((piece) => piece.color === color)
	    .every((piece) => piece.getMoves(this)
		   .filter((move) => !this.moveResultsInCheck(piece, move))
		   .length === 0);
    }

    canOccupy(square, byColor) {
	const piece = this.findPiece(square);

	return Board.squareExists(square) &&
	    ((!piece) || piece.color !== byColor);
    }

    findPiece(square) {
	return this.pieces
	    .find((piece) => squareEquals(piece.square, square)) ||
	    null;
    }

    clone() {
	const board = new Board(
	    this.pieces.map((piece) => piece.clone()),
	);

	board.removedPieces = this.removedPieces.map((piece) => piece.clone());

	return board;
    }

    static squareExists(square) {
	const [file, rank] = square;

	return file > 0 &&
	    file < 9 &&
	    rank > 0 &&
	    rank < 9;
    }
}

const PIECES = [
    new Pawn(WHITE, [1, 2]),
    new Pawn(WHITE, [2, 2]),
    new Pawn(WHITE, [3, 2]),
    new Pawn(WHITE, [4, 2]),
    new Pawn(WHITE, [5, 2]),
    new Pawn(WHITE, [6, 2]),
    new Pawn(WHITE, [7, 2]),
    new Pawn(WHITE, [8, 2]),

    new King(WHITE, [5, 1]),
    new Queen(WHITE, [4, 1]),

    new Bishop(WHITE, [6, 1]),
    new Bishop(WHITE, [3, 1]),

    new Knight(WHITE, [7, 1]),
    new Knight(WHITE, [2, 1]),

    new Rook(WHITE, [8, 1]),
    new Rook(WHITE, [1, 1]),


    new Pawn(BLACK, [1, 7]),
    new Pawn(BLACK, [2, 7]),
    new Pawn(BLACK, [3, 7]),
    new Pawn(BLACK, [4, 7]),
    new Pawn(BLACK, [5, 7]),
    new Pawn(BLACK, [6, 7]),
    new Pawn(BLACK, [7, 7]),
    new Pawn(BLACK, [8, 7]),

    new King(BLACK, [5, 8]),
    new Queen(BLACK, [4, 8]),

    new Bishop(BLACK, [6, 8]),
    new Bishop(BLACK, [3, 8]),

    new Knight(BLACK, [7, 8]),
    new Knight(BLACK, [2, 8]),

    new Rook(BLACK, [8, 8]),
    new Rook(BLACK, [1, 8]),
];

class Game {
    constructor(users) {
	this.users = users;

	this.turnColor = WHITE;
	this.selectedPiece = null;
	this.legalMoves = [];

	this.inputEnabled = true;

	this.board = new Board(PIECES);
	this.drawer = new Drawer('canvas');
    }

    begin() {
	this.draw();

	window.onclick = (event) => {
	    this.handleClick(event);
	};
    }

    end(winner, reason) {
	this.inputEnabled = false;

	if (winner) {
	    swal(`${winner === WHITE ? 'White' : 'Black'} wins by: ${reason}.`)
		.then(() => this.updateRankingsAndGoBack(winner));

	} else {
	    swal(`Draw by: ${reason}.`)
		.then(() => this.updateRankingsAndGoBack(winner));
	}
    }

    handleClick(event) {
	if (!this.inputEnabled) return;

	const { clientX, clientY } = event;

	const square = this.getSquareForCoords(
	    clientX, clientY, this.turnColor);

	const piece = this.board.findPiece(square);

	if (piece && piece.color === this.turnColor) {
	    this.selectedPiece = piece;
	     
	    this.legalMoves = piece.getMoves(this.board)
		.filter((move) => !this.board
			.moveResultsInCheck(this.selectedPiece, move));
	} else {
	    const selectedMove = this.legalMoves
		  .find((move) => squareEquals(move.to, square)) || null;

	    if (selectedMove) {
		this.board.applyMove(this.selectedPiece, selectedMove);
		this.switchTurn();
	    }
	}

	this.draw();

	if (this.board.isKingInCheckMate(this.turnColor)) {
	    this.end(otherColor(this.turnColor), 'Checkmate');
	} else if (this.board.isInStaleMate(this.turnColor)) {
	    this.end(null, 'Stalemate');
	}
    }

    switchTurn() {
	this.turnColor = otherColor(this.turnColor);
	this.selectedPiece = null;
	this.legalMoves = [];
    }

    getSquareForCoords(x, y, turnColor) {
	for (let i = 0; i <= 8; i++) {

	    if (y > (i * SQUARE_SIDE_LENGTH) &&
		y < ((i + 1) * SQUARE_SIDE_LENGTH)) {

		for (let j = 0; j <= 8; j++) {

		    if (x > (j * SQUARE_SIDE_LENGTH) &&
			x < ((j + 1) * SQUARE_SIDE_LENGTH)) {

			const file = j + 1;
			const rank = i + 1;

			if (turnColor === WHITE) {
			    return [file, 9 - rank];
			}

			return [9 - file, rank];
		    }
		}
	    }
	}

	return null;
    }

    updateRankingsAndGoBack(winner) {
	const { user1, user2 } = this.users;

	if (winner) {
	    if (winner === WHITE) {
		user1.score = user1.score + calcScore(user1.score, user2.score);
	    } else {
		user2.score = user2.score + calcScore(user2.score, user1.score);
	    }
	}

	localStorage.setItem(user1.email, JSON.stringify(user1));
	localStorage.setItem(user2.email, JSON.stringify(user2));

	window.location = 'index.html';
    }

    draw() {
	this.drawer.draw(
	    this.board.pieces,
	    this.legalMoves.map((move) => move.to),
	    this.turnColor
	);
    }
}

class Drawer {
    constructor(canvasId) {
	this.canvas = document.getElementById(canvasId);
	this.context = canvas.getContext('2d');

	this.setupCanvas();
    }

    setupCanvas() {
	this.canvas.height = BOARD_SIDE_LENGTH;
	this.canvas.width = BOARD_SIDE_LENGTH;
    }

    draw(pieces, legalMoves, turnColor) {
	const { width, height } = canvas;

	this.context.clearRect(0, 0, width, height);

	this.drawBoard();
	this.drawPieces(pieces, turnColor);
	this.drawLegalMoveCircles(legalMoves, turnColor);
    }

    drawBoard() {
	for (let i = 0; i <= 8; i++) {
	    for (let j = 0; j <= 8; j++) {
		if (i % 2 === 0) {
		    this.context.fillStyle = j % 2 === 0 ?
			WHITE_SQUARE_COLOR :
			BLACK_SQUARE_COLOR;
		} else {
		    this.context.fillStyle = j % 2 === 0 ?
			BLACK_SQUARE_COLOR :
			WHITE_SQUARE_COLOR;
		}

		this.context.fillRect(
		    j * SQUARE_SIDE_LENGTH,
		    i * SQUARE_SIDE_LENGTH,
		    SQUARE_SIDE_LENGTH,
		    SQUARE_SIDE_LENGTH);
	    }
	}
    }

    drawPieces(pieces, turnColor) {
	pieces.forEach((piece) => {
	    const { type, color, square } = piece;
	    const [file, rank] = square;

	    const x = turnColor === WHITE ?
		  (file - 1) * SQUARE_SIDE_LENGTH :
		  (8 - file) * SQUARE_SIDE_LENGTH;

	    const y = turnColor === WHITE ?
		  (8 - rank) * SQUARE_SIDE_LENGTH :
		  (rank - 1) * SQUARE_SIDE_LENGTH;

	    this.drawImage(
		pieceImageMap[color][type],
		x,
		y,
		SQUARE_SIDE_LENGTH,
		SQUARE_SIDE_LENGTH
	    );
	});
    }

    drawLegalMoveCircles(legalMoves, turnColor) {
	legalMoves.forEach((square) => {
	    const [file, rank] = square;

	    const x = turnColor === WHITE ?
		  (file - 1) * SQUARE_SIDE_LENGTH :
		  (8 - file) * SQUARE_SIDE_LENGTH;

	    const y = turnColor === WHITE ?
		  (8 - rank) * SQUARE_SIDE_LENGTH :
		  (rank - 1) * SQUARE_SIDE_LENGTH;

	    this.drawImage(
		'../assets/circle.svg',
		x + SQUARE_SIDE_LENGTH / 4,
		y + SQUARE_SIDE_LENGTH / 4,
		SQUARE_SIDE_LENGTH / 2,
		SQUARE_SIDE_LENGTH / 2,
		0.7
	    );
	});
    }

    drawImage(src, x, y, height, width, alpha = 1.0) {
	const image = new Image();

	image.onload = () => {
	    const prevAlpha = this.context.globalAlpha;

	    this.context.globalAlpha = alpha;
	    this.context.drawImage(
		image, x, y, height, width);

	    this.context.globalAlpha = prevAlpha;
	};

	image.src = src;
    }
}

const pieceImageMap = {
    [WHITE]: {
	[PAWN]: '../assets/pawn-white.svg',
	[KING]: '../assets/king-white.svg',
	[QUEEN]: '../assets/queen-white.svg',
	[ROOK]: '../assets/rook-white.svg',
	[BISHOP]: '../assets/bishop-white.svg',
	[KNIGHT]: '../assets/knight-white.svg',
    },
    [BLACK]: {
	[PAWN]: '../assets/pawn-black.svg',
	[KING]: '../assets/king-black.svg',
	[QUEEN]: '../assets/queen-black.svg',
	[ROOK]: '../assets/rook-black.svg',
	[BISHOP]: '../assets/bishop-black.svg',
	[KNIGHT]: '../assets/knight-black.svg',
    }
};

function fetchLoggedInUsers() {
    const user1Email = localStorage.getItem('loggedInUser1');
    const user2Email = localStorage.getItem('loggedInUser2');

    const user1Json = localStorage.getItem(user1Email);
    const user2Json = localStorage.getItem(user2Email);

    if (!(user1Json && user2Json)) {
	return null;
    }
    
    return {
	user1: JSON.parse(user1Json),
	user2: JSON.parse(user2Json)
    };
}

function setUserColorText(users) {
    const { user1, user2 } = users;
    
    document
	.getElementById('user1-color')
	.innerHTML = `${user1.email} is White`;
    
    document
	.getElementById('user2-color')
	.innerHTML = `${user2.email} is Black`;
}

let game;

function init() {
    const users = fetchLoggedInUsers();

    if (users) {
	setUserColorText(users);
	
	game = new Game(users);
	game.begin();	
    } else {
	swal('Users not logged in.').then(() => {
	    window.location = 'index.html';
	});
    }
}

function handleResign() {
    game.end(otherColor(game.turnColor), 'Resignation');
}

function handleDraw() {
    game.end(null, 'Mutual agreement');
}

function calcScore(winnerScore, loserScore) {
    return (winnerScore / loserScore) * 10;
}
