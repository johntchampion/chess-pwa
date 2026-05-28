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
hooks/useDrawer.ts             — drawer open/close state and sub-mode (difficulty / color)
components/Game.tsx            — chessboard rendering, board reset slide animation
components/Drawer.tsx          — high-level drawer: owns useDrawer, peek content switching, expanded content
components/DrawerShell.tsx     — low-level drawer: spring height animation, drag gesture, peek strip fade
components/DrawerQuickBar.tsx  — 4 quick-action buttons (New, Undo, Suggest, Prev) for default peek strip
components/DrawerExpanded.tsx  — expanded panel with Difficulty + Color setting buttons
components/DifficultyControl.tsx — difficulty slider (1–8) + Done; shown in peek strip during difficulty sub-mode
components/ColorControl.tsx    — White/Black/Random selector + Done; shown in peek strip during color sub-mode
components/ResetBubbleArea / ResetBubble — mobile hold-to-reset interaction
components/CheckIndicator      — animated pill showing Check / Checkmate / Stalemate / Draw
components/Spinner             — shows while waiting for AI move
util/chessAPI.ts               — axios instance pointing at VITE_CHESS_API_BASE_URL
```

### State flow

`useGame` is the single source of truth. It owns:

- `game` (`Chess` instance from chess.js) — current board
- `playerColor` (`'w' | 'b'`) — active color for the current game; persisted to `localStorage`
- `preferredColor` (`'w' | 'b' | 'random'`) — player's saved color preference; persisted to `localStorage` (key `preferred-color`); used when starting a new game
- `difficulty` (1–8) — engine strength setting; persisted to `localStorage` (key `difficulty`); wired to API pending backend support
- `focusedSquare` — highlighted square for tap-to-move
- `oldGameState` — snapshot of the previous game, used to drive the board-slide animation during reset

The main `useEffect` in `useGame` triggers on every game/color change: it persists to `localStorage` and POSTs to `/suggest-move` when it's the opponent's turn.

### Board reset animation

1. `resetGameHandler` sets `oldGameState` to the current FEN + orientation.
2. `Game.tsx` renders two boards side-by-side (old on left, new on right) inside a `ChessboardContainer`.
3. `isResettingBoard` triggers a CSS `translateX` transition sliding the old board out to the left.
4. After 500 ms, `oldGameState` and `isResettingBoard` are cleared.
5. On reset, `playerColor` is resolved from `preferredColor` (or randomly if set to `'random'`).

### Responsive breakpoint

Everything above `40rem` is "desktop". Below that is "mobile". `ResetBubbleArea` is mobile-only.

### External API

`VITE_CHESS_API_BASE_URL` (set in `.env.local`) points to the chess engine backend. The app calls `POST /suggest-move` with `{ fen: string }` and expects `{ best_move: string }` in UCI notation (e.g. `"e2e4"`). Default fallback is `http://localhost:8000`.

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
| `'difficulty'` | Difficulty slider (1–8) + Done button                                         |
| `'color'`      | White / Black / Random selector + Done button                                 |

Mode changes trigger a cross-fade: `peekContentKey={mode}` forces a React remount, and the incoming content fades in via a `useSpring`.

### Sub-mode flow

Tapping a settings button in the expanded panel calls `enterSubMode('difficulty' | 'color')`, which closes the drawer and swaps the peek strip to the inline control. The expanded panel buttons show the current saved value (e.g. "Change Difficulty · 5", "Switch Color · White"). Tapping "Done" calls `exitSubMode()`, returning to the default quick-bar.

- **Difficulty Done** — exits sub-mode; the chosen level is already live via controlled slider state.
- **Color Done** — calls `resetWithColor(pendingColor)`, which saves the preference to `localStorage` and starts a new game with that color, then exits sub-mode.

### Remaining work

- [ ] `CapturedPieces` — Unicode piece symbols parsed from verbose move history, shown in expanded panel
- [ ] Wire `difficulty` to the `/suggest-move` API call (pending backend support)
- [ ] Remove `ResetBubbleArea` once `DrawerQuickBar` "New Game" button is confirmed sufficient

## Design philosophy

The intended feel is a casual coffee-shop chess game — unhurried, visually calm. Prioritize smooth animations and clean aesthetics over feature density. Background color is `#283228` (dark green). All interactive chess UI is white on dark.
