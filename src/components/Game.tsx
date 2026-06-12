import type { CSSProperties } from 'react'
import styled from 'styled-components'
import { Chessboard } from 'react-chessboard'
import type { Chess, Move, Square, Color } from 'chess.js'
import type {
  PieceDropHandlerArgs,
  PieceHandlerArgs,
  SquareHandlerArgs,
} from 'react-chessboard'
import Spinner from './Spinner'
import CheckIndicator from './CheckIndicator'
import type { PreviewState } from '../hooks/useGame'
import { usePieces } from '../context/PiecesContext'

interface OldGameState {
  fen: string
  color: 'white' | 'black'
}

interface GameProps {
  game: Chess | undefined
  oldGameState: OldGameState | undefined
  isResettingBoard: boolean
  playerColor: Color | undefined
  playerColorFull: 'white' | 'black'
  pieceDroppedHandler: (args: PieceDropHandlerArgs) => boolean
  pieceDragHandler: (args: PieceHandlerArgs) => void
  focusedSquare: Square | undefined
  focusedSquareLegalMoves: Move[]
  opponentCheck: boolean
  playerCheck: boolean
  opponentCheckmate: boolean
  playerCheckmate: boolean
  opponentStalemate: boolean
  playerStalemate: boolean
  isDrawGame: boolean
  squareTappedHandler: (args: SquareHandlerArgs) => void
  canDragPieceHandler: (args: PieceHandlerArgs) => boolean
  /** Temporary board position for animated suggest-move / prev-move previews. */
  preview?: PreviewState
  /** FEN to display when scrubbing through game history; overrides the live board position. */
  historyDisplayFen?: string
}

const CHESSBOARD_STYLE: CSSProperties = {
  borderRadius: 'var(--chessboard-border-radius)',
  boxShadow: 'var(--chessboard-box-shadow)',
  transition: 'border-radius 0.5s ease, box-shadow 0.5s ease',
}

const GameContainer = styled.div`
  margin-top: calc(3rem + env(safe-area-inset-top));
  position: relative;
`

const InfoContainer = styled.div`
  display: inline-flex;
  flex-direction: row;
  justify-content: flex-end;
  align-items: flex-end;
  color: var(--color-text-primary);
  height: 2.5rem;
  padding: 8px;
  margin: auto;
  max-width: 40rem;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  @media (min-width: 40rem) {
    padding: 8px 8px 0 8px;
    height: 3rem;
  }
`

// Outer viewport — clips the sliding animation to one board width.
const ChessboardViewport = styled.div`
  display: inline-block;
  width: 100vw;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  margin: auto;

  @media (min-width: 40rem) {
    width: 42rem;
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }
`

// Per-board cell — gives react-chessboard v5 a sized container to fill.
const ChessboardCell = styled.div`
  --chessboard-border-radius: 0;
  --chessboard-box-shadow: none;

  width: 100vw;
  aspect-ratio: 1 / 1;
  flex-shrink: 0;

  @media (min-width: 40rem) {
    width: 42rem;
    height: 42rem;
    padding: 1rem;

    --chessboard-border-radius: 12px;
    --chessboard-box-shadow: 0 2px 16px rgb(0, 0, 0, 0.5);
  }
`

// Animated sliding strip that holds one or two boards side-by-side.
const ChessboardContainer = styled.div<{ $isResettingBoard: boolean }>`
  left: 0;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  width: ${({ $isResettingBoard }) =>
    $isResettingBoard ? 'calc(200vw + 2rem)' : 'initial'};
  column-gap: ${({ $isResettingBoard }) =>
    $isResettingBoard ? '2rem' : 'initial'};
  transform: ${({ $isResettingBoard }) =>
    $isResettingBoard ? 'translateX(calc(-100vw - 2rem))' : 'initial'};
  transition: ${({ $isResettingBoard }) =>
    $isResettingBoard ? 'transform 0.5s ease-in-out' : 'initial'};

  @media (min-width: 40rem) {
    width: ${({ $isResettingBoard }) =>
      $isResettingBoard ? 'calc(84rem + 2rem)' : 'initial'};
    transform: ${({ $isResettingBoard }) =>
      $isResettingBoard ? 'translateX(calc(-42rem - 2rem))' : 'initial'};
  }
`

