import styled from 'styled-components'
import useGame from './hooks/useGame'
import Game from './components/Game'
import Drawer from './components/Drawer'

const AppShell = styled.div`
  position: relative;
  height: 100%;
  overflow: hidden;
  background-color: var(--color-app-bg);

  @media (min-width: 40rem) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
`

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
    isSuggestLoading,
    isPrevLoading,
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
    <AppShell>
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
        isSuggestLoading={isSuggestLoading}
        isPrevLoading={isPrevLoading}
      />
    </AppShell>
  )
}

export default App
