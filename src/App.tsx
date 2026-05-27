import useGame from './hooks/useGame'
import useDrawer from './hooks/useDrawer'
import Game from './components/Game'
import ResetBubbleArea from './components/ResetBubbleArea'
import Drawer from './components/Drawer'
import Toolbar from './components/Toolbar'

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
    resetGameHandler,
    undoMoveHandler,
    suggestMoveHandler,
    showPreviousMoveHandler,
    pieceDroppedHandler,
    pieceDragHandler,
    squareTappedHandler,
    canDragPieceHandler,
  } = useGame()

  const { isOpen, mode, openDrawer, closeDrawer } = useDrawer()

  // The peek strip always shows the four quick-action buttons.
  // When sub-mode controls are added (Phase 5/6), this will switch
  // based on `mode` and the peekContentKey will change to trigger
  // the cross-fade transition.
  const peekContent = (
    <Toolbar
      resetGameHandler={resetGameHandler}
      undoMoveHandler={undoMoveHandler}
      suggestMoveHandler={suggestMoveHandler}
      showPreviousMoveHandler={showPreviousMoveHandler}
    />
  )

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
        isOpen={isOpen}
        onOpen={openDrawer}
        onClose={closeDrawer}
        peekContent={peekContent}
        peekContentKey={mode}
      />
    </div>
  )
}

export default App
