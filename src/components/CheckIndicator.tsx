import { useRef } from 'react'
import styled from 'styled-components'

interface CheckIndicatorProps {
  check: boolean
  checkmate: boolean
  stalemate: boolean
  draw: boolean
}

const Indicator = styled.div<{ $showing: boolean }>`
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  color: white;
  background-color: gray;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 100px;
  padding: 0 8px;
  height: 1.5rem;
  transform: ${({ $showing }) =>
    $showing ? 'translateX(0)' : 'translateX(-50px)'};
  opacity: ${({ $showing }) => ($showing ? '100%' : '0')};
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;

  @media (min-width: 40rem) {
    font-size: 1rem;
    height: 2rem;
  }
`

const CheckIndicator = ({
  check,
  checkmate,
  stalemate,
  draw,
}: CheckIndicatorProps) => {
  const lastTextRef = useRef('Check')

  const showing = check || checkmate || stalemate || draw

  if (showing) {
    if (draw) lastTextRef.current = 'Draw'
    if (check) lastTextRef.current = 'Check'
    if (checkmate) lastTextRef.current = 'Checkmate'
    if (stalemate) lastTextRef.current = 'Stalemate'
  }

  return <Indicator $showing={showing}>{lastTextRef.current}</Indicator>
}

export default CheckIndicator
