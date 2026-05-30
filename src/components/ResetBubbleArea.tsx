// Unused — removed from App.tsx in favour of DrawerQuickBar "New Game" button.
// Kept intentionally; no current plan to reinstate it.
import { useState } from 'react'
import styled from 'styled-components'
import ResetBubble from './ResetBubble'

interface ResetBubbleAreaProps {
  onBubblePopped: () => void
}

interface Coordinates {
  x: number
  y: number
}

const Area = styled.div`
  height: 8rem;
  position: relative;

  @media (min-width: 40rem) {
    display: none;
  }
`

const ResetBubbleArea = ({ onBubblePopped }: ResetBubbleAreaProps) => {
  const [coordinates, setCoordinates] = useState<Coordinates | undefined>(
    undefined,
  )

  const mouseDownHandler = (event: React.MouseEvent) => {
    setCoordinates({ x: event.clientX, y: event.clientY })
  }

  const touchStartHandler = (event: React.TouchEvent) => {
    console.log(event)
    const x = event.changedTouches[0].clientX
    const y = event.changedTouches[0].clientY
    setCoordinates({ x, y })
  }

  const endHandler = () => {
    setCoordinates(undefined)
  }

  return (
    <Area
      onMouseDown={mouseDownHandler}
      onMouseUp={endHandler}
      onTouchStart={touchStartHandler}
      onTouchEnd={endHandler}
    >
      {coordinates && (
        <ResetBubble
          onBubblePopped={onBubblePopped}
          coordinates={coordinates}
        />
      )}
    </Area>
  )
}

export default ResetBubbleArea
