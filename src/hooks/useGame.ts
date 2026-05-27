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

  // FEN stack for undo. Each entry is the FEN *before* a half-move was made,
  // so undoing 2 entries always restores the player's turn.
  // Note: chess.js instances are created from FEN (no move history), so we
  // maintain this stack ourselves rather than relying on Chess.undo().
  const [gameHistory, setGameHistory] = useState<string[]>([])

  // Tracks the most recent half-move so "show previous move" can highlight it.
  const [lastMove, setLastMove] = useState<MoveHighlight | undefined>(undefined)

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
      const savedGameFEN = localStorage.getItem('game-fen')
      const savedPlayerColor = localStorage.getItem(
        'player-color',
      ) as Color | null
      setGame(savedGameFEN ? new Chess(savedGameFEN) : new Chess())
      setPlayerColor(savedPlayerColor ?? (Math.random() > 0.5 ? 'w' : 'b'))
      return
    }

    localStorage.setItem('game-fen', game.fen())
    if (playerColor) {
      localStorage.setItem('player-color', playerColor)
    }

    // If it's the opponent's turn, call the API for a move.
    if (playerColor && game.turn() !== playerColor && !game.isGameOver()) {
      const controller = new AbortController()

      // Capture the FEN now so we can push it to history once the AI responds.
      const fenBeforeAiMove = game.fen()

      chessAPI
        .post<SuggestMoveResponse>(
          '/suggest-move',
          {
            fen: fenBeforeAiMove,
            // difficulty will be added here once the API supports it
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
              const gameCopy = new Chess(prevGame.fen())
              gameCopy.move(bestMove)
              return gameCopy
            } catch {
              return prevGame
            }
          })

          // Record history and last-move after the AI's half-move.
          setGameHistory((prev) => [...prev, fenBeforeAiMove])
          setLastMove({
            from: bestMove.from as Square,
            to: bestMove.to as Square,
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
    setGameHistory([])
    setLastMove(undefined)
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
      const gameCopy = new Chess(game.fen())
      const result = gameCopy.move(move)
      setGameHistory((prev) => [...prev, game.fen()])
      setLastMove({ from: result.from, to: result.to })
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
  const undoMoveHandler = () => {
    if (!game || gameHistory.length === 0) {
      return
    }

    const targetIndex = Math.max(0, gameHistory.length - 2)
    const targetFen = gameHistory[targetIndex]

    setGame(new Chess(targetFen))
    setGameHistory((prev) => prev.slice(0, targetIndex))
    setFocusedSquare(undefined)
    setSuggestedMove(undefined)
    setShowingLastMove(false)

    // Restore the last-move highlight to the move just before the undone position.
    // If there are no earlier moves we clear it; otherwise we leave lastMove intact
    // so the player can still see what they're going back to.
    if (targetIndex === 0) {
      setLastMove(undefined)
    }
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

  // Briefly highlights the squares involved in the most recent half-move.
  const showPreviousMoveHandler = () => {
    if (!lastMove) {
      return
    }

    clearTimeout(showLastMoveTimerRef.current)
    setShowingLastMove(true)
    showLastMoveTimerRef.current = setTimeout(
      () => setShowingLastMove(false),
      2500,
    )
  }

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
    previousMoveHighlight: showingLastMove ? lastMove : undefined,
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
