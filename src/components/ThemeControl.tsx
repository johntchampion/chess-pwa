import styled from 'styled-components'
import { THEMES, THEME_LABELS, type Theme } from '../util/themes'

const THEME_SWATCHES: Record<Theme, { light: string; dark: string }> = {
  forest: { light: '#d5dab5', dark: '#4a6741' },
  slate:  { light: '#c9d8e8', dark: '#2d5a7a' },
  walnut: { light: '#e8c99a', dark: '#6b4226' },
  dusk:   { light: '#d8cce8', dark: '#5a3d78' },
  stone:  { light: '#d0cfc8', dark: '#4a4e52' },
  moss:   { light: '#cdd9c0', dark: '#587060' },
}

interface ThemeControlProps {
  selected: Theme
  onChange: (theme: Theme) => void
  onDone: () => void
}

const Container = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 16px;
  gap: 8px;
`

const SwatchButton = styled.button<{ $light: string; $dark: string; $active: boolean }>`
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  border: none;
  background: linear-gradient(
    135deg,
    ${({ $light }) => $light} 50%,
    ${({ $dark }) => $dark} 50%
  );
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: ${({ $active }) =>
    $active
      ? '0 0 0 2px var(--color-app-bg), 0 0 0 4px var(--color-btn-bg)'
      : 'inset 0 0 0 1px rgba(0,0,0,0.10)'};
  transition: box-shadow 0.15s;

  &:active {
    opacity: 0.75;
  }
`

const DoneButton = styled.button`
  color: var(--color-btn-text);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0 14px;
  height: 2.5rem;
  background-color: var(--color-btn-bg);
  border: none;
  cursor: pointer;
  border-radius: 1.25rem;
  white-space: nowrap;
  flex-shrink: 0;
  margin-left: auto;

  &:active {
    opacity: 0.5;
  }
`

const ThemeControl = ({ selected, onChange, onDone }: ThemeControlProps) => (
  <Container>
    {THEMES.map((theme) => {
      const { light, dark } = THEME_SWATCHES[theme]
      return (
        <SwatchButton
          key={theme}
          $light={light}
          $dark={dark}
          $active={selected === theme}
          title={THEME_LABELS[theme]}
          onClick={() => onChange(theme)}
        />
      )
    })}
    <DoneButton onClick={onDone}>Done</DoneButton>
  </Container>
)

export default ThemeControl
