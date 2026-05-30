import styled from 'styled-components'
import { theme } from '../theme'

interface DifficultyControlProps {
  difficulty: number
  onChange: (value: number) => void
  onDone: () => void
}

const Container = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 16px;
  gap: 12px;
`

const Label = styled.span`
  color: ${theme.textAccent};
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
  min-width: 5ch;
`

const Slider = styled.input`
  flex: 1;
  accent-color: ${theme.textAccent};
  cursor: pointer;
`

const DoneButton = styled.button`
  color: ${theme.btnText};
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0 16px;
  height: 2.75rem;
  background-color: ${theme.btnBg};
  border: none;
  cursor: pointer;
  border-radius: 1.375rem;
  white-space: nowrap;

  &:active {
    opacity: 0.5;
  }
`

const DifficultyControl = ({ difficulty, onChange, onDone }: DifficultyControlProps) => (
  <Container>
    <Label>Lvl {difficulty}</Label>
    <Slider
      type="range"
      min={1}
      max={8}
      value={difficulty}
      onChange={(e) => onChange(Number(e.target.value))}
      onPointerDown={(e) => e.stopPropagation()}
    />
    <DoneButton onClick={onDone}>Done</DoneButton>
  </Container>
)

export default DifficultyControl
