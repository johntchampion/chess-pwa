import { useState } from 'react'
import type { ColorChoice } from '../hooks/useGame'
import useDrawer from '../hooks/useDrawer'
import DrawerShell from './DrawerShell'
import DrawerQuickBar from './DrawerQuickBar'
import DrawerExpanded from './DrawerExpanded'
import DifficultyControl from './DifficultyControl'
import ColorControl from './ColorControl'
import HistoryControl from './HistoryControl'

interface DrawerProps {
  difficulty: number
  setDifficulty: (value: number) => void
  preferredColor: ColorChoice
  historyLength: number
  historyIndex: number | null
  capturedByWhite: string[]
  capturedByBlack: string[]
  enterHistoryView: () => void
  exitHistoryView: () => void
  setHistoryIndex: (index: number) => void
  resetGameHandler: () => void
  resetWithColor: (color: ColorChoice) => void
  undoMoveHandler: () => void
  suggestMoveHandler: () => void
  showPreviousMoveHandler: () => void
}

const Drawer = ({
  difficulty,
  setDifficulty,
  preferredColor,
  historyLength,
  historyIndex,
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
}: DrawerProps) => {
  const { isOpen, mode, openDrawer, closeDrawer, enterSubMode, exitSubMode } =
    useDrawer()

  const [pendingColor, setPendingColor] = useState<ColorChoice>(preferredColor)

  const handleColorDone = () => {
    resetWithColor(pendingColor)
    exitSubMode()
  }

  const handleHistoryDone = () => {
    exitHistoryView()
    exitSubMode()
  }

  const peekContent = (() => {
    if (mode === 'difficulty') {
      return (
        <DifficultyControl
          difficulty={difficulty}
          onChange={setDifficulty}
          onDone={exitSubMode}
        />
      )
    }
    if (mode === 'color') {
      return (
        <ColorControl
          selected={pendingColor}
          onChange={setPendingColor}
          onDone={handleColorDone}
        />
      )
    }
    if (mode === 'history') {
      return (
        <HistoryControl
          historyIndex={historyIndex ?? historyLength}
          historyLength={historyLength}
          onChange={setHistoryIndex}
          onDone={handleHistoryDone}
        />
      )
    }
    return (
      <DrawerQuickBar
        onNewGame={resetGameHandler}
        onUndo={undoMoveHandler}
        onSuggest={suggestMoveHandler}
        onShowPrev={showPreviousMoveHandler}
      />
    )
  })()

  const expandedContent = (
    <DrawerExpanded
      difficulty={difficulty}
      preferredColor={preferredColor}
      historyLength={historyLength}
      capturedByWhite={capturedByWhite}
      capturedByBlack={capturedByBlack}
      onChangeDifficulty={() => enterSubMode('difficulty')}
      onSwitchColor={() => {
        setPendingColor(preferredColor)
        enterSubMode('color')
      }}
      onViewHistory={() => {
        enterHistoryView()
        enterSubMode('history')
      }}
    />
  )

  return (
    <DrawerShell
      isOpen={isOpen}
      onOpen={openDrawer}
      onClose={closeDrawer}
      peekContent={peekContent}
      peekContentKey={mode}
      expandedContent={expandedContent}
    />
  )
}

export default Drawer
