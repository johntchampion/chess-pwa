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
App.tsx              — root; wires useGame → Game + reset UI
hooks/useGame.ts     — all game state, move logic, API calls, localStorage persistence
components/Game.tsx  — chessboard rendering, board reset slide animation
components/ResetBubbleArea / ResetBubble — mobile hold-to-reset interaction
components/Toolbar   — desktop "New" button (hidden on mobile)
components/CheckIndicator — animated pill showing Check / Checkmate / Stalemate / Draw
components/Spinner   — shows while waiting for AI move
util/chessAPI.ts     — axios instance pointing at VITE_CHESS_API_BASE_URL
```

### State flow

`useGame` is the single source of truth. It owns:
- `game` (`Chess` instance from chess.js) — current board
- `playerColor` (`'w' | 'b'`) — assigned randomly each game; persisted to `localStorage`
- `focusedSquare` — highlighted square for tap-to-move
- `oldGameState` — snapshot of the previous game, used to drive the board-slide animation during reset

The main `useEffect` in `useGame` triggers on every game state change: it loads saved state on first mount, persists to `localStorage`, and POSTs to `/suggest-move` when it's the opponent's turn.

### Board reset animation

1. `resetGameHandler` sets `oldGameState` to the current FEN + orientation.
2. `Game.tsx` renders two boards side-by-side (old on left, new on right) inside a `ChessboardContainer`.
3. `isResettingBoard` triggers a CSS `translateX` transition sliding the old board out to the left.
4. After 500 ms, `oldGameState` and `isResettingBoard` are cleared.

### Responsive breakpoint

Everything above `40rem` is "desktop". Below that is "mobile". The `Toolbar` (button) is desktop-only; `ResetBubbleArea` is mobile-only.

### External API

`VITE_CHESS_API_BASE_URL` (set in `.env.local`) points to the chess engine backend. The app calls `POST /suggest-move` with `{ fen: string }` and expects `{ best_move: string }` in UCI notation (e.g. `"e2e4"`). Default fallback is `http://localhost:8000`.

### React Compiler

The project uses the React Compiler via `babel-plugin-react-compiler` (configured in `vite.config.ts`). Avoid manual `useMemo`/`useCallback` — the compiler handles memoization automatically.

## In-progress feature: bottom drawer

A spring-animated bottom drawer (react-spring + @use-gesture/react) that replaces the current Toolbar as the primary control surface on mobile. It is a controlled component driven by `useDrawer` (`hooks/useDrawer.ts`).

### Structure

- **Drag bar** — always visible at the top; dragging up/down opens/closes the drawer
- **Peek strip** (~72 px) — always visible; content changes based on `DrawerMode`
- **Expanded panel** (~380 px total height) — revealed when drawer is open; shows settings

### Peek strip modes (`DrawerMode`)

| Mode | Peek strip content |
|---|---|
| `'default'` | 4 quick-action buttons: New Game, Undo Move, Suggest Move, Show Previous Move |
| `'difficulty'` | Difficulty slider (1–8) + Done button |
| `'color'` | White / Black / Random selector + Done button |

Mode changes trigger a cross-fade: `peekContentKey={mode}` forces a React remount, and the incoming content fades in via a `useSpring`.

### Sub-mode flow

Tapping a settings control in the expanded panel calls `enterSubMode('difficulty' | 'color')`, which closes the drawer and swaps the peek strip to the inline control. Tapping "Done" calls `exitSubMode()`, returning to the default quick-bar closed state.

### Expanded panel content (when open)

- "Change Difficulty" button → `enterSubMode('difficulty')`
- "Switch Color" button → `enterSubMode('color')`
- Captured pieces display — parsed from `game.history({ verbose: true })`

### Progress

- [x] `Drawer.tsx` — spring height animation, drag gesture, peek strip fade
- [x] `useDrawer.ts` — open/close state, mode, `enterSubMode`, `exitSubMode`
- [x] `App.tsx` — wired to `useGame` + `useDrawer`; `Toolbar` used as placeholder peek content
- [ ] `DrawerQuickBar` — the 4 default quick-action buttons for the peek strip
- [ ] `DrawerExpanded` — expanded panel with Difficulty/Color buttons + captured pieces
- [ ] `DifficultyControl` — slider (1–8) + Done; replaces peek strip in `'difficulty'` mode
- [ ] `ColorControl` — White/Black/Random + Done; replaces peek strip in `'color'` mode
- [ ] `CapturedPieces` — Unicode piece symbols parsed from verbose move history
- [ ] Wire `difficulty` value to the `/suggest-move` API call (pending backend support)
- [ ] Remove `ResetBubbleArea` once `DrawerQuickBar` "New Game" button is in place

## Design philosophy

The intended feel is a casual coffee-shop chess game — unhurried, visually calm. Prioritize smooth animations and clean aesthetics over feature density. Background color is `#283228` (dark green). All interactive chess UI is white on dark.
