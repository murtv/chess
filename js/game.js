// the main control flow of game resides in the handleClick method of Game
// there is no main loop and the game is event driven

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
const SQUARE_SIDE_LENGTH = BOARD_SIDE_LENGTH / 8; // to divide the board in 8 rows and columns

// square colors
const WHITE_SQUARE_COLOR = 'lightgrey';
const BLACK_SQUARE_COLOR = '#3A3B3C';
const LAST_MOVE_COLOR = '#808000';
const SELECT_PIECE_COLOR = 'lightblue';

// coordinate font color
const COORDS_COLOR = 'black';

const otherColor = (color) =>
      color === WHITE ? BLACK : WHITE;

// squares look like [file, rank]
const squareEquals = (square1, square2) =>
      square1[0] === square2[0] &&
      square1[1] === square2[1];


// base class for all moves
// see applyMove() in Board to see how they are used
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


    // get the raw move pattern of a
    // piece (without checking whether the moves results in a check)
    getMoves(board) {}

    // this is a hook will be used in certain subclasses to
    // get notified when a piece is moved so that it can update some
    // of its fields like hasMoved (see Pawn)
    onMove() {}


    // make a copy of this object.
    // used when running a move in a board copy to see if it results in a check
    // see moveResultsInCheck in Board
    clone() {}
}

class Pawn extends Piece {
    constructor(color, square) {
	    super(PAWN, color, square);
	    this.hasMoved = false;
	    this.moved2SquaresLastTurn = false;
    }

    // a pawn does not move symmetrically like other pieces
    // so we have to define two sets of squares (white and black)
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

        // if the forward square is empty add it as a move
	    if (!board.findPiece(squares.forward)) {
            moves.push(new Move(SIMPLE, this, squares.forward));

            // if forward square is empty, the pawn hasn't
            // moved and the square thats 2 squares ahead of us is empty add that as a move
	        if (!this.hasMoved && !board.findPiece(squares.forward2)) {
		        moves.push(new Move(SIMPLE, this, squares.forward2));
	        }
	    }

        // if an enemy is present at the upper left square add that as a move
	    const forwardLeftPiece = board.findPiece(squares.forwardLeft);
	    if (forwardLeftPiece && forwardLeftPiece.color !== this.color) {
	        moves.push(new Move(SIMPLE, this, squares.forwardLeft));
	    }

        // same check for the upper right square
	    const forwardRightPiece = board.findPiece(squares.forwardRight);
	    if (forwardRightPiece && forwardRightPiece.color !== this.color) {
	        moves.push(new Move(SIMPLE, this, squares.forwardRight));
	    }

        // if an enemy pawn moved 2 squares last move and
        // ended up on either side of this pawn create an en-passant move

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

    // if a move results in the pawn being in the enemy's last rank,
    // make it a promotion move
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

    // create a move list and filter out squares that are not on
    // the board  or are occupied by friendly pieces
    // then add castling moves and return
    getMoves(board, addCastlingMoves = true) {
	    const [file, rank] = this.square;

	    const moves = [
	        [file, rank + 1], // forward
	        [file + 1, rank + 1], // forward-right
	        [file + 1, rank], // right
	        [file + 1, rank - 1], //backward-right
	        [file, rank - 1], // backward
	        [file - 1, rank - 1], // backward-left
	        [file - 1, rank], // left
	        [file - 1, rank + 1], // forward-left
	    ]
	          .filter(square => board.canOccupy(square, this.color))
              .map((square) => new Move(SIMPLE, this, square));

	    const castlingMoves = addCastlingMoves ?
              this.getCastlingMoves(board) :
              [];

	    return [...moves, ...castlingMoves];
    }

