export const THEMES = ['forest', 'slate', 'walnut', 'dusk', 'stone', 'moss'] as const
export type Theme = typeof THEMES[number]

export const THEME_LABELS: Record<Theme, string> = {
  forest: 'Forest',
  slate: 'Slate',
  walnut: 'Walnut',
  dusk: 'Dusk',
  stone: 'Stone',
  moss: 'Moss',
}

export function applyTheme(theme: Theme): void {
  if (theme === 'forest') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.dataset.theme = theme
  }
}

export function setTheme(theme: Theme): void {
  applyTheme(theme)
  localStorage.setItem('theme', theme)
}

export function getSavedTheme(): Theme {
  const saved = localStorage.getItem('theme') as Theme | null
  return saved && (THEMES as readonly string[]).includes(saved) ? saved : 'forest'
}
