import { useState, useEffect, useRef } from 'react'
import { Chess } from 'chess.js'
import type { Color, Move, Square } from 'chess.js'
import type {
  PieceDropHandlerArgs,
  PieceHandlerArgs,
  SquareHandlerArgs,
} from 'react-chessboard'
import chessAPI from '../util/chessAPI'

interface OldGameState {
  fen: string
  color: 'white' | 'black'
}

interface MoveInput {
  from: string
  to: string
  promotion?: string
}

interface SuggestMoveResponse {
  best_move: string
}

export interface MoveHighlight {
  from: Square
  to: Square
}

// Creates a deep copy of a Chess instance that preserves the full move history.
// PGN round-trip is used instead of the FEN constructor so that game.history()
// and game.undo() remain functional on the copy.
const cloneGame = (chess: Chess): Chess => {
  const copy = new Chess()
  const pgn = chess.pgn()
  if (pgn) copy.loadPgn(pgn)
  return copy
}

const useGame = () => {
  const [game, setGame] = useState<Chess | undefined>(undefined)
  const [oldGameState, setOldGameState] = useState<OldGameState | undefined>(
    undefined,
  )
  const [isResettingBoard, setIsResettingBoard] = useState<boolean>(false)
  const [playerColor, setPlayerColor] = useState<Color | undefined>(undefined)
  const [focusedSquare, setFocusedSquare] = useState<Square | undefined>(
    undefined,
  )

  // Set to true briefly when the player taps "show previous move".
  const [showingLastMove, setShowingLastMove] = useState(false)

  // Set temporarily when the player requests a move suggestion.
  const [suggestedMove, setSuggestedMove] = useState<MoveHighlight | undefined>(
    undefined,
  )

  // Difficulty level 1–8 (stored for future API integration; not yet sent).
  const [difficulty, setDifficulty] = useState<number>(5)

  const showLastMoveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const suggestMoveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Cleanup highlight timers on unmount.
  useEffect(() => {
    return () => {
      clearTimeout(showLastMoveTimerRef.current)
      clearTimeout(suggestMoveTimerRef.current)
    }
  }, [])

  const playerColorFull: 'white' | 'black' =
    playerColor === 'w' ? 'white' : 'black'
  const focusedSquareLegalMoves: Move[] =
    focusedSquare && game
      ? game.moves({ square: focusedSquare, verbose: true })
      : []

  // Manages what happens after each game state change.
  useEffect(() => {
    if (oldGameState) {
      return
    }

    // Either fetch the game saved in localStorage or start a new game.
    if (!game) {
      const savedPgn = localStorage.getItem('game-pgn')
      const savedPlayerColor = localStorage.getItem(
        'player-color',
      ) as Color | null

      const restoredGame = new Chess()
      if (savedPgn) {
        try {
          restoredGame.loadPgn(savedPgn)
        } catch {
          // Corrupted save — fall through to start a fresh game.
        }
      } else {
        // Migration: if an old FEN-based save exists, load that board position.
        // Full move history can't be recovered from FEN alone, but the player
        // at least returns to the right position.
        const legacyFen = localStorage.getItem('game-fen')
        if (legacyFen) {
          try {
            restoredGame.load(legacyFen)
          } catch {
            // Corrupted legacy save — start fresh.
          }
          localStorage.removeItem('game-fen')
        }
      }

      setGame(restoredGame)
      setPlayerColor(savedPlayerColor ?? (Math.random() > 0.5 ? 'w' : 'b'))
      return
    }

    localStorage.setItem('game-pgn', game.pgn())
    if (playerColor) {
      localStorage.setItem('player-color', playerColor)
    }

    // If it's the opponent's turn, call the API for a move.
    if (playerColor && game.turn() !== playerColor && !game.isGameOver()) {
      const controller = new AbortController()

      chessAPI
        .post<SuggestMoveResponse>(
          '/suggest-move',
          {
            fen: game.fen(),
            // difficulty will be wired here once the API supports it
          },
          {
            signal: controller.signal,
          },
        )
        .then((response) => {
          const bestMoveStr = response.data?.best_move
          if (!bestMoveStr) {
            return
          }

          const bestMove: MoveInput = {
            from: bestMoveStr.substring(0, 2),
            to: bestMoveStr.substring(2, 4),
            promotion: 'q',
          }

          setGame((prevGame) => {
            if (!prevGame) {
              return prevGame
            }
            try {
              const gameCopy = cloneGame(prevGame)
              gameCopy.move(bestMove)
              return gameCopy
            } catch {
              return prevGame
            }
          })
        })
        .catch((error: unknown) => {
          console.error(error)
        })

      return () => {
        controller.abort()
      }
    }
  }, [game, playerColor, oldGameState])

  // The DOM has updated with the new chess board. It can now be animated.
  useEffect(() => {
    if (oldGameState) {
      setIsResettingBoard(true)
      setGame(new Chess())
      setPlayerColor(Math.random() > 0.5 ? 'w' : 'b')
    }
  }, [oldGameState])

  // The board reset is finished; remove the animation elements.
  useEffect(() => {
    if (isResettingBoard) {
      const timeout = setTimeout(() => {
        setOldGameState(undefined)
        setIsResettingBoard(false)
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [isResettingBoard])

  // Handles what happens when a game reset is requested.
  const resetGameHandler = () => {
    if (!game) {
      return
    }
    setOldGameState({
      fen: game.fen(),
      color: playerColorFull,
    })
    setSuggestedMove(undefined)
    setShowingLastMove(false)
    clearTimeout(showLastMoveTimerRef.current)
    clearTimeout(suggestMoveTimerRef.current)
  }

  // Make a move. Returns the Move if valid, null otherwise.
  const makeMove = (move: MoveInput): Move | null => {
    if (!game) {
      return null
    }
    try {
      const gameCopy = cloneGame(game)
      const result = gameCopy.move(move)
      setSuggestedMove(undefined)
      setShowingLastMove(false)
      setGame(gameCopy)
      return result
    } catch {
      return null
    }
  }

  // Undoes 2 half-moves so it is always the player's turn after undoing.
  // If fewer than 2 half-moves have been made, undoes whatever is available.
  // Replays verbose history minus the last 2 moves into a fresh Chess instance.
  const undoMoveHandler = () => {
    if (!game) return
    const moves = game.history({ verbose: true })
    if (moves.length === 0) return

    const movesToKeep = moves.slice(0, -2)
    const newGame = new Chess()
    movesToKeep.forEach((m) =>
      newGame.move({ from: m.from, to: m.to, promotion: m.promotion }),
    )

    setGame(newGame)
    setFocusedSquare(undefined)
    setSuggestedMove(undefined)
    setShowingLastMove(false)
  }

  // Requests a move suggestion from the API and highlights it for 3 seconds.
  // Only active on the player's turn.
  const suggestMoveHandler = () => {
    if (
      !game ||
      !playerColor ||
      game.turn() !== playerColor ||
      game.isGameOver()
    ) {
      return
    }

    chessAPI
      .post<SuggestMoveResponse>('/suggest-move', { fen: game.fen() })
      .then((response) => {
        const bestMoveStr = response.data?.best_move
        if (!bestMoveStr) {
          return
        }

        setSuggestedMove({
          from: bestMoveStr.substring(0, 2) as Square,
          to: bestMoveStr.substring(2, 4) as Square,
        })

        clearTimeout(suggestMoveTimerRef.current)
        suggestMoveTimerRef.current = setTimeout(
          () => setSuggestedMove(undefined),
          3000,
        )
      })
      .catch((error: unknown) => console.error(error))
  }

  // Briefly highlights the squares of the most recent half-move for 2.5 seconds.
  // The last move is derived from game.history() — no separate state needed.
  const showPreviousMoveHandler = () => {
    if (!game || game.history().length === 0) return

    clearTimeout(showLastMoveTimerRef.current)
    setShowingLastMove(true)
    showLastMoveTimerRef.current = setTimeout(
      () => setShowingLastMove(false),
      2500,
    )
  }

  // Derived from game history rather than tracked in state.
  const lastVerboseMove = game?.history({ verbose: true }).at(-1)
  const previousMoveHighlight: MoveHighlight | undefined =
    showingLastMove && lastVerboseMove
      ? { from: lastVerboseMove.from, to: lastVerboseMove.to }
      : undefined

  // Handles what happens when a piece is dropped on a square.
  const pieceDroppedHandler = ({
    sourceSquare,
    targetSquare,
  }: PieceDropHandlerArgs): boolean => {
    if (!targetSquare) {
      return false
    }
    const move: MoveInput = {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    }
    return makeMove(move) !== null
  }

  // Handles the event where a piece starts dragging (clears focused square).
  const pieceDragHandler = (_args: PieceHandlerArgs): void => {
    setFocusedSquare(undefined)
  }

  // Handles the event where a square is tapped/clicked.
  const squareTappedHandler = ({ square }: SquareHandlerArgs): void => {
    if (!game || !playerColor) {
      return
    }

    const sq = square as Square
    const pieceOnSquare = game.get(sq)

    if (
      focusedSquare === sq ||
      (!focusedSquare &&
        pieceOnSquare &&
        pieceOnSquare.color !== playerColor) ||
      game.turn() !== playerColor
    ) {
      setFocusedSquare(undefined)
      return
    }

    if (
      (!focusedSquare && pieceOnSquare) ||
      (focusedSquare && pieceOnSquare && pieceOnSquare.color === playerColor)
    ) {
      setFocusedSquare(sq)
    } else if (focusedSquare) {
      const move: MoveInput = {
        from: focusedSquare,
        to: sq,
        promotion: 'q',
      }
      makeMove(move)
      setFocusedSquare(undefined)
    } else if (pieceOnSquare) {
      setFocusedSquare(sq)
    }
  }

  // Determines if a piece can be dragged.
  const canDragPieceHandler = ({ square }: PieceHandlerArgs): boolean => {
    if (!game || !square || !playerColor) {
      return false
    }
    const pieceOnSquare = game.get(square as Square)
    return !!(
      pieceOnSquare &&
      pieceOnSquare.color === playerColor &&
      !game.isGameOver() &&
      game.turn() === playerColor
    )
  }

  return {
    game,
    oldGameState,
    isResettingBoard,
    playerColor,
    playerColorFull,
    focusedSquare,
    focusedSquareLegalMoves,
    opponentCheck: !!(
      game &&
      playerColor &&
      game.turn() !== playerColor &&
      game.inCheck()
    ),
    playerCheck: !!(
      game &&
      playerColor &&
      game.turn() === playerColor &&
      game.inCheck()
    ),
    opponentCheckmate: !!(
      game &&
      playerColor &&
      game.turn() !== playerColor &&
      game.isCheckmate()
    ),
    playerCheckmate: !!(
      game &&
      playerColor &&
      game.turn() === playerColor &&
      game.isCheckmate()
    ),
    opponentStalemate: !!(
      game &&
      playerColor &&
      game.turn() !== playerColor &&
      game.isStalemate()
    ),
    playerStalemate: !!(
      game &&
      playerColor &&
      game.turn() === playerColor &&
      game.isStalemate()
    ),
    isDrawGame: !!(game && game.isDraw()),
    suggestedMove,
    previousMoveHighlight,
    difficulty,
    setDifficulty,
    resetGameHandler,
    undoMoveHandler,
    suggestMoveHandler,
    showPreviousMoveHandler,
    pieceDroppedHandler,
    pieceDragHandler,
    squareTappedHandler,
    canDragPieceHandler,
  }
}

export default useGame