const Game = ({
  game,
  oldGameState,
  isResettingBoard,
  playerColor,
  playerColorFull,
  pieceDroppedHandler,
  pieceDragHandler,
  focusedSquare,
  focusedSquareLegalMoves,
  opponentCheck,
  playerCheck,
  opponentCheckmate,
  playerCheckmate,
  opponentStalemate,
  playerStalemate,
  isDrawGame,
  squareTappedHandler,
  canDragPieceHandler,
  preview,
  historyDisplayFen,
}: GameProps) => {
  const pieces = usePieces()
  const squareStyles: Record<string, CSSProperties> = {}

  // Legal-move dots for the focused piece.
  focusedSquareLegalMoves.forEach((m) => {
    const targetPiece = game?.get(m.to)
    const sourcePiece = focusedSquare ? game?.get(focusedSquare) : undefined
    squareStyles[m.to] = {
      background:
        targetPiece && sourcePiece && targetPiece.color !== sourcePiece.color
          ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
          : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
      borderRadius: '50%',
    }
  })

  // Focused-square highlight always renders on top.
  if (focusedSquare) {
    squareStyles[focusedSquare] = { background: 'var(--color-hl-focus)' }
  }

  // Build the board array. During a reset, the resigned game board is prepended
  // so both boards are briefly visible, driving the slide-out animation.
  const chessBoards: React.ReactNode[] = []
  if (game) {
    chessBoards.push(
      <ChessboardCell key='chessboard'>
        <Chessboard
          options={{
            id: 'chessboard',
            pieces,
            boardOrientation: playerColorFull,
            position: preview?.fen ?? historyDisplayFen ?? game.fen(),
            onPieceDrop: pieceDroppedHandler,
            onPieceDrag: pieceDragHandler,
            onSquareClick: squareTappedHandler,
            squareStyles,
            animationDurationInMs:
              preview && !preview.animate
                ? 0
                : game.history().length === 0
                  ? 0
                  : 300,
            canDragPiece: canDragPieceHandler,
            draggingPieceStyle: {
              animation: 'piece-pickup 120ms ease-out forwards',
            },
            dropSquareStyle: { boxShadow: 'inset 0px 0px 0px 2px black' },
            lightSquareStyle: { backgroundColor: 'var(--color-board-light)' },
            darkSquareStyle: { backgroundColor: 'var(--color-board-dark)' },
            boardStyle: CHESSBOARD_STYLE,
            squareStyle: {
              WebkitTapHighlightColor: 'transparent',
            },
            showNotation: false,
          }}
        />
      </ChessboardCell>,
    )
  }
  if (oldGameState) {
    chessBoards.unshift(
      <ChessboardCell key='old-chessboard-cell'>
        <Chessboard
          options={{
            id: 'old-chessboard',
            boardOrientation: oldGameState.color,
            position: oldGameState.fen,
            animationDurationInMs: 0,
            lightSquareStyle: { backgroundColor: 'var(--color-board-light)' },
            darkSquareStyle: { backgroundColor: 'var(--color-board-dark)' },
            boardStyle: CHESSBOARD_STYLE,
            showNotation: false,
          }}
        />
      </ChessboardCell>,
    )
  }

  return (
    <GameContainer>
      <InfoContainer>
        <CheckIndicator
          check={opponentCheck || playerCheck}
          checkmate={opponentCheckmate || playerCheckmate}
          stalemate={opponentStalemate || playerStalemate}
          draw={isDrawGame}
        />
        <Spinner
          hidden={!game || game.turn() === playerColor || game.isGameOver()}
        />
      </InfoContainer>
      <ChessboardViewport>
        <ChessboardContainer $isResettingBoard={isResettingBoard}>
          {chessBoards}
        </ChessboardContainer>
      </ChessboardViewport>
    </GameContainer>
  )
}

export default Game
