import styled from 'styled-components'
import type { ColorChoice } from '../hooks/useGame'

export type { ColorChoice }

interface ColorControlProps {
  selected: ColorChoice
  onChange: (color: ColorChoice) => void
  onDone: () => void
}

const Container = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 16px;
  gap: 8px;
`

const ColorButton = styled.button<{ $active: boolean }>`
  flex: 1;
  height: 2.5rem;
  border: 2px solid
    ${({ $active }) => ($active ? 'var(--color-chip-active-border)' : 'transparent')};
  border-radius: 1.25rem;
  background-color: ${({ $active }) =>
    $active ? 'var(--color-chip-active-bg)' : 'var(--color-chip-inactive-bg)'};
  color: ${({ $active }) =>
    $active ? 'var(--color-chip-active-text)' : 'var(--color-chip-inactive-text)'};
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  text-transform: uppercase;
  transition:
    background-color 0.15s,
    color 0.15s,
    border-color 0.15s;

  &:active {
    opacity: 0.7;
  }
`

const DoneButton = styled.button`
  color: var(--color-btn-text);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0 16px;
  height: 2.5rem;
  background-color: var(--color-btn-bg);
  border: none;
  cursor: pointer;
  border-radius: 1.25rem;
  white-space: nowrap;

  &:active {
    opacity: 0.5;
  }
`

const ColorControl = ({ selected, onChange, onDone }: ColorControlProps) => (
  <Container>
    <ColorButton $active={selected === 'w'} onClick={() => onChange('w')}>
      White
    </ColorButton>
    <ColorButton $active={selected === 'b'} onClick={() => onChange('b')}>
      Black
    </ColorButton>
    <ColorButton
      $active={selected === 'random'}
      onClick={() => onChange('random')}
    >
      Random
    </ColorButton>
    <DoneButton onClick={onDone}>Done</DoneButton>
  </Container>
)

export default ColorControl
