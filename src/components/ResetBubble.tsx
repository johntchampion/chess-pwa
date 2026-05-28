import { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'

interface ResetBubbleProps {
  onBubblePopped: () => void
  coordinates: { x: number; y: number }
}

const pop = keyframes`
0% {
    border: 20px solid white;
    background-color: white;
    width: 120px;
    height: 120px;
}

50% {
    background-color: transparent;
}

100% {
    border: 1px solid white;
    background-color: transparent;
    width: 192px;
    height: 192px;
}
`

const Bubble = styled.div<{ $growing: boolean; $popping: boolean }>`
  display: inline-block;
  width: ${({ $growing }) => ($growing ? '120px' : '16px')};
  height: ${({ $growing }) => ($growing ? '120px' : '16px')};
  border-radius: 100px;
  background-color: ${({ $growing }) => ($growing ? 'white' : 'transparent')};
  transition: ${({ $popping }) =>
    $popping ? 'inherit' : 'width 1s ease, height 1s ease'};
  animation-name: ${({ $popping }) => ($popping ? pop : 'inherit')};
  animation-duration: 0.25s;
  animation-timing-function: ease-out;
  animation-delay: 0s;
  pointer-events: ${({ $popping }) => ($popping ? 'none' : 'inherit')};
  user-select: ${({ $popping }) => ($popping ? 'none' : 'inherit')};
`

const Container = styled.div<{ $x: number; $y: number }>`
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  width: 192px;
  height: 192px;
  top: ${({ $y }) => `${$y - 96}px`};
  left: ${({ $x }) => `${$x - 96}px`};
`

const ResetBubble = ({ onBubblePopped, coordinates }: ResetBubbleProps) => {
  const [touched, setTouched] = useState(true)
  const [popping, setPopping] = useState(false)

  useEffect(() => {
    if (touched) {
      const timeout = setTimeout(() => {
        setTouched(false)
        setPopping(true)
        onBubblePopped()
      }, 1000)

      return () => {
        clearTimeout(timeout)
      }
    }
  }, [touched, onBubblePopped])

  useEffect(() => {
    if (popping) {
      const timeout = setTimeout(() => {
        setPopping(false)
      }, 1000)

      return () => {
        clearTimeout(timeout)
      }
    }
  }, [popping])

  return (
    <Container $x={coordinates.x} $y={coordinates.y}>
      <Bubble $growing={touched} $popping={popping} />
    </Container>
  )
}

export default ResetBubble
