// constants

// colors
const WHITE = 'white';
const BLACK = 'black';

// piece types
const PAWN = 'pawn';
const KING = 'king';
const QUEEN = 'queen';
const BISHOP = 'bishop';
const KNIGHT = 'knight';
const ROOK = 'rook';

// move types
const SIMPLE = 'simple';
const ENPASSANT = 'enpassant';
const CASTLE = 'castle';
const PROMOTION = 'promotion';

// some constants for drawing the board
const BOARD_SIDE_LENGTH = window.innerHeight;
const SQUARE_SIDE_LENGTH = BOARD_SIDE_LENGTH / 8;

// square colors
const WHITE_SQUARE_COLOR = 'lightgrey';
const BLACK_SQUARE_COLOR = '#3A3B3C';
const LAST_MOVE_COLOR = '#808000';
const SELECT_PIECE_COLOR = 'lightblue';

const COORDS_COLOR = 'black';

const ALPHABET_STRING = 'abcdefgh';

const otherColor = (color) =>
      color === WHITE ? BLACK : WHITE;

// squares look like [file, rank]
const squareEquals = (square1, square2) =>
      square1[0] === square2[0] &&
      square1[1] === square2[1];

class Move {
    constructor(type, piece, to) {
        this.type = type;
        this.piece = piece;
        this.to = to;
    }

    clone() {
        return new Move(
            this.type,
            this.piece.clone(),
            this.to.slice()
        );
    }
}

class EnPassantMove extends Move {
    constructor(piece, to, enemyPawn) {
        super(ENPASSANT, piece, to);
        this.enemyPawn = enemyPawn;
    }

    clone() {
        return new EnPassantMove(
            this.piece.clone(),
            this.to.slice(),
            this.enemyPawn.clone()
        );
    }
}

class CastleMove extends Move {
    constructor(piece, to, rookFrom, rookTo) {
        super(CASTLE, piece, to);
        this.rookFrom = rookFrom;
        this.rookTo = rookTo;
    }

    clone() {
        return new CastleMove(
            this.piece.clone(),
            this.to.slice(),
            this.rookFrom.slice(),
            this.rookTo.slice()
        );
    }
}

// base class for a piece
class Piece {
    constructor(type, color, square) {
	    this.type = type;
	    this.color = color;
	    this.square = square;
    }

    onMove() {}
}

class Pawn extends Piece {
    constructor(color, square) {
	    super(PAWN, color, square);
	    this.hasMoved = false;
	    this.moved2SquaresLastTurn = false;
    }

    getMoves(board) {
        const [file, rank] = this.square;

	    return this.color === WHITE ?
	        this.compMoves(board, {
                forward: [file, rank + 1],
                forward2: [file, rank + 2],
                forwardLeft: [file - 1, rank + 1],
                forwardRight: [file + 1, rank + 1],
                left: [file - 1, rank],
                right: [file + 1, rank]
            }) :
            this.compMoves(board, {
                forward: [file, rank - 1],
                forward2: [file, rank - 2],
                forwardLeft: [file + 1, rank - 1],
                forwardRight: [file - 1, rank - 1],
                left: [file + 1, rank],
                right: [file - 1, rank]
            });
    }

