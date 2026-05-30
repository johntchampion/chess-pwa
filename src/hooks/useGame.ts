import { useState, useEffect, useRef } from 'react'
import { Chess } from 'chess.js'
import type { Color, Move, Square } from 'chess.js'
import type {
  PieceDropHandlerArgs,
  PieceHandlerArgs,
  SquareHandlerArgs,
} from 'react-chessboard'
import chessAPI from '../util/chessAPI'

export type ColorChoice = Color | 'random'

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
  // Lazy initialisers run once on mount, synchronously, so localStorage is read
  // before the first render — no separate "init" effect needed.
  const [game, setGame] = useState<Chess>(() => {
    const savedPgn = localStorage.getItem('game-pgn')
    const g = new Chess()
    if (savedPgn) {
      try {
        g.loadPgn(savedPgn)
      } catch {
        // Corrupted save — fall through with a fresh game.
      }
    }
    return g
  })

  const [playerColor, setPlayerColor] = useState<Color>(() => {
    return (
      (localStorage.getItem('player-color') as Color | null) ??
      (Math.random() > 0.5 ? 'w' : 'b')
    )
  })

  const [oldGameState, setOldGameState] = useState<OldGameState | undefined>(
    undefined,
  )
  const [isResettingBoard, setIsResettingBoard] = useState<boolean>(false)
  const [focusedSquare, setFocusedSquare] = useState<Square | undefined>(
    undefined,
  )

  // Set to true briefly when the player taps "show previous move".
  const [showingLastMove, setShowingLastMove] = useState(false)

  // Set temporarily when the player requests a move suggestion.
  const [suggestedMove, setSuggestedMove] = useState<MoveHighlight | undefined>(
    undefined,
  )

  const [difficulty, setDifficulty] = useState<number>(() => {
    return Number(localStorage.getItem('difficulty') ?? 10)
  })

  const [preferredColor, setPreferredColor] = useState<ColorChoice>(() => {
    return (
      (localStorage.getItem('preferred-color') as ColorChoice | null) ??
      'random'
    )
  })

  // null = not in history view; number = index of position being viewed (0 = start)
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)

  const showLastMoveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const suggestMoveTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Cleanup highlight timers on unmount.
  useEffect(() => {
    return () => {
      clearTimeout(showLastMoveTimerRef.current)
      clearTimeout(suggestMoveTimerRef.current)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('difficulty', String(difficulty))
  }, [difficulty])

  useEffect(() => {
    localStorage.setItem('preferred-color', preferredColor)
  }, [preferredColor])

  const playerColorFull: 'white' | 'black' =
    playerColor === 'w' ? 'white' : 'black'
  const focusedSquareLegalMoves: Move[] = focusedSquare
    ? game.moves({ square: focusedSquare, verbose: true })
    : []

  const historyMoves = game.history({ verbose: true })
  const historyLength = historyMoves.length
  const isViewingHistory = historyIndex !== null

  const PIECE_SORT: Record<string, number> = { p: 0, n: 1, b: 2, r: 3, q: 4, k: 5 }
  const capturedByWhite: string[] = []
  const capturedByBlack: string[] = []
  for (const move of historyMoves) {
    if (move.captured) {
      if (move.color === 'w') capturedByWhite.push(move.captured)
      else capturedByBlack.push(move.captured)
    }
  }
  capturedByWhite.sort((a, b) => (PIECE_SORT[a] ?? 0) - (PIECE_SORT[b] ?? 0))
  capturedByBlack.sort((a, b) => (PIECE_SORT[a] ?? 0) - (PIECE_SORT[b] ?? 0))

  // Replay moves up to historyIndex to get the FEN at that point.
  const historyDisplayFen = (() => {
    if (historyIndex === null) return undefined
    const g = new Chess()
    for (let i = 0; i < historyIndex; i++) {
      const m = historyMoves[i]
      g.move({ from: m.from, to: m.to, promotion: m.promotion })
    }
    return g.fen()
  })()

  // Persists state and triggers the AI move after every game/color change.
  useEffect(() => {
    if (oldGameState) return

    localStorage.setItem('game-pgn', game.pgn())
    localStorage.setItem('player-color', playerColor)

    if (game.turn() !== playerColor && !game.isGameOver()) {
      const controller = new AbortController()

      chessAPI
        .post<SuggestMoveResponse>(
          '/suggest-move',
          {
            fen: game.fen(),
            skill_level: difficulty,
          },
          { signal: controller.signal },
        )
        .then((response) => {
          const bestMoveStr = response.data?.best_move
          if (!bestMoveStr) return

          const bestMove: MoveInput = {
            from: bestMoveStr.substring(0, 2),
            to: bestMoveStr.substring(2, 4),
            promotion: 'q',
          }

          setGame((prevGame) => {
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

      return () => controller.abort()
    }
  }, [game, playerColor, oldGameState])

  // Triggers the board-slide animation after the DOM has been updated with the
  // old board. requestAnimationFrame defers state updates until after the browser
  // has painted the initial two-board layout, which is required for the CSS
  // transition to animate from a visible "before" state.
  useEffect(() => {
    if (!oldGameState) return

    const raf = requestAnimationFrame(() => {
      setIsResettingBoard(true)
      setGame(new Chess())
      setPlayerColor(
        preferredColor === 'random'
          ? Math.random() > 0.5
            ? 'w'
            : 'b'
          : preferredColor,
      )
    })
    return () => cancelAnimationFrame(raf)
  }, [oldGameState, preferredColor])

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

  const enterHistoryView = () => {
    setHistoryIndex(historyLength)
    setFocusedSquare(undefined)
  }

  const exitHistoryView = () => {
    setHistoryIndex(null)
  }

  const resetGameHandler = () => {
    setOldGameState({ fen: game.fen(), color: playerColorFull })
    setSuggestedMove(undefined)
    setShowingLastMove(false)
    clearTimeout(showLastMoveTimerRef.current)
    clearTimeout(suggestMoveTimerRef.current)
  }

  const resetWithColor = (color: ColorChoice) => {
    setPreferredColor(color)
    resetGameHandler()
  }

  // Make a move. Returns the Move if valid, null otherwise.
  const makeMove = (move: MoveInput): Move | null => {
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
    if (game.turn() !== playerColor || game.isGameOver()) return

    chessAPI
      .post<SuggestMoveResponse>('/suggest-move', { fen: game.fen(), skill_level: difficulty })
      .then((response) => {
        const bestMoveStr = response.data?.best_move
        if (!bestMoveStr) return

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
    if (game.history().length === 0) return

    clearTimeout(showLastMoveTimerRef.current)
    setShowingLastMove(true)
    showLastMoveTimerRef.current = setTimeout(
      () => setShowingLastMove(false),
      2500,
    )
  }

  // Derived from game history rather than tracked in state.
  const lastVerboseMove = game.history({ verbose: true }).at(-1)
  const previousMoveHighlight: MoveHighlight | undefined =
    showingLastMove && lastVerboseMove
      ? { from: lastVerboseMove.from, to: lastVerboseMove.to }
      : undefined

  // Handles what happens when a piece is dropped on a square.
  const pieceDroppedHandler = ({
    sourceSquare,
    targetSquare,
  }: PieceDropHandlerArgs): boolean => {
    if (isViewingHistory || !targetSquare) return false
    return (
      makeMove({ from: sourceSquare, to: targetSquare, promotion: 'q' }) !==
      null
    )
  }

  // Handles the event where a piece starts dragging (clears focused square).
  const pieceDragHandler = (): void => {
    setFocusedSquare(undefined)
  }

  // Handles the event where a square is tapped/clicked.
  const squareTappedHandler = ({ square }: SquareHandlerArgs): void => {
    if (isViewingHistory) return
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
      makeMove({ from: focusedSquare, to: sq, promotion: 'q' })
      setFocusedSquare(undefined)
    } else if (pieceOnSquare) {
      setFocusedSquare(sq)
    }
  }

  // Determines if a piece can be dragged.
  const canDragPieceHandler = ({ square }: PieceHandlerArgs): boolean => {
    if (isViewingHistory || !square) return false
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
    opponentCheck: game.turn() !== playerColor && game.inCheck(),
    playerCheck: game.turn() === playerColor && game.inCheck(),
    opponentCheckmate: game.turn() !== playerColor && game.isCheckmate(),
    playerCheckmate: game.turn() === playerColor && game.isCheckmate(),
    opponentStalemate: game.turn() !== playerColor && game.isStalemate(),
    playerStalemate: game.turn() === playerColor && game.isStalemate(),
    isDrawGame: game.isDraw(),
    suggestedMove,
    previousMoveHighlight,
    difficulty,
    setDifficulty,
    preferredColor,
    historyIndex,
    historyLength,
    isViewingHistory,
    historyDisplayFen,
    capturedByWhite,
    capturedByBlack,
    enterHistoryView,
    exitHistoryView,
    setHistoryIndex,
    resetGameHandler,
    resetWithColor,
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
