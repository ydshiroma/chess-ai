/*
 * A simple chess AI, by someone who doesn't know how to play chess.
 * Uses the chessboard.js and chess.js libraries.
 *
 * Copyright (c) 2020 Zhang Zeyu
 */

const fen = 'rnkqnr/pppppp/6/6/PPPPPP/RNKQNR w KQkq - 0 1'

var STACK_SIZE = 100; // maximum size of undo stack

var board = null;
var $board = $('#myBoard');
//console.log("$board: " + JSON.stringify($board))
// var game = new Chess();

// validation still runs even with skipValidation flag
var game = new Chess(
  fen,
  { skipValidation: true },
)

// var game = new Chess(fen);
// let game = new Chess(
//   fen,
//   { skipValidation: true },
// )
var globalSum = 0; // always from black's perspective. Negative for white's perspective.
var whiteSquareGrey = '#a9a9a9';
var blackSquareGrey = '#696969';

var squareClass = 'square-55d63';
var squareToHighlight = null;
var colorToHighlight = null;
var positionCount;

var config = {
  draggable: true,
  position: fen,
  onDragStart: onDragStart,
  onDrop: onDrop,
  onMouseoutSquare: onMouseoutSquare,
  onMouseoverSquare: onMouseoverSquare,
  onSnapEnd: onSnapEnd,
  //added this
  orientation: 'white',
};
var board = Chessboard('myBoard', config);
//console.log("Board orientation:", board.orientation());

//console.log("board (from main): " + JSON.stringify(board))
//console.log("game (from main): " + JSON.stringify(game))

timer = null;

/*
 * Piece Square Tables, adapted from Sunfish.py:
 * https://github.com/thomasahle/sunfish/blob/master/sunfish.py
 */

// TODO: this is where piece weights are set
// going to keep everything multiplied by 100
var weights = { p: 100, n: 300, b: 300, r: 500, q: 900, k: 2000, k_e: 2000 };

/*
 * Evaluates the board at this point in time,
 * using the material weights and piece square tables.
 */
//TODO: instead of using prevSum, just add up value of all pieces on the board?
function evaluateBoard(game, move, prevSum, color) {
  //console.log("game: " + JSON.stringify(game));
  //console.log("move: " + JSON.stringify(move));
  // console.log("prevSum: " + prevSum);
  // console.log("color: " + color);
  //console.log("get pieces: " + game.getPieces({ type: 'n', color: 'w' }));
  //console.log("board: " + game.board)
  //console.log("Board orientation:", board.orientation());

  if (game.in_checkmate()) {
    // Opponent is in checkmate (good for us)
    if (move.color === color) {
      return 10 ** 10;
    }
    // Our king's in checkmate (bad for us)
    else {
      return -(10 ** 10);
    }
  }

  if (game.in_draw() || game.in_threefold_repetition() || game.in_stalemate())
  {
    return 0;
  }

  // let point_total = 0;
  let currSum = prevSum;

  if ('captured' in move)
    {
        // Opponent piece was captured (good for us)
        if (move.color === color)
        {
          //TODO: how to access info about which piece was captured?
            currSum += weights[move.captured];
        }
        // Our piece was captured (bad for us)
        else
        {
            currSum -= weights[move.captured];
        }
    }

    if (move.flags.includes('p')) {
        // NOTE: promote to queen for simplicity
        move.promotion = 'q';

        // Our piece was promoted (good for us)
        if (move.color === color)
        {
          // subtract value of piece that was promoted
          // add value of piece it was promoted to
          currSum -= weights["p"];
          currSum += weights["q"];
        }
        // Opponent piece was promoted (bad for us)
        else
        {
          // add value of piece that was promoted
          // subtract value of piece it was promoted to
          currSum -= weights["p"];
          currSum += weights["q"];
        }
    }

  // console.log("squares: " + game["SQUARES"])
  // for (let i = 0; i < game["SQUARES"].length; i++) {
  //   //console.log(game["SQUARES"][i]);
  //   //console.log(game["SQUARES"][i].piece);
  //   //console.log(game.get(game["SQUARES"][i]));

  //   let piece = game.get(game["SQUARES"][i]);
  //   let piece_value;
  //   if (piece) {
  //     if (piece["color"] == color) {
  //       console.log("piece is " + color);
  //       piece_value = weights[piece["type"]];        
  //     } else {
  //       console.log("piece is " + color);
  //       piece_value = -weights[piece["type"]];
  //     }
  //     console.log(piece_value);
  //     point_total += piece_value;
  //   }
    
  // }

  // TODO: calculate number of possible moves for each piece and add to prevSum
  // 8 possible moves = 100 (equivalent to one pawn)
  //TODO: need to do this for both colors? I'm confused. or am I just adding the value of one side's material here?
  const value_one_move = 100 / 8;
  //TODO: can make this run faster by using game.ugly_moves()
  const available_moves = game.ugly_moves().length;
  //console.log("available moves: " + available_moves)
  const num_to_add = value_one_move * available_moves;
  currSum += num_to_add;
  //console.log("current sum: " + currSum);
  return currSum;
}