    getCastlingMoves(board) {
        if (this.hasMoved) return [];

        // cannot castle if in check
        if (board.isKingInCheck(this.color, false)) {
            return [];
        }

        const [file, rank] = this.square;

	    const moves = [];

	    const kingSideRook = board.findPiece([file + 3, rank]);

        // if the immediate square on the kingside
        // and the square two squares away are vacant
        // and if a rook is present on the kingside that hasn't moved
        // and if a king does't "through" a check
        // the king can castle
	    if (!board.findPiece([file + 1, rank]) &&
	        !board.findPiece([file + 2, rank]) &&
            !board.moveResultsInCheck(new CastleMove(this, [file + 2, rank])) &&
	        kingSideRook &&
	        !kingSideRook.hasMoved) {

            moves.push(new CastleMove(
                this,
                [file + 2, rank], // where the king should end up
                [file + 3, rank], // where the kingside rook is
                [file + 1, rank] // where the kingside rook should end up
            ));
	    }

	    const queenSideRook = board.findPiece([file - 4, rank]);

        // same as the checks for kingside but on queenside
        // we have to check for and additional square
	    if (!board.findPiece([file - 1, rank]) &&
	        !board.findPiece([file - 2, rank]) &&
	        !board.findPiece([file - 3, rank]) &&
            !board.moveResultsInCheck(new CastleMove(this, [file - 2, rank])) &&
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

// provides a utility function to create a list of moves for the bishop, rook and queen
let lineMoveMixin = Base => class extends Base {

    // keep adding squares in a some direction until a piece is hit
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

    // get moves in diagonal directions (bishop)
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

    // get moves in a plus pattern (rook)
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

    // the queen's move pattern is the combination of the bishop's and rook's move patterns
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
            this.removedPieces.push(piece.clone());
        }
    }

    // filter out moves that results in a check on self
    getLegalMoves(piece) {
        return piece.getMoves(this)
		    .filter((move) => !this.moveResultsInCheck(move));
    }

    // do some special tasks for special move types,
    // then record the move and actually move the piece (this is common to all moves)
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

        // if there is an enemy piece on the square we are moving to, capture it
        const pieceOnTo = this.findPiece(move.to);
	    if (pieceOnTo && pieceOnTo.color !== piece.color) {
		    this.removePiece(pieceOnTo, true);
	    }

	    move.piece.square = move.to;
    }

    // copies the board and applies the move in that copy to check whether
    // a move would result in a check
    moveResultsInCheck(move) {
        const boardCopy = this.clone();
        const pieceCopy = boardCopy.findPiece(move.piece.square);

        const moveCopy = move.clone();
        moveCopy.piece = pieceCopy;

	    boardCopy.applyMove(moveCopy);
	    return boardCopy.isKingInCheck(moveCopy.piece.color, false);
    }

    // if any of the enemy pieces has some move that
    // ends up capturing the opposite king, that king is in check
    isKingInCheck(color, withCastlingMoves = true) {
	    return this.pieces
	        .filter((piece) => piece.color !== color)
	        .some((piece) => piece.getMoves(this, withCastlingMoves) // the king needs the latter argument other pieces will ignore it
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

    // if every move we can make still ends up with our king in check we are checkmated
    isKingInCheckMate(color) {
	    if (!this.isKingInCheck(color)) return false;

	    return this.pieces
	        .filter((piece) => piece.color === color)
	        .every((piece) => piece.getMoves(this)
		           .every((move) => this.moveResultsInCheck(move)));
    }

    // if we are not in check and none of our pieces have any legal moves to make,
    // we are in a stalemate
    isInStaleMate(color) {
        if (this.isKingInCheck(color)) return false;

	    return this.pieces
	        .filter((piece) => piece.color === color)
	        .every((piece) => piece.getMoves(this)
		           .filter((move) => !this.moveResultsInCheck(move))
		           .length === 0);
    }

    // squares that are either vacant or occupied by enemies can be occupied
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

    // check if a square is on the board
    static squareExists(square) {
	    const [file, rank] = square;

	    return file > 0 &&
	        file < 9 &&
	        rank > 0 &&
	        rank < 9;
    }
}

// default board setup
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
    }

