# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start local dev server (Vite HMR)
npm run build     # Type-check + production build (output: dist/)
npm run lint      # ESLint
npm run preview   # Serve the production build locally
```

There is no test suite.

## Architecture

**Stack:** React 19, TypeScript, Vite, styled-components, chess.js, react-chessboard v5.

The app is a single-page chess PWA. All logic lives in `src/`:

```
App.tsx                        — root; wires useGame → Game + Drawer
hooks/useGame.ts               — all game state, move logic, API calls, localStorage persistence
hooks/useDrawer.ts             — drawer open/close state and sub-mode (difficulty / color / history)
hooks/useTheme.ts              — React hook for reading/setting the active theme (wraps util/themes.ts)
context/PiecesContext.tsx      — provides react-chessboard piece renderers via context (avoids prop drilling)
components/Game.tsx            — chessboard rendering, board reset slide animation
components/Drawer.tsx          — high-level drawer: owns useDrawer, peek content switching, expanded content
components/DrawerShell.tsx     — low-level drawer: spring height animation, drag gesture, peek strip fade
components/DrawerQuickBar.tsx  — 4 quick-action buttons (New, Undo, Suggest, Prev) for default peek strip
components/DrawerExpanded.tsx  — expanded panel with Difficulty, Color, History buttons + CapturedPieces
components/DifficultyControl.tsx — difficulty slider (0–20) + Done; shown in peek strip during difficulty sub-mode
components/ColorControl.tsx    — White/Black/Random selector + Done; shown in peek strip during color sub-mode
components/HistoryControl.tsx  — move-history slider + Done; shown in peek strip during history sub-mode
components/CapturedPieces.tsx  — overlapping piece icons for each side's captures; shown in expanded panel
components/PieceImage.tsx      — renders a single piece SVG via PiecesContext at a given size
components/ResetBubbleArea / ResetBubble — mobile hold-to-reset interaction (unused; kept for potential future use)
components/CheckIndicator      — animated pill showing Check / Checkmate / Stalemate / Draw
components/Spinner             — shows while waiting for AI move
util/chessAPI.ts               — axios instance pointing at VITE_CHESS_API_BASE_URL
util/themes.ts                 — theme names (THEMES, Theme type), applyTheme, setTheme, getSavedTheme
```

### State flow

`useGame` is the single source of truth. It owns:

- `game` (`Chess` instance from chess.js) — current board
- `playerColor` (`'w' | 'b'`) — active color for the current game; persisted to `localStorage`
- `preferredColor` (`'w' | 'b' | 'random'`) — player's saved color preference; persisted to `localStorage` (key `preferred-color`); used when starting a new game
- `difficulty` (0–20) — engine strength (`skill_level`) sent to API; persisted to `localStorage` (key `difficulty`); defaults to `10`
- `focusedSquare` — highlighted square for tap-to-move
- `oldGameState` — snapshot of the previous game, used to drive the board-slide animation during reset
- `historyIndex` (`number | null`) — `null` = live game; a number = the move index being viewed (0 = start position)
- `isViewingHistory` — derived boolean; true when `historyIndex` is not null
- `historyDisplayFen` — computed FEN for the position at `historyIndex` (replays moves from scratch)
- `capturedByWhite` / `capturedByBlack` — string arrays of captured piece types, sorted by value, derived from move history

The main `useEffect` in `useGame` triggers on every game/color change: it persists to `localStorage` and POSTs to `/suggest-move` (with `skill_level: difficulty`) when it's the opponent's turn.

### Board reset animation

1. `resetGameHandler` sets `oldGameState` to the current FEN + orientation.
2. `Game.tsx` renders two boards side-by-side (old on left, new on right) inside a `ChessboardContainer`.
3. `isResettingBoard` triggers a CSS `translateX` transition sliding the old board out to the left.
4. After 500 ms, `oldGameState` and `isResettingBoard` are cleared.
5. On reset, `playerColor` is resolved from `preferredColor` (or randomly if set to `'random'`).

### External API

`VITE_CHESS_API_BASE_URL` (set in `.env.local`) points to the chess engine backend. The app calls `POST /suggest-move` with `{ fen: string, skill_level: number }` and expects `{ best_move: string }` in UCI notation (e.g. `"e2e4"`). Default fallback is `http://localhost:8000`.

### React Compiler

The project uses the React Compiler via `babel-plugin-react-compiler` (configured in `vite.config.ts`). Avoid manual `useMemo`/`useCallback` — the compiler handles memoization automatically.

## Bottom drawer

A spring-animated bottom drawer (react-spring + @use-gesture/react) that is the primary control surface. The implementation is split across two components:

- **`DrawerShell`** — handles only the spring height animation, drag gesture, and structural layout (drag bar, peek strip clip, expanded slot). Stateless; driven entirely by props.
- **`Drawer`** — owns `useDrawer`, `pendingColor`, and all content-switching logic. Renders `DrawerShell` with the appropriate peek content and expanded panel.

### Structure

- **Drag bar** — always visible at the top; dragging up/down opens/closes the drawer
- **Peek strip** (~72 px) — always visible; content changes based on `DrawerMode`
- **Expanded panel** (~380 px total height) — revealed when drawer is open; shows settings

### Peek strip modes (`DrawerMode`)

| Mode           | Peek strip content                                                            |
| -------------- | ----------------------------------------------------------------------------- |
| `'default'`    | 4 quick-action buttons: New Game, Undo Move, Suggest Move, Show Previous Move |
| `'difficulty'` | Difficulty slider (0–20) + Done button                                        |
| `'color'`      | White / Black / Random selector + Done button                                 |
| `'history'`    | Move-history slider (0 – N moves) + Done button                               |

Mode changes trigger a cross-fade: `peekContentKey={mode}` forces a React remount, and the incoming content fades in via a `useSpring`.

### Sub-mode flow

Tapping a settings button in the expanded panel calls `enterSubMode('difficulty' | 'color' | 'history')`, which closes the drawer and swaps the peek strip to the inline control. The expanded panel buttons show the current saved value (e.g. "Change Difficulty · 10", "Switch Color · White", "View History · 12 moves"). Tapping "Done" calls `exitSubMode()`, returning to the default quick-bar.

- **Difficulty Done** — exits sub-mode; the chosen level is already live via controlled slider state.
- **Color Done** — calls `resetWithColor(pendingColor)`, which saves the preference to `localStorage` and starts a new game with that color, then exits sub-mode.
- **History Done** — calls `exitHistoryView()` to return to the live game, then exits sub-mode. While in history mode, the board in `Game.tsx` displays `historyDisplayFen` instead of the live position; moves are blocked (`isViewingHistory` guard).


## Design philosophy

The intended feel is a casual coffee-shop chess game — unhurried, visually calm. Prioritize smooth animations and clean aesthetics over feature density.

### Color system

All color tokens are CSS custom properties defined in `index.css`. Never hardcode color values — always use the `var(--color-*)` tokens.

Six themes are available: **Forest** (default), Slate, Walnut, Dusk, Stone, Moss. Each theme defines its own light-mode token values via `[data-theme="name"]` on `<html>`, and a `@media (prefers-color-scheme: dark)` block inside that selector for dark mode. Forest is the `:root` default (no attribute needed).

To switch themes programmatically, use `setTheme(name)` from `util/themes.ts` (persists to `localStorage`) or `useTheme()` from `hooks/useTheme.ts` (React state + persistence). The saved theme is applied synchronously in `main.tsx` before the first render to avoid a flash.