/*
 * Performs the minimax algorithm to choose the best move: https://en.wikipedia.org/wiki/Minimax (pseudocode provided)
 * Recursively explores all possible moves up to a given depth, and evaluates the game board at the leaves.
 *
 * Basic idea: maximize the minimum value of the position resulting from the opponent's possible following moves.
 * Optimization: alpha-beta pruning: https://en.wikipedia.org/wiki/Alpha%E2%80%93beta_pruning (pseudocode provided)
 *
 * Inputs:
 *  - game:                 the game object.
 *  - depth:                the depth of the recursive tree of all possible moves (i.e. height limit).
 *  - isMaximizingPlayer:   true if the current layer is maximizing, false otherwise.
 *  - sum:                  the sum (evaluation) so far at the current layer.
 *  - color:                the color of the current player.
 *
 * Output:
 *  the best move at the root of the current subtree.
 */
function minimax(game, depth, alpha, beta, isMaximizingPlayer, sum, color) {
  // TODO: how to hard-code depth? is it 1 move = white and black both play or 1 move = either white or black plays?
  //depth = 2

  positionCount++;
  var children = game.ugly_moves({ verbose: true });

  // Sort moves randomly, so the same move isn't always picked on ties
  children.sort(function (a, b) {
    return 0.5 - Math.random();
  });

  var currMove;
  // Maximum depth exceeded or node is a terminal node (no children)
  if (depth === 0 || children.length === 0) {
    return [null, sum];
  }

  // Find maximum/minimum from list of 'children' (possible moves)
  var maxValue = Number.NEGATIVE_INFINITY;
  var minValue = Number.POSITIVE_INFINITY;
  var bestMove;
  for (var i = 0; i < children.length; i++) {
    currMove = children[i];

    // Note: in our case, the 'children' are simply modified game states
    var currPrettyMove = game.ugly_move(currMove);
    var newSum = evaluateBoard(game, currPrettyMove, sum, color);
    var [childBestMove, childValue] = minimax(
      game,
      depth - 1,
      alpha,
      beta,
      !isMaximizingPlayer,
      newSum,
      color
    );

    game.undo();

    if (isMaximizingPlayer) {
      if (childValue > maxValue) {
        maxValue = childValue;
        bestMove = currPrettyMove;
      }
      if (childValue > alpha) {
        alpha = childValue;
      }
    } else {
      if (childValue < minValue) {
        minValue = childValue;
        bestMove = currPrettyMove;
      }
      if (childValue < beta) {
        beta = childValue;
      }
    }

    // Alpha-beta pruning
    // TODO: get rid of this?
    if (alpha >= beta) {
      break;
    }
  }

  if (isMaximizingPlayer) {
    return [bestMove, maxValue];
  } else {
    return [bestMove, minValue];
  }
}

function checkStatus(color) {
  if (game.in_checkmate()) {
    $('#status').html(`<b>Checkmate!</b> Oops, <b>${color}</b> lost.`);
  } else if (game.insufficient_material()) {
    $('#status').html(`It's a <b>draw!</b> (Insufficient Material)`);
  } else if (game.in_threefold_repetition()) {
    $('#status').html(`It's a <b>draw!</b> (Threefold Repetition)`);
  } else if (game.in_stalemate()) {
    $('#status').html(`It's a <b>draw!</b> (Stalemate)`);
  } else if (game.in_draw()) {
    $('#status').html(`It's a <b>draw!</b> (50-move Rule)`);
  } else if (game.in_check()) {
    $('#status').html(`Oops, <b>${color}</b> is in <b>check!</b>`);
    return false;
  } else {
    $('#status').html(`No check, checkmate, or draw.`);
    return false;
  }
  return true;
}

