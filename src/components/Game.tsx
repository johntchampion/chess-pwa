import type { CSSProperties } from 'react';
import styled from 'styled-components';
import { Chessboard } from 'react-chessboard';
import type { Chess, Move, Square, Color } from 'chess.js';
import type { PieceDropHandlerArgs, PieceHandlerArgs, SquareHandlerArgs } from 'react-chessboard';
import Spinner from './Spinner';
import CheckIndicator from './CheckIndicator';
import type { MoveHighlight } from '../hooks/useGame';
import { usePieces } from '../context/PiecesContext';

interface OldGameState {
    fen: string;
    color: 'white' | 'black';
}

interface GameProps {
    game: Chess | undefined;
    oldGameState: OldGameState | undefined;
    isResettingBoard: boolean;
    playerColor: Color | undefined;
    playerColorFull: 'white' | 'black';
    pieceDroppedHandler: (args: PieceDropHandlerArgs) => boolean;
    pieceDragHandler: (args: PieceHandlerArgs) => void;
    focusedSquare: Square | undefined;
    focusedSquareLegalMoves: Move[];
    opponentCheck: boolean;
    playerCheck: boolean;
    opponentCheckmate: boolean;
    playerCheckmate: boolean;
    opponentStalemate: boolean;
    playerStalemate: boolean;
    isDrawGame: boolean;
    squareTappedHandler: (args: SquareHandlerArgs) => void;
    canDragPieceHandler: (args: PieceHandlerArgs) => boolean;
    /** Temporarily highlighted squares from the "suggest move" action. */
    suggestedMove?: MoveHighlight;
    /** Temporarily highlighted squares from the "show previous move" action. */
    previousMoveHighlight?: MoveHighlight;
    /** FEN to display when scrubbing through game history; overrides the live board position. */
    historyDisplayFen?: string;
}

const GameContainer = styled.div`
display: grid;
grid-template-rows: 2.5rem auto 2.5rem;
margin: auto;
margin-top: 3rem;
width: 100%;
overflow: hidden;
max-width: 40rem;
position: relative;

@media (min-width: 40rem) {
    grid-template-rows: 3rem auto 3rem;
}
`;

const InfoContainer = styled.div`
color: white;
padding: 8px;
display: flex;
flex-direction: row;
justify-content: space-between;
`;

const OpponentInfo = styled(InfoContainer)``;
const PlayerInfo = styled(InfoContainer)``;

// Outer viewport — clips the sliding animation to one board width.
const ChessboardViewport = styled.div`
width: 100vw;
overflow: hidden;
aspect-ratio: 1 / 1;

@media (min-width: 40rem) {
    width: 40rem;
}
`;

// Per-board cell — gives react-chessboard v5 a sized container to fill.
const ChessboardCell = styled.div`
width: 100vw;
aspect-ratio: 1 / 1;
flex-shrink: 0;

@media (min-width: 40rem) {
    width: 40rem;
}
`;

// Animated sliding strip that holds one or two boards side-by-side.
const ChessboardContainer = styled.div<{ $isResettingBoard: boolean }>`
left: 0;
display: flex;
flex-direction: row;
justify-content: flex-start;
align-items: center;
width: ${({ $isResettingBoard }) => $isResettingBoard ? 'calc(200vw + 2rem)' : 'initial'};
column-gap: ${({ $isResettingBoard }) => $isResettingBoard ? '2rem' : 'initial'};
transform: ${({ $isResettingBoard }) => $isResettingBoard ? 'translateX(calc(-100vw - 2rem))' : 'initial'};
transition: ${({ $isResettingBoard }) => $isResettingBoard ? 'transform 0.5s ease-in-out' : 'initial'};

@media (min-width: 40rem) {
    width: ${({ $isResettingBoard }) => $isResettingBoard ? 'calc(80rem + 2rem)' : 'initial'};
    transform: ${({ $isResettingBoard }) => $isResettingBoard ? 'translateX(calc(-40rem - 2rem))' : 'initial'};
}
`;

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
    suggestedMove,
    previousMoveHighlight,
    historyDisplayFen,
}: GameProps) => {

    const pieces = usePieces();
    const squareStyles: Record<string, CSSProperties> = {};

    // Previous-move highlight (light blue). Applied first so other
    // highlights can render on top if squares overlap.
    if (previousMoveHighlight) {
        squareStyles[previousMoveHighlight.from] = { background: 'rgba(100, 180, 255, 0.35)' };
        squareStyles[previousMoveHighlight.to]   = { background: 'rgba(100, 180, 255, 0.55)' };
    }

    // Suggested-move highlight (amber). Renders on top of previous-move.
    if (suggestedMove) {
        squareStyles[suggestedMove.from] = { background: 'rgba(255, 200, 50, 0.40)' };
        squareStyles[suggestedMove.to]   = { background: 'rgba(255, 200, 50, 0.65)' };
    }

    // Legal-move dots for the focused piece.
    focusedSquareLegalMoves.forEach(m => {
        const targetPiece = game?.get(m.to);
        const sourcePiece = focusedSquare ? game?.get(focusedSquare) : undefined;
        squareStyles[m.to] = {
            background: targetPiece && sourcePiece && targetPiece.color !== sourcePiece.color
                ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
                : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
            borderRadius: '50%'
        };
    });

    // Focused-square highlight always renders on top.
    if (focusedSquare) {
        squareStyles[focusedSquare] = { background: 'rgba(255, 255, 0, 0.4)' };
    }

    // Build the board array. During a reset, the resigned game board is prepended
    // so both boards are briefly visible, driving the slide-out animation.
    const chessBoards: React.ReactNode[] = [];
    if (game) {
        chessBoards.push(
            <ChessboardCell key='main'>
                <Chessboard
                    options={{
                        id: 'chessboard',
                        pieces,
                        boardOrientation: playerColorFull,
                        position: historyDisplayFen ?? game.fen(),
                        onPieceDrop: pieceDroppedHandler,
                        onPieceDrag: pieceDragHandler,
                        onSquareClick: squareTappedHandler,
                        squareStyles,
                        animationDurationInMs: game.history().length === 0 ? 0 : 300,
                        canDragPiece: canDragPieceHandler,
                    }}
                />
            </ChessboardCell>
        );
    }
    if (oldGameState) {
        chessBoards.unshift(
            <ChessboardCell key='animated'>
                <Chessboard
                    options={{
                        boardOrientation: oldGameState.color,
                        position: oldGameState.fen,
                        animationDurationInMs: 0,
                    }}
                />
            </ChessboardCell>
        );
    }

    return (
        <GameContainer>
            <OpponentInfo>
                <CheckIndicator
                    check={opponentCheck}
                    checkmate={opponentCheckmate}
                    stalemate={opponentStalemate}
                    draw={isDrawGame}
                />
                <Spinner hidden={!game || game.turn() === playerColor || game.isGameOver()} />
            </OpponentInfo>
            <ChessboardViewport>
                <ChessboardContainer $isResettingBoard={isResettingBoard}>
                    {chessBoards}
                </ChessboardContainer>
            </ChessboardViewport>
            <PlayerInfo>
                <CheckIndicator
                    check={playerCheck}
                    checkmate={playerCheckmate}
                    stalemate={playerStalemate}
                    draw={isDrawGame}
                />
            </PlayerInfo>
        </GameContainer>
    );
};

export default Game;
