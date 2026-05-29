import styled from 'styled-components'

interface HistoryControlProps {
  historyIndex: number
  historyLength: number
  onChange: (index: number) => void
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
  color: #9ab89a;
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
  min-width: 6ch;
`

const Slider = styled.input`
  flex: 1;
  accent-color: #9ab89a;
  cursor: pointer;
`

const DoneButton = styled.button`
  color: #283228;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0 16px;
  height: 2.75rem;
  background-color: #ededed;
  border: none;
  cursor: pointer;
  border-radius: 1.375rem;
  white-space: nowrap;

  &:active {
    opacity: 0.5;
  }
`

const HistoryControl = ({ historyIndex, historyLength, onChange, onDone }: HistoryControlProps) => {
  const label = historyIndex === 0 ? 'Start' : `${historyIndex}/${historyLength}`

  return (
    <Container>
      <Label>{label}</Label>
      <Slider
        type="range"
        min={0}
        max={historyLength}
        value={historyIndex}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerDown={(e) => e.stopPropagation()}
      />
      <DoneButton onClick={onDone}>Done</DoneButton>
    </Container>
  )
}

export default HistoryControl