function updateAdvantage() {
  if (globalSum > 0) {
    $('#advantageColor').text('Black');
    $('#advantageNumber').text(globalSum);
  } else if (globalSum < 0) {
    $('#advantageColor').text('White');
    $('#advantageNumber').text(-globalSum);
  } else {
    $('#advantageColor').text('Neither side');
    $('#advantageNumber').text(globalSum);
  }
  $('#advantageBar').attr({
    'aria-valuenow': `${-globalSum}`,
    style: `width: ${((-globalSum + 2000) / 4000) * 100}%`,
  });
}

/*
 * Calculates the best legal move for the given color.
 */
function getBestMove(game, color, currSum) {
  positionCount = 0;

  if (color === 'b') {
    var depth = parseInt($('#search-depth').find(':selected').text());
  } else {
    var depth = parseInt($('#search-depth-white').find(':selected').text());
  }

  var d = new Date().getTime();
  var [bestMove, bestMoveValue] = minimax(
    game,
    depth,
    Number.NEGATIVE_INFINITY,
    Number.POSITIVE_INFINITY,
    true,
    currSum,
    color
  );
  var d2 = new Date().getTime();
  var moveTime = d2 - d;
  var positionsPerS = (positionCount * 1000) / moveTime;

  $('#position-count').text(positionCount);
  $('#time').text(moveTime / 1000);
  $('#positions-per-s').text(Math.round(positionsPerS));

  return [bestMove, bestMoveValue];
}

/*
 * Makes the best legal move for the given color.
 */
function makeBestMove(color) {
  if (color === 'b') {
    var move = getBestMove(game, color, globalSum)[0];
  } else {
    var move = getBestMove(game, color, -globalSum)[0];
  }

  globalSum = evaluateBoard(game, move, globalSum, 'b');
  updateAdvantage();

  game.move(move);
  board.position(game.fen());

  if (color === 'b') {
    checkStatus('black');

    // Highlight black move
    $board.find('.' + squareClass).removeClass('highlight-black');
    $board.find('.square-' + move.from).addClass('highlight-black');
    squareToHighlight = move.to;
    colorToHighlight = 'black';

    $board
      .find('.square-' + squareToHighlight)
      .addClass('highlight-' + colorToHighlight);
  } else {
    checkStatus('white');

    // Highlight white move
    $board.find('.' + squareClass).removeClass('highlight-white');
    $board.find('.square-' + move.from).addClass('highlight-white');
    squareToHighlight = move.to;
    colorToHighlight = 'white';

    $board
      .find('.square-' + squareToHighlight)
      .addClass('highlight-' + colorToHighlight);
  }
}

/*
 * Plays Computer vs. Computer, starting with a given color.
 */
function compVsComp(color) {
  if (!checkStatus({ w: 'white', b: 'black' }[color])) {
    timer = window.setTimeout(function () {
      makeBestMove(color);
      if (color === 'w') {
        color = 'b';
      } else {
        color = 'w';
      }
      compVsComp(color);
    }, 250);
  }
}

/*
 * Resets the game to its initial state.
 */
function reset() {
  game.reset();
  globalSum = 0;
  $board.find('.' + squareClass).removeClass('highlight-white');
  $board.find('.' + squareClass).removeClass('highlight-black');
  $board.find('.' + squareClass).removeClass('highlight-hint');
  board.position(game.fen());
  $('#advantageColor').text('Neither side');
  $('#advantageNumber').text(globalSum);

  // Kill the Computer vs. Computer callback
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
}

/*
 * Event listeners for various buttons.
 */
//TODO: can get rid of these except for compvscomp, reset
$('#ruyLopezBtn').on('click', function () {
  reset();
  game.load(
    'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 1'
  );
  board.position(game.fen());
  window.setTimeout(function () {
    makeBestMove('b');
  }, 250);
});
$('#italianGameBtn').on('click', function () {
  reset();
  game.load(
    'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 1'
  );
  board.position(game.fen());
  window.setTimeout(function () {
    makeBestMove('b');
  }, 250);
});
$('#sicilianDefenseBtn').on('click', function () {
  reset();
  game.load('rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1');
  board.position(game.fen());
});
$('#startBtn').on('click', function () {
  reset();
});

$('#compVsCompBtn').on('click', function () {
  reset();
  compVsComp('w');
});
$('#resetBtn').on('click', function () {
  reset();
});

