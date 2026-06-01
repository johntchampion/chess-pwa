import useGame from './hooks/useGame'
import Game from './components/Game'
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
    preview,
    difficulty,
    setDifficulty,
    preferredColor,
    historyIndex,
    historyLength,
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
        preview={preview}
        historyDisplayFen={historyDisplayFen}
        pieceDroppedHandler={pieceDroppedHandler}
        pieceDragHandler={pieceDragHandler}
        squareTappedHandler={squareTappedHandler}
        canDragPieceHandler={canDragPieceHandler}
      />
      <Drawer
        difficulty={difficulty}
        setDifficulty={setDifficulty}
        preferredColor={preferredColor}
        historyLength={historyLength}
        historyIndex={historyIndex}
        capturedByWhite={capturedByWhite}
        capturedByBlack={capturedByBlack}
        enterHistoryView={enterHistoryView}
        exitHistoryView={exitHistoryView}
        setHistoryIndex={setHistoryIndex}
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