    compMoves(board, squares) {
	    const moves = [];

	    if (!board.findPiece(squares.forward)) {
            moves.push(new Move(SIMPLE, this, squares.forward));

	        if (!this.hasMoved && !board.findPiece(squares.forward2)) {
		        moves.push(new Move(SIMPLE, this, squares.forward2));
	        }
	    }

	    const forwardLeftPiece = board.findPiece(squares.forwardLeft);
	    if (forwardLeftPiece && forwardLeftPiece.color !== this.color) {
	        moves.push(new Move(SIMPLE, this, squares.forwardLeft));
	    }

	    const forwardRightPiece = board.findPiece(squares.forwardRight);
	    if (forwardRightPiece && forwardRightPiece.color !== this.color) {
	        moves.push(new Move(SIMPLE, this, squares.forwardRight));
	    }

	    const leftPiece = board.findPiece(squares.left);
	    if (leftPiece &&
	        leftPiece.color !== this.color &&
	        leftPiece.moved2SquaresLastTurn &&
	        !forwardLeftPiece) {
            moves.push(new EnPassantMove(
                this, squares.forwardLeft, leftPiece));
	    }

	    const rightPiece = board.findPiece(squares.right);
	    if (rightPiece &&
	        rightPiece.color !== this.color &&
	        rightPiece.moved2SquaresLastTurn &&
	        !forwardRightPiece) {
            moves.push(new EnPassantMove(
                this, squares.forwardRight, rightPiece));
	    }

	    return this.withPromotionMoves(moves);
    }

    withPromotionMoves(moves) {
        return moves.map((move) => {
	        const rank = move.to[1];

	        if (rank === 1 || rank === 8) {
                move.type = PROMOTION;
	        }

	        return move;
	    });
    }

    onMove(move) {
        this.hasMoved = true;

        if (Math.abs(this.square[1] - move.to[1]) === 2) {
            this.moved2SquaresLastTurn = true;
        } else {
            this.moved2SquaresLastTurn = false;
        }
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
              .map((square) => new Move(SIMPLE, this, square));

	    const castlingMoves = this.getCastlingMoves(board);

	    return [...moves, ...castlingMoves];
    }

    getCastlingMoves(board, squares) {
        if (this.hasMoved) return [];

        const [file, rank] = this.square;

	    const moves = [];

	    const kingSidePiece = board.findPiece([file + 1, rank]);
	    const kingSide2Piece = board.findPiece([file + 2, rank]);
	    const kingSideRook = board.findPiece([file + 3, rank]);

	    if (!kingSidePiece &&
	        !kingSide2Piece &&
	        kingSideRook &&
	        !kingSideRook.hasMoved) {

            moves.push(new CastleMove(
                this,
                [file + 2, rank],
                [file + 3, rank],
                [file + 1, rank]
            ));
	    }

	    const queenSidePiece = board.findPiece([file - 1, rank]);
	    const queenSide2Piece = board.findPiece([file - 2, rank]);
	    const queenSide3Piece = board.findPiece([file - 3, rank]);
	    const queenSideRook = board.findPiece([file - 4, rank]);

	    if (!queenSidePiece &&
	        !queenSide2Piece &&
	        !queenSide3Piece &&
	        queenSideRook &&
	        !queenSideRook.hasMoved) {

            moves.push(new CastleMove(
                this,
                [file - 2, rank],
                [file - 4, rank],
                [file - 1, rank]
            ));
	    }

	    return moves;
    }

