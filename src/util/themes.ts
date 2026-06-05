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

const THEME_ICONS: Record<Theme, string> = {
  forest: '/icons/iconForest192.png',
  slate:  '/icons/iconSlate192.png',
  walnut: '/icons/iconWalnut192.png',
  dusk:   '/icons/iconDusk192.png',
  stone:  '/icons/iconStone192.png',
  moss:   '/icons/iconMoss192.png',
}

export function applyTheme(theme: Theme): void {
  if (theme === 'forest') {
    document.documentElement.removeAttribute('data-theme')
  } else {
    document.documentElement.dataset.theme = theme
  }
  const link = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]')
  if (link) link.href = THEME_ICONS[theme]
}

export function setTheme(theme: Theme): void {
  applyTheme(theme)
  localStorage.setItem('theme', theme)
}

export function getSavedTheme(): Theme {
  const saved = localStorage.getItem('theme') as Theme | null
  return saved && (THEMES as readonly string[]).includes(saved) ? saved : 'forest'
}
