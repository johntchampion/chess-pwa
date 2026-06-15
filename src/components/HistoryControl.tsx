import { useEffect, useState } from 'react'
import styled from 'styled-components'
import Button from './Button'

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

  const label =
    historyIndex === 0 ? 'Start' : `${historyIndex}/${historyLength}`
  const atLivePosition = historyIndex === historyLength

  const handleReplay = () => {
    if (atLivePosition) {
      onChange(0)
      setIsReplaying(true)
    } else {
      setIsReplaying((r) => !r)
    }
  }

  return (
    <Container>
      <SliderRow>
        <Label>{label}</Label>
        <Slider
          type='range'
          min={0}
          max={historyLength}
          value={historyIndex}
          onChange={(e) => onChange(Number(e.target.value))}
          onPointerDown={(e) => {
            e.stopPropagation()
            setIsReplaying(false)
          }}
        />
        <Button $variant='secondary' onClick={onDone}>
          Done
        </Button>
      </SliderRow>
      <ButtonRow>
        <Button $flex={1} onClick={handleReplay}>
          {isReplaying
            ? '⏸ Pause'
            : atLivePosition
              ? 'Replay From Start'
              : '▶ Play'}
        </Button>
        <Button
          $flex={1}
          onClick={handlePlayFromHere}
          disabled={atLivePosition}
        >
          Play From Here
        </Button>
      </ButtonRow>
    </Container>
  )
}

export default HistoryControl
