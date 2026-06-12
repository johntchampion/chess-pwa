import { useEffect, useState } from 'react'
import styled from 'styled-components'

interface HistoryControlProps {
  historyIndex: number
  historyLength: number
  onChange: (index: number) => void
  onDone: () => void
  onPlayFromHere: (index: number) => void
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 12px 16px;
  gap: 8px;
`

const SliderRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`

const ButtonRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

const Label = styled.span`
  color: var(--color-text-accent);
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
  min-width: 6ch;
`

const Slider = styled.input`
  flex: 1;
  accent-color: var(--color-text-accent);
  cursor: pointer;
`

const ActionButton = styled.button<{ $flex?: number }>`
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
  flex: ${({ $flex }) => $flex ?? 0};

  &:active {
    opacity: 0.5;
  }

  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
`

const REPLAY_INTERVAL_MS = 700

const HistoryControl = ({
  historyIndex,
  historyLength,
  onChange,
  onDone,
  onPlayFromHere,
}: HistoryControlProps) => {
  const [isReplaying, setIsReplaying] = useState(false)

  useEffect(() => {
    if (!isReplaying) return
    if (historyIndex >= historyLength) {
      setIsReplaying(false)
      return
    }
    const id = setTimeout(() => onChange(historyIndex + 1), REPLAY_INTERVAL_MS)
    return () => clearTimeout(id)
  }, [isReplaying, historyIndex, historyLength, onChange])

  const handlePlayFromHere = () => {
    setIsReplaying(false)
    onPlayFromHere(historyIndex)
  }

  const label = historyIndex === 0 ? 'Start' : `${historyIndex}/${historyLength}`
  const atEnd = historyIndex >= historyLength
  const atLivePosition = historyIndex === historyLength

  return (
    <Container>
      <SliderRow>
        <Label>{label}</Label>
        <Slider
          type="range"
          min={0}
          max={historyLength}
          value={historyIndex}
          onChange={(e) => onChange(Number(e.target.value))}
          onPointerDown={(e) => {
            e.stopPropagation()
            setIsReplaying(false)
          }}
        />
        <ActionButton onClick={onDone}>Done</ActionButton>
      </SliderRow>
      <ButtonRow>
        <ActionButton
          $flex={1}
          onClick={() => setIsReplaying((r) => !r)}
          disabled={atEnd && !isReplaying}
        >
          {isReplaying ? '⏸ Pause' : '▶ Play'}
        </ActionButton>
        <ActionButton
          $flex={2}
          onClick={handlePlayFromHere}
          disabled={atLivePosition}
        >
          Play From Here
        </ActionButton>
      </ButtonRow>
    </Container>
  )
}

export default HistoryControl