var undo_stack = [];

function undo() {
  var move = game.undo();
  undo_stack.push(move);

  // Maintain a maximum stack size
  if (undo_stack.length > STACK_SIZE) {
    undo_stack.shift();
  }
  board.position(game.fen());
}

$('#undoBtn').on('click', function () {
  if (game.history().length >= 2) {
    $board.find('.' + squareClass).removeClass('highlight-white');
    $board.find('.' + squareClass).removeClass('highlight-black');
    $board.find('.' + squareClass).removeClass('highlight-hint');

    // Undo twice: Opponent's latest move, followed by player's latest move
    undo();
    window.setTimeout(function () {
      undo();
      window.setTimeout(function () {
        showHint();
      }, 250);
    }, 250);
  } else {
    alert('Nothing to undo.');
  }
});

function redo() {
  game.move(undo_stack.pop());
  board.position(game.fen());
}

$('#redoBtn').on('click', function () {
  if (undo_stack.length >= 2) {
    // Redo twice: Player's last move, followed by opponent's last move
    redo();
    window.setTimeout(function () {
      redo();
      window.setTimeout(function () {
        showHint();
      }, 250);
    }, 250);
  } else {
    alert('Nothing to redo.');
  }
});

$('#showHint').change(function () {
  window.setTimeout(showHint, 250);
});

function showHint() {
  var showHint = document.getElementById('showHint');
  $board.find('.' + squareClass).removeClass('highlight-hint');

  // Show hint (best move for white)
  if (showHint.checked) {
    var move = getBestMove(game, 'w', -globalSum)[0];

    $board.find('.square-' + move.from).addClass('highlight-hint');
    $board.find('.square-' + move.to).addClass('highlight-hint');
  }
}

/*
 * The remaining code is adapted from chessboard.js examples #5000 through #5005:
 * https://chessboardjs.com/examples#5000
 */
function removeGreySquares() {
  $('#myBoard .square-55d63').css('background', '');
}

function greySquare(square) {
  var $square = $('#myBoard .square-' + square);

  var background = whiteSquareGrey;
  if ($square.hasClass('black-3c85d')) {
    background = blackSquareGrey;
  }

  $square.css('background', background);
}

function onDragStart(source, piece) {
  console.log("onDragStart called with source:", source, "piece:", piece);
  console.log("SQUARES mapping for", source, "is:", game.SQUARES[source]);

  // do not pick up pieces if the game is over
  if (game.game_over()) return false;

  // or if it's not that side's turn
  if (
    (game.turn() === 'w' && piece.search(/^b/) !== -1) ||
    (game.turn() === 'b' && piece.search(/^w/) !== -1)
  ) {
    return false;
  }
}

function onDrop(source, target) {
  console.log("onDrop runs");
  undo_stack = [];
  removeGreySquares();

  // see if the move is legal
  var move = game.move({
    from: source,
    to: target,
    promotion: 'q', // NOTE: always promote to a queen for example simplicity
  });

  // Illegal move
  if (move === null) {
    console.log("illegal move: " + move + " from source: " + source + " with target: " + target);
    return 'snapback';
  }

  //TODO: comment everything below this line in again when ready to troubleshoot engine

  globalSum = evaluateBoard(game, move, globalSum, 'b');
  updateAdvantage();

  // Highlight latest move
  $board.find('.' + squareClass).removeClass('highlight-white');

  $board.find('.square-' + move.from).addClass('highlight-white');
  squareToHighlight = move.to;
  colorToHighlight = 'white';

  $board
    .find('.square-' + squareToHighlight)
    .addClass('highlight-' + colorToHighlight);

  if (!checkStatus('black'));
  {
    // Make the best move for black
    window.setTimeout(function () {
      makeBestMove('b');
      window.setTimeout(function () {
        showHint();
      }, 250);
    }, 250);
  }
}

function onMouseoverSquare(square, piece) {
  // get list of possible moves for this square
  var moves = game.moves({
    square: square,
    verbose: true,
  });

  // exit if there are no moves available for this square
  if (moves.length === 0) return;

  // highlight the square they moused over
  greySquare(square);

  // highlight the possible squares for this piece
  for (var i = 0; i < moves.length; i++) {
    greySquare(moves[i].to);
  }
}

function onMouseoutSquare(square, piece) {
  removeGreySquares();
}

function onSnapEnd() {
  board.position(game.fen());
}
