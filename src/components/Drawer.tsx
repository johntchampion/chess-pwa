import { useState } from 'react'
import type { ColorChoice } from '../hooks/useGame'
import useDrawer from '../hooks/useDrawer'
import useTheme from '../hooks/useTheme'
import DrawerShell from './DrawerShell'
import DrawerQuickBar from './DrawerQuickBar'
import DrawerExpanded from './DrawerExpanded'
import DifficultyControl from './DifficultyControl'
import ColorControl from './ColorControl'
import HistoryControl from './HistoryControl'
import ThemeControl from './ThemeControl'

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
  isSuggestLoading: boolean
  isPrevLoading: boolean
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
  isSuggestLoading,
  isPrevLoading,
}: DrawerProps) => {
  const { isOpen, mode, openDrawer, closeDrawer, enterSubMode, exitSubMode } =
    useDrawer()

  const { theme, setTheme } = useTheme()
  const [pendingColor, setPendingColor] = useState<ColorChoice>(preferredColor)

  const handleColorDone = () => {
    if (pendingColor !== preferredColor) {
      resetWithColor(pendingColor)
    }
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
    if (mode === 'theme') {
      return (
        <ThemeControl
          selected={theme}
          onChange={setTheme}
          onDone={exitSubMode}
        />
      )
    }
    return (
      <DrawerQuickBar
        onNewGame={() => { closeDrawer(); resetGameHandler() }}
        onUndo={() => { closeDrawer(); undoMoveHandler() }}
        onSuggest={() => { closeDrawer(); suggestMoveHandler() }}
        onShowPrev={() => { closeDrawer(); showPreviousMoveHandler() }}
        isSuggestLoading={isSuggestLoading}
        isPrevLoading={isPrevLoading}
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
      onChangeTheme={() => enterSubMode('theme')}
      theme={theme}
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
