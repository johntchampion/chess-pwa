import { useState, useCallback } from 'react'
import { type Theme, THEMES, THEME_LABELS, setTheme as persistTheme, getSavedTheme } from '../util/themes'

export type { Theme }
export { THEMES, THEME_LABELS }

export default function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getSavedTheme)

  const setTheme = useCallback((next: Theme) => {
    persistTheme(next)
    setThemeState(next)
  }, [])

  return { theme, setTheme, themes: THEMES }
}
