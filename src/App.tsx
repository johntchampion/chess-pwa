import useGame from './hooks/useGame'
import Game from './components/Game'
import ResetBubbleArea from './components/ResetBubbleArea'
import Drawer from './components/Drawer'

function App() {
  const {
    game,
    oldGameState,
    isResettingBoard,
    playerColor,
    playerColorFull,
    focusedSquare,
    focusedSquareLegalMoves,
    opponentCheck,
    playerCheck,
    opponentCheckmate,
    playerCheckmate,
    opponentStalemate,
    playerStalemate,
    isDrawGame,
    suggestedMove,
    previousMoveHighlight,
    difficulty,
    setDifficulty,
    preferredColor,
    resetGameHandler,
    resetWithColor,
    undoMoveHandler,
    suggestMoveHandler,
    showPreviousMoveHandler,
    pieceDroppedHandler,
    pieceDragHandler,
    squareTappedHandler,
    canDragPieceHandler,
  } = useGame()

  return (
    <div className='relative'>
      <Game
        game={game}
        oldGameState={oldGameState}
        isResettingBoard={isResettingBoard}
        playerColor={playerColor}
        playerColorFull={playerColorFull}
        focusedSquare={focusedSquare}
        focusedSquareLegalMoves={focusedSquareLegalMoves}
        opponentCheck={opponentCheck}
        playerCheck={playerCheck}
        opponentCheckmate={opponentCheckmate}
        playerCheckmate={playerCheckmate}
        opponentStalemate={opponentStalemate}
        playerStalemate={playerStalemate}
        isDrawGame={isDrawGame}
        suggestedMove={suggestedMove}
        previousMoveHighlight={previousMoveHighlight}
        pieceDroppedHandler={pieceDroppedHandler}
        pieceDragHandler={pieceDragHandler}
        squareTappedHandler={squareTappedHandler}
        canDragPieceHandler={canDragPieceHandler}
      />
      <ResetBubbleArea onBubblePopped={resetGameHandler} />
      <Drawer
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        preferredColor={preferredColor}
        resetGameHandler={resetGameHandler}
        resetWithColor={resetWithColor}
        undoMoveHandler={undoMoveHandler}
        suggestMoveHandler={suggestMoveHandler}
        showPreviousMoveHandler={showPreviousMoveHandler}
      />
    </div>
  )
}

export default App