    end(winner, reason) {
	    this.inputEnabled = false;

        // if we have no winner, the game was a draw
	    if (winner) {
	        swal(`${winner === WHITE ? 'White' : 'Black'} wins by: ${reason}.`)
		        .then(() => this.updateRankingsAndGoBack(winner));
	    } else {
	        swal(`Draw by: ${reason}.`)
		        .then(() => this.updateRankingsAndGoBack(null));
	    }
    }

    handleClick(event) {
	    if (!this.inputEnabled) return;

        // get the square under the mouse x and y coords
	    const { clientX, clientY } = event;
	    const clickedSquare = this.getSquareForCoords(
	        clientX, clientY, this.currentTurn);

        if (!clickedSquare) return;

	    const piece = this.board.findPiece(clickedSquare);

        // if we clicked a friendly piece, set that piece as the selected piece
        // and compute its legal moves
	    if (piece && piece.color === this.currentTurn) {
	        this.selectedPiece = piece;
	        this.legalMoves = this.board.getLegalMoves(piece);
	    } else if (this.selectedPiece) {
            // if a piece has already been selected,
            // the clicked square is the square of the move. apply it and switch turns.
	        const selectedMove = this.findLegalMove(clickedSquare);

	        if (selectedMove) {
		        this.board.applyMove(selectedMove);
		        this.switchTurn();
	        }
	    }


	    this.draw();

        // after every move we have to perform these checks

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

    // loop over the ranks and for every rank, loop over the files,
    // if x and y coords fall in that rank and file return it
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

    // update score, clear users, and send back to the rankings page
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

	    window.location = 'rankings.php';
    }

    draw() {
        const overrideColors = [];

        // if we have a selected piece, the square of the piece should be highlighted
        if (this.selectedPiece) {
            overrideColors.push(
                { color: SELECT_PIECE_COLOR, square: this.selectedPiece.square }
            );
        }

        // highlight the from and to squares of the last move
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

        // empty the div
        while (piecesDiv.lastChild) {
            piecesDiv.removeChild(piecesDiv.lastChild);
        }

        // for every type add a captured piece image
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

        // if count > 1 add a number tag on the piece image
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

// responsible for managing the canvas context and drawing
// the state of the board
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

                // get the opposite square if the board is flipped
                const square = isFlipped ?
                      [j + 1, 8 - i] :
                      [8 - j, i + 1];

                const overrideColor = overrideColors
                      .find((color) => squareEquals(color.square, square)) || null;

                // is a color override is present use that instead of the normal board colors
                if (overrideColor) {
                    this.context.fillStyle = overrideColor.color;
                } else {
                    // this creates the alternating color pattern of the board
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

    // marks the ranks and files on the board
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

        // we use alphabet string to get a char for a number
        // (because files are marked by letters)
        const alphabetString = 'abcdefgh';
        for (let i = 1; i <= 8; i++) {
            if (isFlipped) {
                this.context.fillText(`${alphabetString.charAt(i - 1)}`,
                                      (i * SQUARE_SIDE_LENGTH) - 24,
                                      BOARD_SIDE_LENGTH - 8);
            } else {
                this.context.fillText(`${alphabetString.charAt(8 - i)}`,
                                      (i * SQUARE_SIDE_LENGTH) - 24,
                                      BOARD_SIDE_LENGTH - 8);
            }
        }
    }

    // the x and y positions must be mirrored if the board is flipped
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

    // the x and y positions must be mirrored if the board is flipped
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

// a map of the piece types to their asset files
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

// get logged in users from local storage
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

// sets the text that shows which player is which color
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

// fetch the users and begin the game
function init() {
    const users = fetchLoggedInUsers();

    if (users) {
	    setUserColorText(users);

	    game = new Game(users);
	    game.begin();
    } else {
	    swal('Users not logged in.')
            .then(() => {
	            window.location = 'index.php';
	        });
    }
}

// beating players with higher scores should get us more points
// and vice versa
function calcScore(winnerScore, loserScore) {
    return winnerScore + (winnerScore / loserScore) * 10;
}

// these are handlers for buttons

function handleResign() {
    game.end(otherColor(game.currentTurn), 'Resignation');
}

function handleDraw() {
    game.end(null, 'Mutual agreement');
}
