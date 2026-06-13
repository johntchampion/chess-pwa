import styled from 'styled-components'
import Button from './Button'

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
  color: var(--color-text-accent);
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
  min-width: 5ch;
`

const Slider = styled.input`
  flex: 1;
  accent-color: var(--color-text-accent);
  cursor: pointer;
`

const DifficultyControl = ({
  difficulty,
  onChange,
  onDone,
}: DifficultyControlProps) => (
  <Container>
    <Label>Lvl {difficulty}</Label>
    <Slider
      type='range'
      min={0}
      max={20}
      value={difficulty}
      onChange={(e) => onChange(Number(e.target.value))}
      onPointerDown={(e) => e.stopPropagation()}
    />
    <Button $variant='secondary' onClick={onDone}>
      Done
    </Button>
  </Container>
)

export default DifficultyControl
