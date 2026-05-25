import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import type { Color, Move, Square } from 'chess.js';
import type { PieceDropHandlerArgs, PieceHandlerArgs, SquareHandlerArgs } from 'react-chessboard';
import chessAPI from '../util/chessAPI';

interface OldGameState {
    fen: string;
    color: 'white' | 'black';
}

interface MoveInput {
    from: string;
    to: string;
    promotion?: string;
}

interface SuggestMoveResponse {
    best_move: string;
}

const useGame = () => {
    const [game, setGame] = useState<Chess | undefined>(undefined);
    const [oldGameState, setOldGameState] = useState<OldGameState | undefined>(undefined);
    const [isResettingBoard, setIsResettingBoard] = useState<boolean>(false);
    const [playerColor, setPlayerColor] = useState<Color | undefined>(undefined);
    const [focusedSquare, setFocusedSquare] = useState<Square | undefined>(undefined);

    const playerColorFull: 'white' | 'black' = playerColor === 'w' ? 'white' : 'black';
    const focusedSquareLegalMoves: Move[] = (focusedSquare && game)
        ? game.moves({ square: focusedSquare, verbose: true })
        : [];

    // Manages what happens after each game state change.
    useEffect(() => {
        if (oldGameState) { return; }

        // Either fetch the game saved in localStorage or start a new game.
        if (!game) {
            const savedGameFEN = localStorage.getItem('game-fen');
            const savedPlayerColor = localStorage.getItem('player-color') as Color | null;
            setGame(savedGameFEN ? new Chess(savedGameFEN) : new Chess());
            setPlayerColor(savedPlayerColor ?? (Math.random() > 0.5 ? 'w' : 'b'));
            return;
        }

        localStorage.setItem('game-fen', game.fen());
        if (playerColor) {
            localStorage.setItem('player-color', playerColor);
        }

        // If it's the opponent's turn, call the API for a move.
        if (playerColor && game.turn() !== playerColor && !game.isGameOver()) {
            const controller = new AbortController();

            chessAPI.post<SuggestMoveResponse>('/suggest-move', {
                fen: game.fen()
            }, {
                signal: controller.signal
            }).then(response => {
                const bestMoveStr = response.data?.best_move;
                if (!bestMoveStr) { return; }

                const bestMove: MoveInput = {
                    from: bestMoveStr.substring(0, 2),
                    to: bestMoveStr.substring(2, 4),
                    promotion: 'q'
                };

                setGame(prevGame => {
                    if (!prevGame) { return prevGame; }
                    try {
                        const gameCopy = new Chess(prevGame.fen());
                        gameCopy.move(bestMove);
                        return gameCopy;
                    } catch {
                        return prevGame;
                    }
                });

            }).catch((error: unknown) => {
                console.error(error);
            });

            return () => {
                controller.abort();
            };
        }
    }, [game, playerColor, oldGameState]);

    // The DOM has updated with the new chess board. It can now be animated.
    useEffect(() => {
        if (oldGameState) {
            setIsResettingBoard(true);
            setGame(new Chess());
            setPlayerColor(Math.random() > 0.5 ? 'w' : 'b');
        }
    }, [oldGameState]);

    // The board reset is finished; remove the animation elements.
    useEffect(() => {
        if (isResettingBoard) {
            const timeout = setTimeout(() => {
                setOldGameState(undefined);
                setIsResettingBoard(false);
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [isResettingBoard]);

    // Handles what happens when a game reset is requested.
    const resetGameHandler = () => {
        if (!game) { return; }
        setOldGameState({
            fen: game.fen(),
            color: playerColorFull
        });
    };

    // Make a move. Returns the Move if valid, null otherwise.
    const makeMove = (move: MoveInput): Move | null => {
        if (!game) { return null; }
        try {
            const gameCopy = new Chess(game.fen());
            const result = gameCopy.move(move);
            setGame(gameCopy);
            return result;
        } catch {
            return null;
        }
    };

    // Handles what happens when a piece is dropped on a square.
    const pieceDroppedHandler = ({ sourceSquare, targetSquare }: PieceDropHandlerArgs): boolean => {
        if (!targetSquare) { return false; }
        const move: MoveInput = {
            from: sourceSquare,
            to: targetSquare,
            promotion: 'q'
        };
        return makeMove(move) !== null;
    };

    // Handles the event where a piece starts dragging (clears focused square).
    const pieceDragHandler = (_args: PieceHandlerArgs): void => {
        setFocusedSquare(undefined);
    };

    // Handles the event where a square is tapped/clicked.
    const squareTappedHandler = ({ square }: SquareHandlerArgs): void => {
        if (!game || !playerColor) { return; }

        const sq = square as Square;
        const pieceOnSquare = game.get(sq);

        if (
            focusedSquare === sq ||
            (!focusedSquare && pieceOnSquare && pieceOnSquare.color !== playerColor) ||
            game.turn() !== playerColor
        ) {
            setFocusedSquare(undefined);
            return;
        }

        if ((!focusedSquare && pieceOnSquare) || (focusedSquare && pieceOnSquare && pieceOnSquare.color === playerColor)) {
            setFocusedSquare(sq);
        } else if (focusedSquare) {
            const move: MoveInput = {
                from: focusedSquare,
                to: sq,
                promotion: 'q'
            };
            makeMove(move);
            setFocusedSquare(undefined);
        } else if (pieceOnSquare) {
            setFocusedSquare(sq);
        }
    };

    // Determines if a piece can be dragged.
    const canDragPieceHandler = ({ square }: PieceHandlerArgs): boolean => {
        if (!game || !square || !playerColor) { return false; }
        const pieceOnSquare = game.get(square as Square);
        return !!(
            pieceOnSquare &&
            pieceOnSquare.color === playerColor &&
            !game.isGameOver() &&
            game.turn() === playerColor
        );
    };

    return {
        game,
        oldGameState,
        isResettingBoard,
        playerColor,
        playerColorFull,
        focusedSquare,
        focusedSquareLegalMoves,
        opponentCheck: !!(game && playerColor && game.turn() !== playerColor && game.inCheck()),
        playerCheck: !!(game && playerColor && game.turn() === playerColor && game.inCheck()),
        opponentCheckmate: !!(game && playerColor && game.turn() !== playerColor && game.isCheckmate()),
        playerCheckmate: !!(game && playerColor && game.turn() === playerColor && game.isCheckmate()),
        opponentStalemate: !!(game && playerColor && game.turn() !== playerColor && game.isStalemate()),
        playerStalemate: !!(game && playerColor && game.turn() === playerColor && game.isStalemate()),
        isDrawGame: !!(game && game.isDraw()),
        resetGameHandler,
        pieceDroppedHandler,
        pieceDragHandler,
        squareTappedHandler,
        canDragPieceHandler,
    };
};

export default useGame;