    onMove(move) {
        this.hasMoved = true;
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

// provides a utility function to create a list of moves for pieces that move in "lines" (that is: the bishop, rook and queen)
let lineMoveMixin = Base => class extends Base {
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
	        .map((square) => new Move(SIMPLE, piece, square));
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
crossMoveMixin(diagonalMoveMixin(lineMoveMixin(Piece))) {
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

class Bishop extends diagonalMoveMixin(lineMoveMixin(Piece)) {
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
	        .map((square) => new Move(SIMPLE, this, square));
    }

    clone() {
	    return new Knight(
	        this.color,
	        this.square.slice()
	    );
    }
}

class Rook extends crossMoveMixin(lineMoveMixin(Piece)) {
    constructor(color, square) {
	    super(ROOK, color, square);
	    this.hasMoved = false;
    }

    getMoves(board) {
	    return this.crossMoves(board);
    }

    onMove() {
        this.hasMoved = true;
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
        this.moveHistory = [];
    }

    removePiece(piece, addToRemovedPieces = false) {
        const pieceIndex = this.pieces.indexOf(piece);
	    this.pieces.splice(pieceIndex, 1);

        if (addToRemovedPieces) {
            this.removedPieces.push(piece);
        }
    }

    getLegalMoves(piece) {
        return piece.getMoves(this)
		    .filter((move) => !this.moveResultsInCheck(move));
    }

    applyMove(move) {
        const { type, piece, to } = move;

        if (type === CASTLE) {
            const rook = this.findPiece(move.rookFrom);
	        rook.square = move.rookTo;
        } else if (type === ENPASSANT) {
	        this.removePiece(move.enemyPawn, true);
        } else if (type === PROMOTION) {
            this.removePiece(piece);
	        this.pieces.push(new Queen(piece.color, to));

            console.log(this.pieces);
        }

        this.recordMove(move);
        this.movePiece(move);
    }

    recordMove(move) {
        const { piece } = move;

        this.moveHistory.push({
            type: move.type,
            from: piece.square.slice(),
            to: move.to
        });
    }

    movePiece(move) {
        const { piece } = move;

        piece.onMove(move);

        const pieceOnTo = this.findPiece(move.to);
	    if (pieceOnTo && pieceOnTo.color !== piece.color) {
		    this.removePiece(pieceOnTo, true);
	    }

	    move.piece.square = move.to;
    }

    moveResultsInCheck(move) {
        const { piece } = move;

        const boardCopy = this.clone();
        const pieceCopy = boardCopy.findPiece(piece.square);

	    boardCopy.applyMove(move.clone());
	    return boardCopy.isKingInCheck(piece.color);
    }

    isKingInCheck(color) {
	    return this.pieces
	        .filter((piece) => piece.color !== color)
	        .some((piece) => piece
		          .getMoves(this)
                  .some((move) => {
		              const foundPiece = this.findPiece(move.to);

                      if (foundPiece &&
                          foundPiece.type === KING &&
			              foundPiece.color === color) {
                          return true;
                      }

                      return false;
		          }));
    }

    isKingInCheckMate(color) {
	    if (!this.isKingInCheck(color)) return false;

	    return this.pieces
	        .filter((piece) => piece.color === color)
	        .every((piece) => piece.getMoves(this)
		           .every((move) => this.moveResultsInCheck(move)));
    }

    isInStaleMate(color) {
	    return this.pieces
	        .filter((piece) => piece.color === color)
	        .every((piece) => piece.getMoves(this)
		           .filter((move) => !this.moveResultsInCheck(move))
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

	    this.currentTurn = WHITE;
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

        window.onresize = () => {
            this.draw();
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
	    const clickedSquare = this.getSquareForCoords(
	        clientX, clientY, this.currentTurn);

	    const piece = this.board.findPiece(clickedSquare);

	    if (piece && piece.color === this.currentTurn) {
	        this.selectedPiece = piece;
	        this.legalMoves = this.board.getLegalMoves(piece);
	    } else if (this.selectedPiece) {
	        const selectedMove = this.findLegalMove(clickedSquare);

	        if (selectedMove) {
		        this.board.applyMove(selectedMove);
		        this.switchTurn();
	        }
	    }

	    this.draw();

	    if (this.board.isKingInCheckMate(this.currentTurn)) {
	        this.end(otherColor(this.currentTurn), 'Checkmate');

	    } else if (this.board.isInStaleMate(this.currentTurn)) {
	        this.end(null, 'Stalemate');
	    }
    }

    switchTurn() {
	    this.currentTurn = otherColor(this.currentTurn);
	    this.selectedPiece = null;
	    this.legalMoves = [];
    }

    findLegalMove(square) {
        return this.legalMoves
            .find((move) => squareEquals(move.to, square)) || null;
    }

    getSquareForCoords(x, y, currentTurn) {
	    for (let i = 0; i <= 8; i++) {

	        if (y > (i * SQUARE_SIDE_LENGTH) &&
		        y < ((i + 1) * SQUARE_SIDE_LENGTH)) {

		        for (let j = 0; j <= 8; j++) {

		            if (x > (j * SQUARE_SIDE_LENGTH) &&
			            x < ((j + 1) * SQUARE_SIDE_LENGTH)) {

			            const file = j + 1;
			            const rank = i + 1;

			            if (currentTurn === WHITE) {
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
		        user1.score = calcScore(user1.score, user2.score);
	        } else {
		        user2.score = calcScore(user2.score, user1.score);
	        }
	    }

	    localStorage.setItem(user1.email, JSON.stringify(user1));
	    localStorage.setItem(user2.email, JSON.stringify(user2));

        clearLoggedInUsers();

	    window.location = 'index.html';
    }

    draw() {
        const overrideColors = [];

        if (this.selectedPiece) {
            overrideColors.push(
                { color: SELECT_PIECE_COLOR, square: this.selectedPiece.square }
            );
        }

        const { moveHistory } = this.board;
        if (moveHistory.length > 0) {
            const lastMove = moveHistory[moveHistory.length - 1];

            overrideColors.push(
                { color: LAST_MOVE_COLOR, square: lastMove.from },
                { color: LAST_MOVE_COLOR, square: lastMove.to }
            );
        }

	    this.drawer.draw(
	        this.board.pieces,
	        this.legalMoves.map((move) => move.to),
            overrideColors,
	        this.currentTurn === WHITE
	    );

        this.updateCapturedPieces();
    }

    updateCapturedPieces() {
        this.updateCapturedPiecesForColor(WHITE);
        this.updateCapturedPiecesForColor(BLACK);
    }

    updateCapturedPiecesForColor(color) {
        const { removedPieces } = this.board;

        const pieces = removedPieces
              .filter((piece) => piece.color === color);
        const groups = this.groupByType(pieces);

        const piecesDiv = document.getElementById(`${color}-captured-pieces`);

        while (piecesDiv.lastChild) {
            piecesDiv.removeChild(piecesDiv.lastChild);
        }

        Object.keys(groups)
            .forEach((type) => {
                piecesDiv.appendChild(
                    this.makeCapturedPieceDiv(
                        type, color, groups[type].length));
            });
    }

    makeCapturedPieceDiv(type, color, count) {
        const container = document.createElement('div');
        container.className = 'captured-piece';

        const pieceImage = document.createElement('img');
        pieceImage.src = `../assets/${type}-${color}.svg`;

        container.appendChild(pieceImage);

        if (count > 1) {
            const numberTag = document.createElement('div');
            numberTag.className = 'number-tag';

            const numberTagText = document.createElement('div');
            numberTagText.className = 'number-tag-text';
            numberTagText.innerHTML = count;

            numberTag.appendChild(numberTagText);
            container.appendChild(numberTag);
        }

        return container;
    }

    groupByType(list) {
        const groups = {};

        list.forEach((el) => {
            if (groups[el.type]) {
                groups[el.type].push(el);
            } else {
                groups[el.type] = [el];
            }
        });

        return groups;
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

    draw(pieces, legalMoveSquares, overrideColors, isFlipped) {
	    const { width, height } = canvas;

	    this.context.clearRect(0, 0, width, height);

	    this.drawBoard(isFlipped, overrideColors);
        this.drawCoords(isFlipped);
	    this.drawPieces(pieces, isFlipped);
	    this.drawLegalMoveCircles(legalMoveSquares, isFlipped);
    }

    drawBoard(isFlipped, overrideColors) {
	    for (let i = 0; i <= 8; i++) {
	        for (let j = 0; j <= 8; j++) {

                const square = isFlipped ?
                      [j + 1, 8 - i] :
                      [8 - j, i + 1];

                const overrideColor = overrideColors
                      .find((color) => squareEquals(color.square, square)) || null;

                if (overrideColor) {
                    this.context.fillStyle = overrideColor.color;
                } else {
                    if (i % 2 === 0) {
		                this.context.fillStyle = j % 2 === 0 ?
			                WHITE_SQUARE_COLOR :
			                BLACK_SQUARE_COLOR;
		            } else {
		                this.context.fillStyle = j % 2 === 0 ?
			                BLACK_SQUARE_COLOR :
			                WHITE_SQUARE_COLOR;
		            }
                }

		        this.context.fillRect(
		            j * SQUARE_SIDE_LENGTH,
		            i * SQUARE_SIDE_LENGTH,
		            SQUARE_SIDE_LENGTH,
		            SQUARE_SIDE_LENGTH);
	        }
	    }
    }

    drawCoords(isFlipped) {
        this.context.fillStyle = COORDS_COLOR;
        this.context.font = 'bold 24px sans-serif';

        for (let i = 1; i <= 8; i++) {
            if (isFlipped) {
                this.context.fillText(`${9 - i}`, 0, (i * SQUARE_SIDE_LENGTH) - 8);
            } else {
                this.context.fillText(`${i}`, 0, (i * SQUARE_SIDE_LENGTH) - 8);
            }
        }

        for (let i = 1; i <= 8; i++) {
            if (isFlipped) {
                this.context.fillText(`${ALPHABET_STRING.charAt(i - 1)}`,
                                      (i * SQUARE_SIDE_LENGTH) - 24,
                                      BOARD_SIDE_LENGTH - 8);
            } else {
                this.context.fillText(`${ALPHABET_STRING.charAt(8 - i)}`,
                                      (i * SQUARE_SIDE_LENGTH) - 24,
                                      BOARD_SIDE_LENGTH - 8);
            }
        }
    }

    drawPieces(pieces, isFlipped) {
	    pieces.forEach((piece) => {
	        const { type, color, square } = piece;
	        const [file, rank] = square;

	        const x = isFlipped ?
		          (file - 1) * SQUARE_SIDE_LENGTH :
		          (8 - file) * SQUARE_SIDE_LENGTH;

	        const y = isFlipped ?
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

    drawLegalMoveCircles(legalMoveSquares, isFlipped) {
	    legalMoveSquares.forEach((square) => {
	        const [file, rank] = square;

	        const x = isFlipped ?
		          (file - 1) * SQUARE_SIDE_LENGTH :
		          (8 - file) * SQUARE_SIDE_LENGTH;

	        const y = isFlipped ?
		          (8 - rank) * SQUARE_SIDE_LENGTH :
		          (rank - 1) * SQUARE_SIDE_LENGTH;

	        this.drawImage(
		        '../assets/circle.svg',
		        x + SQUARE_SIDE_LENGTH / 4,
		        y + SQUARE_SIDE_LENGTH / 4,
		        SQUARE_SIDE_LENGTH / 2,
		        SQUARE_SIDE_LENGTH / 2,
		        0.7,
	        );
	    });
    }

    drawImage(src, x, y, height, width, alpha = 1.0) {
	    const image = new Image();

	    image.onload = () => {
	        this.context.save();

	        this.context.globalAlpha = alpha;
	        this.context.drawImage(
		        image, x, y, height, width);

	        this.context.restore();
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

function clearLoggedInUsers() {
    localStorage.removeItem('loggedInUser1');
    localStorage.removeItem('loggedInUser2');
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
    // const users = fetchLoggedInUsers();
    //

    const users = {
        user1: {
            email: 'email'
        },
        user2: {
            email: 'email'
        }
    };

    if (users) {
	    setUserColorText(users);

	    game = new Game(users);
	    game.begin();
    } else {
	    swal('Users not logged in.')
            .then(() => {
	            window.location = 'index.html';
	        });
    }
}

function handleResign() {
    game.end(otherColor(game.currentTurn), 'Resignation');
}

function handleDraw() {
    game.end(null, 'Mutual agreement');
}

function calcScore(winnerScore, loserScore) {
    return winnerScore + (winnerScore / loserScore) * 10;
}
