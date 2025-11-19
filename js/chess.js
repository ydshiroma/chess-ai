/*
 * Copyright (c) 2020, Jeff Hlywa (jhlywa@gmail.com)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 *----------------------------------------------------------------------------*/

var Chess = function (fen) {
  var BLACK = "b";
  var WHITE = "w";

  var EMPTY = -1;

  var PAWN = "p";
  var KNIGHT = "n";
  var ROOK = "r";
  var QUEEN = "q";
  var KING = "k";

  var SYMBOLS = "pnrqkPNRQK";

  var DEFAULT_POSITION = "rnkqnr/pppppp/6/6/PPPPPP/RNKQNR w 0 1";

  // var DEFAULT_POSITION =
  //   'rnkqnr/pppppp/6/6/PPPPPP/RNKQNR w KQkq - 0 1'

  var POSSIBLE_RESULTS = ["1-0", "0-1", "1/2-1/2", "*"];

  var PAWN_OFFSETS = {
    b: [16, 17, 15], // Forward 1 rank, diagonal captures
    w: [-16, -17, -15],
  };

  var PIECE_OFFSETS = {
    n: [-18, -33, -31, -14, 18, 33, 31, 14], // Knight moves
    b: [-17, -15, 17, 15], // Bishop (diagonal)
    r: [-16, 1, 16, -1], // Rook (straight)
    q: [-17, -16, -15, 1, 17, 16, 15, -1], // Queen (all directions)
    k: [-17, -16, -15, 1, 17, 16, 15, -1], // King (all directions, one square)
  };

  var ATTACKS = [
    20, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 20, 0, 0, 20, 0, 0, 0, 0, 0, 24,
    0, 0, 0, 0, 0, 20, 0, 0, 0, 0, 20, 0, 0, 0, 0, 24, 0, 0, 0, 0, 20, 0, 0, 0,
    0, 0, 0, 20, 0, 0, 0, 24, 0, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 20, 0, 0, 24,
    0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 2, 24, 2, 20, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 2, 53, 56, 53, 2, 0, 0, 0, 0, 0, 0, 24, 24, 24, 24, 24, 24,
    56, 0, 56, 24, 24, 24, 24, 24, 24, 0, 0, 0, 0, 0, 0, 2, 53, 56, 53, 2, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 2, 24, 2, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    20, 0, 0, 24, 0, 0, 20, 0, 0, 0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 24, 0, 0, 0,
    20, 0, 0, 0, 0, 0, 0, 20, 0, 0, 0, 0, 24, 0, 0, 0, 0, 20, 0, 0, 0, 0, 20, 0,
    0, 0, 0, 0, 24, 0, 0, 0, 0, 0, 20, 0, 0, 20, 0, 0, 0, 0, 0, 0, 24, 0, 0, 0,
    0, 0, 0, 20,
  ];

  var RAYS = [
    17, 0, 0, 0, 0, 0, 0, 16, 0, 0, 0, 0, 0, 0, 15, 0, 0, 17, 0, 0, 0, 0, 0, 16,
    0, 0, 0, 0, 0, 15, 0, 0, 0, 0, 17, 0, 0, 0, 0, 16, 0, 0, 0, 0, 15, 0, 0, 0,
    0, 0, 0, 17, 0, 0, 0, 16, 0, 0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 0, 16,
    0, 0, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 17, 0, 16, 0, 15, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 17, 16, 15, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 0,
    -1, -1, -1, -1, -1, -1, -1, 0, 0, 0, 0, 0, 0, 0, -15, -16, -17, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, -15, 0, -16, 0, -17, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    -15, 0, 0, -16, 0, 0, -17, 0, 0, 0, 0, 0, 0, 0, 0, -15, 0, 0, 0, -16, 0, 0,
    0, -17, 0, 0, 0, 0, 0, 0, -15, 0, 0, 0, 0, -16, 0, 0, 0, 0, -17, 0, 0, 0, 0,
    -15, 0, 0, 0, 0, 0, -16, 0, 0, 0, 0, 0, -17, 0, 0, -15, 0, 0, 0, 0, 0, 0,
    -16, 0, 0, 0, 0, 0, 0, -17,
  ];

  //TODO: what does this do? was it right to remove the bishop?
  //var SHIFTS = { p: 0, n: 1, r: 2, q: 3, k: 4 }
  var SHIFTS = { p: 0, n: 1, b: 2, r: 3, q: 4, k: 5 };

  var FLAGS = {
    NORMAL: "n",
    CAPTURE: "c",
    BIG_PAWN: "b",
    PROMOTION: "p",
  };

  var BITS = {
    NORMAL: 1,
    CAPTURE: 2,
    BIG_PAWN: 4,
    PROMOTION: 16,
  };

  //changed, then changed again from RANK_1 = 5
  var RANK_1 = 6;
  var RANK_2 = 5;
  var RANK_3 = 4;
  var RANK_4 = 3;
  var RANK_5 = 2;
  var RANK_6 = 1;

  var SQUARES = {
  a6:  16, b6:  17, c6:  18, d6:  19, e6:  20, f6:  21,
  a5:  32, b5:  33, c5:  34, d5:  35, e5:  36, f5:  37,
  a4:  48, b4:  49, c4:  50, d4:  51, e4:  52, f4:  53,
  a3:  64, b3:  65, c3:  66, d3:  67, e3:  68, f3:  69,
  a2:  80, b2:  81, c2:  82, d2:  83, e2:  84, f2:  85,
  a1:  96, b1:  97, c1:  98, d1:  99, e1: 100, f1: 101,
};

  var ROOKS = {
    w: [{ square: SQUARES.a1 }, { square: SQUARES.f1 }],
    b: [{ square: SQUARES.a6 }, { square: SQUARES.f6 }],
  };

  var board = new Array(128);
  var kings = { w: EMPTY, b: EMPTY };
  var turn = WHITE;
  //TODO: something with this
  // w: 1, b: 1
  var half_moves = 0;
  var move_number = 1;
  var history = [];
  var header = {};
  var comments = {};

  /* if the user passes in a fen string, load it, else default to
   * starting position
   */
  if (typeof fen === "undefined") {
    load(DEFAULT_POSITION);
  } else {
    load(fen);
  }

  function clear(keep_headers) {
    if (typeof keep_headers === "undefined") {
      keep_headers = false;
    }

    board = new Array(128);
    kings = { w: EMPTY, b: EMPTY };
    turn = WHITE;
    half_moves = 0;
    move_number = 1;
    history = [];
    if (!keep_headers) header = {};
    comments = {};
    update_setup(generate_fen());
  }

  function prune_comments() {
    var reversed_history = [];
    var current_comments = {};
    var copy_comment = function (fen) {
      if (fen in comments) {
        current_comments[fen] = comments[fen];
      }
    };
    while (history.length > 0) {
      reversed_history.push(undo_move());
    }
    copy_comment(generate_fen());
    while (reversed_history.length > 0) {
      make_move(reversed_history.pop());
      copy_comment(generate_fen());
    }
    comments = current_comments;
  }

  function reset() {
    load(DEFAULT_POSITION);
  }

  //TODO: is this the bad square logic?
  function load(fen, keep_headers) {
    //console.log("load function runs");
    //console.log("Loading FEN:", fen);
    if (typeof keep_headers === "undefined") {
      keep_headers = false;
    }

    var tokens = fen.split(/\s+/);
    var position = tokens[0];
    // a6 = 16 in SQUARES
    var square = 16;

    if (!validate_fen(fen).valid) {
      console.log("fen invalid");
      return false;
    }

    clear(keep_headers);

    for (var i = 0; i < position.length; i++) {
      var piece = position.charAt(i);
      //console.log("Processing char:", piece, "at square index:", square, "which is:", algebraic(square));

      if (piece === "/") {
        // Move to start of next rank
        // Current rank start is: (Math.floor((square - 16) / 16) * 16) + 16
        // Next rank start is that + 16
        square = Math.floor((square - 16) / 16) * 16 + 32;
        //console.log("After slash, square is now:", square, algebraic(square));
        //square += 10  // Changed from 4 - skip to next rank (16-wide rows)
        //console.log("square: " + square);
      } else if (is_digit(piece)) {
        square += parseInt(piece, 10);
        //console.log("After digit, square is now:", square, algebraic(square));
        //console.log("square: " + square);
      } else {
        var color = piece < "a" ? WHITE : BLACK;
        //console.log("Placing", piece, "at index", square, "which is", algebraic(square));
        put({ type: piece.toLowerCase(), color: color }, algebraic(square));
        square++;
        //console.log("square: " + square);
      }
    }

    turn = tokens[1];

    half_moves = parseInt(tokens[2], 10);
    move_number = parseInt(tokens[3], 10);

    update_setup(generate_fen());

    return true;
  }

  /* TODO: this function is pretty much crap - it validates structure but
   * completely ignores content (e.g. doesn't verify that each side has a king)
   * ... we should rewrite this, and ditch the silly error_number field while
   * we're at it
   */
  function validate_fen(fen) {
    //console.log("validate_fen runs")

    //TODO: fix validation and get rid of this line (returns valid no matter what is happening)
    //return { valid: true, error_number: 0, error: null }
    var errors = {
      0: "No errors.",
      1: "FEN string must contain six space-delimited fields.",
      2: "6th field (move number) must be a positive integer.",
      3: "5th field (half move counter) must be a non-negative integer.",
      4: "4th field (en-passant square) is invalid.",
      6: "2nd field (side to move) is invalid.",
      7: "1st field (piece positions) does not contain 8 '/'-delimited rows.",
      8: "1st field (piece positions) is invalid [consecutive numbers].",
      9: "1st field (piece positions) is invalid [invalid piece].",
      10: "1st field (piece positions) is invalid [row too large].",
      11: "Illegal en-passant square",
    };

    /* 1st criterion: 4 space-seperated fields? */
    // remove en passant and castling fields
    var tokens = fen.split(/\s+/);
    if (tokens.length !== 4) {
      console.log("error 1");
      return { valid: false, error_number: 1, error: errors[1] };
    }

    /* 2nd criterion: move number field is a integer value > 0? */
    if (isNaN(tokens[3]) || parseInt(tokens[3], 10) <= 0) {
      console.log("error 2");
      return { valid: false, error_number: 2, error: errors[2] };
    }

    /* 3rd criterion: half move counter is an integer >= 0? */
    if (isNaN(tokens[2]) || parseInt(tokens[2], 10) < 0) {
      console.log("error 3");
      return { valid: false, error_number: 3, error: errors[3] };
    }

    /* 4th criterion: 4th field is a valid e.p.-string? */
    // if (!/^(-|[abcdef][36])$/.test(tokens[3])) {
    //   console.log("error 4");
    //   return { valid: false, error_number: 4, error: errors[4] }
    // }

    /* 6th criterion: 2nd field is "w" (white) or "b" (black)? */
    if (!/^(w|b)$/.test(tokens[1])) {
      console.log("error 6");
      return { valid: false, error_number: 6, error: errors[6] };
    }

    /* 7th criterion: 1st field contains 8 rows? */
    var rows = tokens[0].split("/");
    if (rows.length !== 6) {
      console.log("error 7");
      return { valid: false, error_number: 7, error: errors[7] };
    }

    /* 8th criterion: every row is valid? */
    for (var i = 0; i < rows.length; i++) {
      /* check for right sum of fields AND not two numbers in succession */
      var sum_fields = 0;
      var previous_was_number = false;

      for (var k = 0; k < rows[i].length; k++) {
        if (!isNaN(rows[i][k])) {
          if (previous_was_number) {
            console.log("error 8");
            return { valid: false, error_number: 8, error: errors[8] };
          }
          sum_fields += parseInt(rows[i][k], 10);
          previous_was_number = true;
        } else {
          if (!/^[prnbqkPRNBQK]$/.test(rows[i][k])) {
            console.log("error 9");
            return { valid: false, error_number: 9, error: errors[9] };
          }
          sum_fields += 1;
          previous_was_number = false;
        }
      }
      if (sum_fields !== 6) {
        console.log("error 10");
        return { valid: false, error_number: 10, error: errors[10] };
      }
    }

    if (
      (tokens[3][1] == "3" && tokens[1] == "w") ||
      (tokens[3][1] == "6" && tokens[1] == "b")
    ) {
      console.log("error 11");
      return { valid: false, error_number: 11, error: errors[11] };
    }

    /* everything's okay! */
    return { valid: true, error_number: 0, error: errors[0] };
  }

  function generate_fen() {
    //console.log("generate_fen runs");
    var empty = 0;
    var fen = "";
    //console.log("game: " + JSON.stringify(game))
    //console.log("squares: " + JSON.stringify(SQUARES))

    for (var i = SQUARES.a6; i <= SQUARES.f1; i++) {
      console.log(
        "generate_fen checking square",
        i,
        algebraic(i),
        "piece:",
        board[i]
      );
      //console.log("i: " + i)
      //console.log("GENERATE_FEN i: " + i + ", board: " + JSON.stringify(board))
      //console.log("board: " + JSON.stringify(board))
      //console.log("board[i]: " + JSON.stringify(board[i]))
      if (board[i] == null) {
        empty++;
      } else {
        //console.log("board: " + JSON.stringify(board))
        //console.log("board length: " + board.length)
        //console.log("i: " + i + ", board[i]: " + JSON.stringify(board[i]))
        if (empty > 0) {
          fen += empty;
          empty = 0;
        }
        var color = board[i].color;
        //console.log("color: " + color)
        var piece = board[i].type;
        //console.log("piece: " + piece)

        fen += color === WHITE ? piece.toUpperCase() : piece.toLowerCase();
      }

      // Check if we've finished the current rank (at f-file)
      if (file(i) === 5) {
        // f-file is index 5
        if (empty > 0) {
          fen += empty;
        }

        if (i !== SQUARES.f1) {
          fen += "/";
        }

        empty = 0;
        i += 10; // Skip to next rank (16-wide rows, 6 squares used, so skip 10)
      }
    }
    fen_final = [fen, turn, half_moves, move_number].join(" ");
    //console.log("fen produced by generate_fen: " + fen_final)
    return fen_final;
  }

  function set_header(args) {
    for (var i = 0; i < args.length; i += 2) {
      if (typeof args[i] === "string" && typeof args[i + 1] === "string") {
        header[args[i]] = args[i + 1];
      }
    }
    return header;
  }

  /* called when the initial board setup is changed with put() or remove().
   * modifies the SetUp and FEN properties of the header object.  if the FEN is
   * equal to the default position, the SetUp and FEN are deleted
   * the setup is only updated if history.length is zero, ie moves haven't been
   * made.
   */
  function update_setup(fen) {
    //console.log("update_setup runs");
    if (history.length > 0) return;

    if (fen !== DEFAULT_POSITION) {
      header["SetUp"] = "1";
      header["FEN"] = fen;
    } else {
      delete header["SetUp"];
      delete header["FEN"];
    }
  }

  function get(square) {
    var piece = board[SQUARES[square]];
    return piece ? { type: piece.type, color: piece.color } : null;
  }

  function put(piece, square) {
    //console.log("put function runs")
    /* check for valid piece object */
    if (!("type" in piece && "color" in piece)) {
      console.log("check for invalid piece object fails");
      return false;
    }

    /* check for piece */
    if (SYMBOLS.indexOf(piece.type.toLowerCase()) === -1) {
      console.log("check for piece fails");
      return false;
    }

    /* check for valid square */
    if (!(square in SQUARES)) {
      console.log("check for valid square fails");
      return false;
    }

    var sq = SQUARES[square];

    /* don't let the user place more than one king */
    if (
      piece.type == KING &&
      !(kings[piece.color] == EMPTY || kings[piece.color] == sq)
    ) {
      return false;
    }

    board[sq] = { type: piece.type, color: piece.color };
    if (piece.type === KING) {
      kings[piece.color] = sq;
    }

    update_setup(generate_fen());
    //console.log("fen (from 'put'): " + fen)

    return true;
  }

  function remove(square) {
    var piece = get(square);
    board[SQUARES[square]] = null;
    if (piece && piece.type === KING) {
      kings[piece.color] = EMPTY;
    }

    update_setup(generate_fen());

    return piece;
  }

  function build_move(board, from, to, flags, promotion) {
    var move = {
      color: turn,
      from: from,
      to: to,
      flags: flags,
      piece: board[from].type,
    };

    if (promotion) {
      move.flags |= BITS.PROMOTION;
      move.promotion = promotion;
    }

    if (board[to]) {
      move.captured = board[to].type;
    }
    return move;
  }

  function generate_moves(options) {
    //console.log("generate moves runs")
    function add_move(board, moves, from, to, flags) {
      /* if pawn promotion */
      if (
        board[from].type === PAWN &&
        (rank(to) === RANK_6 || rank(to) === RANK_1)
      ) {
        var pieces = [QUEEN, ROOK, KNIGHT];
        for (var i = 0, len = pieces.length; i < len; i++) {
          moves.push(build_move(board, from, to, flags, pieces[i]));
        }
      } else {
        moves.push(build_move(board, from, to, flags));
      }
    }

    var moves = [];
    var us = turn;
    var them = swap_color(us);
    var second_rank = { b: RANK_5, w: RANK_2 };

    var first_sq = SQUARES.a6;
    var last_sq = SQUARES.f1;
    var single_square = false;

    /* do we want legal moves? */
    var legal =
      typeof options !== "undefined" && "legal" in options
        ? options.legal
        : true;

    /* are we generating moves for a single square? */
    if (typeof options !== "undefined" && "square" in options) {
      //console.log("Generating moves for specific square:", options.square);
      //console.log("SQUARES[options.square] =", SQUARES[options.square]);
      //console.log("Check result:", options.square in SQUARES);

      if (options.square in SQUARES) {
        first_sq = last_sq = SQUARES[options.square];
        single_square = true;
        //console.log("Set first_sq and last_sq to:", first_sq);
      } else {
        /* invalid square */
        //console.log("Square not found in SQUARES, returning empty array");
        return [];
      }
    }

    for (var i = first_sq; i <= last_sq; i++) {
      /* did we run off the end of the board */
      if (i & 0x88) {
        //Changed from 3 - for 16-wide rows: (16 - 6 - 1) = 9
        i += 9;
        continue;
      }

      // Additional check: skip if file > 5 (positions 6-15 in each rank)
      if (file(i) > 5) {
        // changed from 10
        i += 9; // Skip to next rank
        continue;
      }

      var piece = board[i];
      if (piece == null || piece.color !== us) {
        continue;
      }

      if (piece.type === PAWN) {
        //console.log("Generating pawn moves for square", i, algebraic(i));
        /* single square, non-capturing */
        var square = i + PAWN_OFFSETS[us][0];
        //console.log("Checking single square move to", square, algebraic(square), "0x88 check:", square & 0x88);
        if (board[square] == null) {
          //console.log("Single square is empty, adding move");
          add_move(board, moves, i, square, BITS.NORMAL);
        }

        /* pawn captures */
        for (j = 1; j < 3; j++) {
          // Changed from j=2 since you removed double-move
          var square = i + PAWN_OFFSETS[us][j];
          if (square & 0x88) continue;
          if (file(square) > 5 || rank(square) < 1 || rank(square) > 6)
            continue;

          if (board[square] != null && board[square].color === them) {
            add_move(board, moves, i, square, BITS.CAPTURE);
          }
        }
      } else {
        for (var j = 0, len = PIECE_OFFSETS[piece.type].length; j < len; j++) {
          var offset = PIECE_OFFSETS[piece.type][j];
          var square = i;

          while (true) {
            square += offset;
            if (square & 0x88) break;

            // Add this check for 6x6 board
            // if (file(square) > 5) break;
            if (file(square) > 5 || rank(square) < 1 || rank(square) > 6) break;

            if (board[square] == null) {
              add_move(board, moves, i, square, BITS.NORMAL);
            } else {
              if (board[square].color === us) break;
              add_move(board, moves, i, square, BITS.CAPTURE);
              break;
            }

            /* break, if knight or king */
            if (piece.type === "n" || piece.type === "k") break;
          }
        }
      }
    }

    /* return all pseudo-legal moves (this includes moves that allow the king
     * to be captured)
     */
    if (!legal) {
      //console.log("moves (!legal): " + moves)
      return moves;
    }

    /* filter out illegal moves */
    var legal_moves = [];
    for (var i = 0, len = moves.length; i < len; i++) {
      make_move(moves[i]);
      if (!king_attacked(us)) {
        legal_moves.push(moves[i]);
      }
      undo_move();
    }

    //console.log("legal_moves: " + JSON.stringify(legal_moves))
    return legal_moves;
  }

  /* convert a move from 0x88 coordinates to Standard Algebraic Notation
   * (SAN)
   *
   * @param {boolean} sloppy Use the sloppy SAN generator to work around over
   * disambiguation bugs in Fritz and Chessbase.  See below:
   *
   * r1bqkbnr/ppp2ppp/2n5/1B1pP3/4P3/8/PPPP2PP/RNBQK1NR b KQkq - 2 4
   * 4. ... Nge7 is overly disambiguated because the knight on c6 is pinned
   * 4. ... Ne7 is technically the valid SAN
   */
  function move_to_san(move, sloppy) {
    var output = "";

    var disambiguator = get_disambiguator(move, sloppy);

    if (move.piece !== PAWN) {
      output += move.piece.toUpperCase() + disambiguator;
    }

    if (move.flags & BITS.CAPTURE) {
      if (move.piece === PAWN) {
        output += algebraic(move.from)[0];
      }
      output += "x";
    }

    output += algebraic(move.to);

    if (move.flags & BITS.PROMOTION) {
      output += "=" + move.promotion.toUpperCase();
    }

    make_move(move);
    if (in_check()) {
      if (in_checkmate()) {
        output += "#";
      } else {
        output += "+";
      }
    }
    undo_move();

    return output;
  }

  // parses all of the decorators out of a SAN string
  function stripped_san(move) {
    return move.replace(/=/, "").replace(/[+#]?[?!]*$/, "");
  }

  function attacked(color, square) {
    for (var i = SQUARES.a6; i <= SQUARES.f1; i++) {
      // Changed to 6x6
      /* did we run off the end of the board */
      if (i & 0x88) {
        i += 9; // Changed for 16-wide rows
        continue;
      }

      // Add the file check for 6x6 board
      if (file(i) > 5) {
        i += 9;
        continue;
      }

      /* if empty square or wrong color */
      if (board[i] == null || board[i].color !== color) continue;

      var piece = board[i];
      var difference = i - square;
      var index = difference + 119;

      if (ATTACKS[index] & (1 << SHIFTS[piece.type])) {
        if (piece.type === PAWN) {
          if (difference > 0) {
            if (piece.color === WHITE) return true;
          } else {
            if (piece.color === BLACK) return true;
          }
          continue;
        }

        /* if the piece is a knight or a king */
        if (piece.type === "n" || piece.type === "k") return true;

        var offset = RAYS[index];
        var j = i + offset;

        var blocked = false;
        while (j !== square) {
          if (board[j] != null) {
            blocked = true;
            break;
          }
          j += offset;
        }

        if (!blocked) return true;
      }
    }

    return false;
  }
  // function attacked(color, square) {
  //   for (var i = SQUARES.a6; i <= SQUARES.f1; i++) {
  //     /* did we run off the end of the board */
  //     if (i & 0x88) {
  //       i += 3
  //       continue
  //     }

  //     /* if empty square or wrong color */
  //     if (board[i] == null || board[i].color !== color) continue

  //     var piece = board[i]
  //     var difference = i - square
  //     var index = difference + 119

  //     if (ATTACKS[index] & (1 << SHIFTS[piece.type])) {
  //       if (piece.type === PAWN) {
  //         if (difference > 0) {
  //           if (piece.color === WHITE) return true
  //         } else {
  //           if (piece.color === BLACK) return true
  //         }
  //         continue
  //       }

  //       /* if the piece is a knight or a king */
  //       if (piece.type === 'n' || piece.type === 'k') return true

  //       var offset = RAYS[index]
  //       var j = i + offset

  //       var blocked = false
  //       while (j !== square) {
  //         if (board[j] != null) {
  //           blocked = true
  //           break
  //         }
  //         j += offset
  //       }

  //       if (!blocked) return true
  //     }
  //   }

  //   return false
  // }

  function king_attacked(color) {
    return attacked(swap_color(color), kings[color]);
  }

  function in_check() {
    return king_attacked(turn);
  }

  function in_checkmate() {
    return in_check() && generate_moves().length === 0;
  }

  function in_stalemate() {
    return !in_check() && generate_moves().length === 0;
  }

  function insufficient_material() {
    var pieces = {};
    var num_pieces = 0;
    var sq_color = 0;

    for (var i = SQUARES.a6; i <= SQUARES.f1; i++) {
      sq_color = (sq_color + 1) % 2;
      if (i & 0x88) {
        i += 3;
        continue;
      }

      var piece = board[i];
      if (piece) {
        pieces[piece.type] = piece.type in pieces ? pieces[piece.type] + 1 : 1;
        num_pieces++;
      }
    }

    /* k vs. k */
    if (num_pieces === 2) {
      return true;
    } else if (
      /* k vs. kn .... or .... k vs. kb */
      num_pieces === 3 &&
      pieces[KNIGHT] === 1
    ) {
      return true;
    }

    return false;
  }

  function in_threefold_repetition() {
    //TODO: bring this back when it's clear it's not the bug
    return false;
    /* TODO: while this function is fine for casual use, a better
     * implementation would use a Zobrist key (instead of FEN). the
     * Zobrist key would be maintained in the make_move/undo_move functions,
     * avoiding the costly that we do below.
     */
    var moves = [];
    var positions = {};
    var repetition = false;

    while (true) {
      var move = undo_move();
      if (!move) break;
      moves.push(move);
    }

    while (true) {
      /* remove the last two fields in the FEN string, they're not needed
       * when checking for draw by rep */
      //TODO: update to accommodate changes to FEN?
      var fen = generate_fen().split(" ").slice(0, 4).join(" ");

      /* has the position occurred three or move times */
      positions[fen] = fen in positions ? positions[fen] + 1 : 1;
      if (positions[fen] >= 3) {
        repetition = true;
      }

      if (!moves.length) {
        break;
      }
      make_move(moves.pop());
    }

    return repetition;
  }

  function push(move) {
    history.push({
      move: move,
      kings: { b: kings.b, w: kings.w },
      turn: turn,
      half_moves: half_moves,
      move_number: move_number,
    });
  }

  function make_move(move) {
    var us = turn;
    var them = swap_color(us);
    push(move);

    board[move.to] = board[move.from];
    board[move.from] = null;

    /* if pawn promotion, replace with new piece */
    if (move.flags & BITS.PROMOTION) {
      board[move.to] = { type: move.promotion, color: us };
    }

    /* if we moved the king */
    if (board[move.to].type === KING) {
      kings[board[move.to].color] = move.to;
    }

    /* reset the 50 move counter if a pawn is moved or a piece is captured */
    if (move.piece === PAWN) {
      half_moves = 0;
    } else if (move.flags & BITS.CAPTURE) {
      half_moves = 0;
    } else {
      half_moves++;
    }

    if (turn === BLACK) {
      move_number++;
    }
    turn = swap_color(turn);
  }

  function undo_move() {
    var old = history.pop();
    if (old == null) {
      return null;
    }

    var move = old.move;
    kings = old.kings;
    turn = old.turn;
    half_moves = old.half_moves;
    move_number = old.move_number;

    var us = turn;
    var them = swap_color(turn);

    board[move.from] = board[move.to];
    board[move.from].type = move.piece; // to undo any promotions
    board[move.to] = null;

    if (move.flags & BITS.CAPTURE) {
      board[move.to] = { type: move.captured, color: them };
    }

    return move;
  }

  /* this function is used to uniquely identify ambiguous moves */
  function get_disambiguator(move, sloppy) {
    var moves = generate_moves({ legal: !sloppy });

    var from = move.from;
    var to = move.to;
    var piece = move.piece;

    var ambiguities = 0;
    var same_rank = 0;
    var same_file = 0;

    for (var i = 0, len = moves.length; i < len; i++) {
      var ambig_from = moves[i].from;
      var ambig_to = moves[i].to;
      var ambig_piece = moves[i].piece;

      /* if a move of the same piece type ends on the same to square, we'll
       * need to add a disambiguator to the algebraic notation
       */
      if (piece === ambig_piece && from !== ambig_from && to === ambig_to) {
        ambiguities++;

        if (rank(from) === rank(ambig_from)) {
          same_rank++;
        }

        if (file(from) === file(ambig_from)) {
          same_file++;
        }
      }
    }

    if (ambiguities > 0) {
      /* if there exists a similar moving piece on the same rank and file as
       * the move in question, use the square as the disambiguator
       */
      if (same_rank > 0 && same_file > 0) {
        return algebraic(from);
      } else if (same_file > 0) {
        /* if the moving piece rests on the same file, use the rank symbol as the
         * disambiguator
         */
        return algebraic(from).charAt(1);
      } else {
        /* else use the file symbol */
        return algebraic(from).charAt(0);
      }
    }

    return "";
  }

  //TODO: did I update this correctly?
  function ascii() {
    //console.log("ascii runs");
    var s = "   +------------------------+\n";
    for (var i = SQUARES.a6; i <= SQUARES.f1; i++) {
      /* display the rank */
      if (file(i) === 0) {
        s += " " + "654321"[rank(i)] + " |";
      }

      /* empty piece */
      if (board[i] == null) {
        s += " . ";
      } else {
        var piece = board[i].type;
        var color = board[i].color;
        var symbol =
          color === WHITE ? piece.toUpperCase() : piece.toLowerCase();
        s += " " + symbol + " ";
      }

      if ((i + 1) & 0x88) {
        s += "|\n";
        i += 3;
      }
    }
    s += "   +------------------------+\n";
    s += "     a  b  c  d  e  f\n";

    return s;
  }

  // convert a move from Standard Algebraic Notation (SAN) to 0x88 coordinates
  function move_from_san(move, sloppy) {
    // strip off any move decorations: e.g Nf3+?!
    var clean_move = stripped_san(move);

    // if we're using the sloppy parser run a regex to grab piece, to, and from
    // this should parse invalid SAN like: Pe2-e4, Rc1c4, Qf3xf7
    if (sloppy) {
      var matches = clean_move.match(
        /([pnrqkPNRQK])?([a-f][1-6])x?-?([a-f][1-6])([qrnQRN])?/
      );
      if (matches) {
        var piece = matches[1];
        var from = matches[2];
        var to = matches[3];
        var promotion = matches[4];
      }
    }

    var moves = generate_moves();
    for (var i = 0, len = moves.length; i < len; i++) {
      // try the strict parser first, then the sloppy parser if requested
      // by the user
      if (
        clean_move === stripped_san(move_to_san(moves[i])) ||
        (sloppy && clean_move === stripped_san(move_to_san(moves[i], true)))
      ) {
        return moves[i];
      } else {
        if (
          matches &&
          (!piece || piece.toLowerCase() == moves[i].piece) &&
          SQUARES[from] == moves[i].from &&
          SQUARES[to] == moves[i].to &&
          (!promotion || promotion.toLowerCase() == moves[i].promotion)
        ) {
          return moves[i];
        }
      }
    }

    return null;
  }

  /*****************************************************************************
   * UTILITY FUNCTIONS
   ****************************************************************************/
  // TODO: is there a problem with these?
  function rank(i) {
    return i >> 4;
  }

  function file(i) {
    return i & 15;
  }

  function algebraic(i) {
    var f = file(i),
      r = rank(i);
    // r: 1=rank6, 2=rank5, 3=rank4, 4=rank3, 5=rank2, 6=rank1
    return "abcdef".substring(f, f + 1) + "X654321".substring(r, r + 1); // Added 'X' at index 0
  }

  function swap_color(c) {
    return c === WHITE ? BLACK : WHITE;
  }

  function is_digit(c) {
    return "0123456789".indexOf(c) !== -1;
  }

  /* pretty = external move object */
  function make_pretty(ugly_move) {
    var move = clone(ugly_move);
    move.san = move_to_san(move, false);
    move.to = algebraic(move.to);
    move.from = algebraic(move.from);

    var flags = "";

    for (var flag in BITS) {
      if (BITS[flag] & move.flags) {
        flags += FLAGS[flag];
      }
    }
    move.flags = flags;

    return move;
  }

  function clone(obj) {
    var dupe = obj instanceof Array ? [] : {};

    for (var property in obj) {
      if (typeof property === "object") {
        dupe[property] = clone(obj[property]);
      } else {
        dupe[property] = obj[property];
      }
    }

    return dupe;
  }

  function trim(str) {
    return str.replace(/^\s+|\s+$/g, "");
  }

  /*****************************************************************************
   * DEBUGGING UTILITIES
   ****************************************************************************/
  //TODO: could be problematic logic here, but this function doesn't seem to be running
  function perft(depth) {
    //console.log("perft runs");
    var moves = generate_moves({ legal: false });
    var nodes = 0;
    var color = turn;

    for (var i = 0, len = moves.length; i < len; i++) {
      make_move(moves[i]);
      if (!king_attacked(color)) {
        if (depth - 1 > 0) {
          var child_nodes = perft(depth - 1);
          nodes += child_nodes;
        } else {
          nodes++;
        }
      }
      undo_move();
    }

    return nodes;
  }

  return {
    /***************************************************************************
     * PUBLIC CONSTANTS (is there a better way to do this?)
     **************************************************************************/
    WHITE: WHITE,
    BLACK: BLACK,
    PAWN: PAWN,
    KNIGHT: KNIGHT,
    ROOK: ROOK,
    QUEEN: QUEEN,
    KING: KING,
    SQUARES: SQUARES,
    FLAGS: FLAGS,

    /***************************************************************************
     * PUBLIC API
     **************************************************************************/
    load: function (fen) {
      return load(fen);
    },

    reset: function () {
      return reset();
    },

    moves: function (options) {
      /* The internal representation of a chess move is in 0x88 format, and
       * not meant to be human-readable.  The code below converts the 0x88
       * square coordinates to algebraic coordinates.  It also prunes an
       * unnecessary move keys resulting from a verbose call.
       */

      var ugly_moves = generate_moves(options);
      var moves = [];

      for (var i = 0, len = ugly_moves.length; i < len; i++) {
        /* does the user want a full move object (most likely not), or just
         * SAN
         */
        if (
          typeof options !== "undefined" &&
          "verbose" in options &&
          options.verbose
        ) {
          moves.push(make_pretty(ugly_moves[i]));
        } else {
          moves.push(move_to_san(ugly_moves[i], false));
        }
      }

      return moves;
    },

    ugly_moves: function (options) {
      var ugly_moves = generate_moves(options);
      return ugly_moves;
    },

    in_check: function () {
      return in_check();
    },

    in_checkmate: function () {
      return in_checkmate();
    },

    in_stalemate: function () {
      return in_stalemate();
    },

    in_draw: function () {
      return (
        half_moves >= 100 ||
        in_stalemate() ||
        insufficient_material() ||
        in_threefold_repetition()
      );
    },

    insufficient_material: function () {
      return insufficient_material();
    },

    in_threefold_repetition: function () {
      return in_threefold_repetition();
    },

    game_over: function () {
      return (
        half_moves >= 100 ||
        in_checkmate() ||
        in_stalemate() ||
        insufficient_material() ||
        in_threefold_repetition()
      );
    },

    validate_fen: function (fen) {
      return validate_fen(fen);
    },

    fen: function () {
      return generate_fen();
    },

    //TODO: problem is here?
    // initially i += 8
    // tried with 3, 4, 6
    board: function () {
      //console.log("board function runs");
      var output = [],
        row = [];

      for (var i = SQUARES.a6; i <= SQUARES.f1; i++) {
        if (board[i] == null) {
          row.push(null);
        } else {
          row.push({ type: board[i].type, color: board[i].color });
        }
        if ((i + 1) & 0x88) {
          output.push(row);
          row = [];
          // initially: i += 6
          i += 3; // Changed from 6
        }
      }

      return output;
    },

    pgn: function (options) {
      /* using the specification from http://www.chessclub.com/help/PGN-spec
       * example for html usage: .pgn({ max_width: 72, newline_char: "<br />" })
       */
      var newline =
        typeof options === "object" && typeof options.newline_char === "string"
          ? options.newline_char
          : "\n";
      var max_width =
        typeof options === "object" && typeof options.max_width === "number"
          ? options.max_width
          : 0;
      var result = [];
      var header_exists = false;

      /* add the PGN header headerrmation */
      for (var i in header) {
        /* TODO: order of enumerated properties in header object is not
         * guaranteed, see ECMA-262 spec (section 12.6.4)
         */
        result.push("[" + i + ' "' + header[i] + '"]' + newline);
        header_exists = true;
      }

      if (header_exists && history.length) {
        result.push(newline);
      }

      var append_comment = function (move_string) {
        var comment = comments[generate_fen()];
        if (typeof comment !== "undefined") {
          var delimiter = move_string.length > 0 ? " " : "";
          move_string = `${move_string}${delimiter}{${comment}}`;
        }
        return move_string;
      };

      /* pop all of history onto reversed_history */
      var reversed_history = [];
      while (history.length > 0) {
        reversed_history.push(undo_move());
      }

      var moves = [];
      var move_string = "";

      /* special case of a commented starting position with no moves */
      if (reversed_history.length === 0) {
        moves.push(append_comment(""));
      }

      /* build the list of moves.  a move_string looks like: "3. e3 e6" */
      while (reversed_history.length > 0) {
        move_string = append_comment(move_string);
        var move = reversed_history.pop();

        /* if the position started with black to move, start PGN with 1. ... */
        if (!history.length && move.color === "b") {
          move_string = move_number + ". ...";
        } else if (move.color === "w") {
          /* store the previous generated move_string if we have one */
          if (move_string.length) {
            moves.push(move_string);
          }
          move_string = move_number + ".";
        }

        move_string = move_string + " " + move_to_san(move, false);
        make_move(move);
      }

      /* are there any other leftover moves? */
      if (move_string.length) {
        moves.push(append_comment(move_string));
      }

      /* is there a result? */
      if (typeof header.Result !== "undefined") {
        moves.push(header.Result);
      }

      /* history should be back to what it was before we started generating PGN,
       * so join together moves
       */
      if (max_width === 0) {
        return result.join("") + moves.join(" ");
      }

      var strip = function () {
        if (result.length > 0 && result[result.length - 1] === " ") {
          result.pop();
          return true;
        }
        return false;
      };

      /* NB: this does not preserve comment whitespace. */
      var wrap_comment = function (width, move) {
        for (var token of move.split(" ")) {
          if (!token) {
            continue;
          }
          if (width + token.length > max_width) {
            while (strip()) {
              width--;
            }
            result.push(newline);
            width = 0;
          }
          result.push(token);
          width += token.length;
          result.push(" ");
          width++;
        }
        if (strip()) {
          width--;
        }
        return width;
      };

      /* wrap the PGN output at max_width */
      var current_width = 0;
      for (var i = 0; i < moves.length; i++) {
        if (current_width + moves[i].length > max_width) {
          if (moves[i].includes("{")) {
            current_width = wrap_comment(current_width, moves[i]);
            continue;
          }
        }
        /* if the current move will push past max_width */
        if (current_width + moves[i].length > max_width && i !== 0) {
          /* don't end the line with whitespace */
          if (result[result.length - 1] === " ") {
            result.pop();
          }

          result.push(newline);
          current_width = 0;
        } else if (i !== 0) {
          result.push(" ");
          current_width++;
        }
        result.push(moves[i]);
        current_width += moves[i].length;
      }

      return result.join("");
    },

    load_pgn: function (pgn, options) {
      // allow the user to specify the sloppy move parser to work around over
      // disambiguation bugs in Fritz and Chessbase
      var sloppy =
        typeof options !== "undefined" && "sloppy" in options
          ? options.sloppy
          : false;

      function mask(str) {
        return str.replace(/\\/g, "\\");
      }

      function has_keys(object) {
        for (var key in object) {
          return true;
        }
        return false;
      }

      function parse_pgn_header(header, options) {
        var newline_char =
          typeof options === "object" &&
          typeof options.newline_char === "string"
            ? options.newline_char
            : "\r?\n";
        var header_obj = {};
        var headers = header.split(new RegExp(mask(newline_char)));
        var key = "";
        var value = "";

        for (var i = 0; i < headers.length; i++) {
          key = headers[i].replace(/^\[([A-Z][A-Za-z]*)\s.*\]$/, "$1");
          value = headers[i].replace(/^\[[A-Za-z]+\s"(.*)"\ *\]$/, "$1");
          if (trim(key).length > 0) {
            header_obj[key] = value;
          }
        }

        return header_obj;
      }

      var newline_char =
        typeof options === "object" && typeof options.newline_char === "string"
          ? options.newline_char
          : "\r?\n";

      // RegExp to split header. Takes advantage of the fact that header and movetext
      // will always have a blank line between them (ie, two newline_char's).
      // With default newline_char, will equal: /^(\[((?:\r?\n)|.)*\])(?:\r?\n){2}/
      var header_regex = new RegExp(
        "^(\\[((?:" +
          mask(newline_char) +
          ")|.)*\\])" +
          "(?:" +
          mask(newline_char) +
          "){2}"
      );

      // If no header given, begin with moves.
      var header_string = header_regex.test(pgn)
        ? header_regex.exec(pgn)[1]
        : "";

      // Put the board in the starting position
      reset();

      /* parse PGN header */
      var headers = parse_pgn_header(header_string, options);
      for (var key in headers) {
        set_header([key, headers[key]]);
      }

      /* load the starting position indicated by [Setup '1'] and
       * [FEN position] */
      if (headers["SetUp"] === "1") {
        if (!("FEN" in headers && load(headers["FEN"], true))) {
          // second argument to load: don't clear the headers
          return false;
        }
      }

      /* NB: the regexes below that delete move numbers, recursive
       * annotations, and numeric annotation glyphs may also match
       * text in comments. To prevent this, we transform comments
       * by hex-encoding them in place and decoding them again after
       * the other tokens have been deleted.
       *
       * While the spec states that PGN files should be ASCII encoded,
       * we use {en,de}codeURIComponent here to support arbitrary UTF8
       * as a convenience for modern users */

      var to_hex = function (string) {
        return Array.from(string)
          .map(function (c) {
            /* encodeURI doesn't transform most ASCII characters,
             * so we handle these ourselves */
            return c.charCodeAt(0) < 72
              ? c.charCodeAt(0).toString(16)
              : encodeURIComponent(c).replace(/\%/g, "").toLowerCase();
          })
          .join("");
      };

      var from_hex = function (string) {
        return string.length == 0
          ? ""
          : decodeURIComponent("%" + string.match(/.{1,2}/g).join("%"));
      };

      var encode_comment = function (string) {
        string = string.replace(new RegExp(mask(newline_char), "g"), " ");
        return `{${to_hex(string.slice(1, string.length - 1))}}`;
      };

      var decode_comment = function (string) {
        if (string.startsWith("{") && string.endsWith("}")) {
          return from_hex(string.slice(1, string.length - 1));
        }
      };

      /* delete header to get the moves */
      var ms = pgn
        .replace(header_string, "")
        .replace(
          /* encode comments so they don't get deleted below */
          new RegExp(`(\{[^}]*\})+?|;([^${mask(newline_char)}]*)`, "g"),
          function (match, bracket, semicolon) {
            return bracket !== undefined
              ? encode_comment(bracket)
              : " " + encode_comment(`{${semicolon.slice(1)}}`);
          }
        )
        .replace(new RegExp(mask(newline_char), "g"), " ");

      /* delete recursive annotation variations */
      var rav_regex = /(\([^\(\)]+\))+?/g;
      while (rav_regex.test(ms)) {
        ms = ms.replace(rav_regex, "");
      }

      /* delete move numbers */
      ms = ms.replace(/\d+\.(\.\.)?/g, "");

      /* delete ... indicating black to move */
      ms = ms.replace(/\.\.\./g, "");

      /* delete numeric annotation glyphs */
      ms = ms.replace(/\$\d+/g, "");

      /* trim and get array of moves */
      var moves = trim(ms).split(new RegExp(/\s+/));

      /* delete empty entries */
      moves = moves.join(",").replace(/,,+/g, ",").split(",");
      var move = "";

      for (var half_move = 0; half_move < moves.length - 1; half_move++) {
        var comment = decode_comment(moves[half_move]);
        if (comment !== undefined) {
          comments[generate_fen()] = comment;
          continue;
        }
        move = move_from_san(moves[half_move], sloppy);

        /* move not possible! (don't clear the board to examine to show the
         * latest valid position)
         */
        if (move == null) {
          return false;
        } else {
          make_move(move);
        }
      }

      comment = decode_comment(moves[moves.length - 1]);
      if (comment !== undefined) {
        comments[generate_fen()] = comment;
        moves.pop();
      }

      /* examine last move */
      move = moves[moves.length - 1];
      if (POSSIBLE_RESULTS.indexOf(move) > -1) {
        if (has_keys(header) && typeof header.Result === "undefined") {
          set_header(["Result", move]);
        }
      } else {
        move = move_from_san(move, sloppy);
        if (move == null) {
          return false;
        } else {
          make_move(move);
        }
      }
      return true;
    },

    header: function () {
      return set_header(arguments);
    },

    ascii: function () {
      return ascii();
    },

    turn: function () {
      return turn;
    },

    move: function (move, options) {
      /* The move function can be called with in the following parameters:
       *
       * .move('Nxb7')      <- where 'move' is a case-sensitive SAN string
       *
       * .move({ from: 'h7', <- where the 'move' is a move object (additional
       *         to :'f6',      fields are ignored)
       *         promotion: 'q',
       *      })
       */

      // allow the user to specify the sloppy move parser to work around over
      // disambiguation bugs in Fritz and Chessbase
      var sloppy =
        typeof options !== "undefined" && "sloppy" in options
          ? options.sloppy
          : false;

      var move_obj = null;

      if (typeof move === "string") {
        move_obj = move_from_san(move, sloppy);
      } else if (typeof move === "object") {
        var moves = generate_moves();

        /* convert the pretty move object to an ugly move object */
        for (var i = 0, len = moves.length; i < len; i++) {
          if (
            move.from === algebraic(moves[i].from) &&
            move.to === algebraic(moves[i].to) &&
            (!("promotion" in moves[i]) ||
              move.promotion === moves[i].promotion)
          ) {
            move_obj = moves[i];
            break;
          }
        }
      }

      /* failed to find move */
      if (!move_obj) {
        return null;
      }

      /* need to make a copy of move because we can't generate SAN after the
       * move is made
       */
      var pretty_move = make_pretty(move_obj);

      make_move(move_obj);

      return pretty_move;
    },

    ugly_move: function (move_obj, options) {
      var pretty_move = make_pretty(move_obj);
      make_move(move_obj);

      return pretty_move;
    },

    undo: function () {
      var move = undo_move();
      return move ? make_pretty(move) : null;
    },

    clear: function () {
      return clear();
    },

    put: function (piece, square) {
      return put(piece, square);
    },

    get: function (square) {
      return get(square);
    },

    remove: function (square) {
      return remove(square);
    },

    perft: function (depth) {
      return perft(depth);
    },

    square_color: function (square) {
      if (square in SQUARES) {
        var sq_0x88 = SQUARES[square];
        return (rank(sq_0x88) + file(sq_0x88)) % 2 === 0 ? "light" : "dark";
      }

      return null;
    },

    history: function (options) {
      var reversed_history = [];
      var move_history = [];
      var verbose =
        typeof options !== "undefined" &&
        "verbose" in options &&
        options.verbose;

      while (history.length > 0) {
        reversed_history.push(undo_move());
      }

      while (reversed_history.length > 0) {
        var move = reversed_history.pop();
        if (verbose) {
          move_history.push(make_pretty(move));
        } else {
          move_history.push(move_to_san(move));
        }
        make_move(move);
      }

      return move_history;
    },

    get_comment: function () {
      return comments[generate_fen()];
    },

    set_comment: function (comment) {
      comments[generate_fen()] = comment.replace("{", "[").replace("}", "]");
    },

    delete_comment: function () {
      var comment = comments[generate_fen()];
      delete comments[generate_fen()];
      return comment;
    },

    get_comments: function () {
      prune_comments();
      return Object.keys(comments).map(function (fen) {
        return { fen: fen, comment: comments[fen] };
      });
    },

    delete_comments: function () {
      prune_comments();
      return Object.keys(comments).map(function (fen) {
        var comment = comments[fen];
        delete comments[fen];
        return { fen: fen, comment: comment };
      });
    },
  };
};
/* export Chess object if using node or any other CommonJS compatible
 * environment */
if (typeof exports !== "undefined") exports.Chess = Chess;
/* export Chess object for any RequireJS compatible environment */
if (typeof define !== "undefined")
  define(function () {
    return Chess;
  });
