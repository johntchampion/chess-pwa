import styled from 'styled-components'
import PieceImage from './PieceImage'
import { theme } from '../theme'

export interface CapturedPiecesProps {
  capturedByWhite: string[]
  capturedByBlack: string[]
}

const PIECE_SIZE = 48
const OVERLAP = 28

const groupPieces = (pieces: string[]) => {
  const groups: { type: string; count: number }[] = []
  for (const p of pieces) {
    if (groups.length > 0 && groups[groups.length - 1].type === p) {
      groups[groups.length - 1].count++
    } else {
      groups.push({ type: p, count: 1 })
    }
  }
  return groups
}

const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 0 2px;
  border-top: 1px solid ${theme.divider};
`

const PieceRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0px;
  min-height: ${PIECE_SIZE}px;
`

const PieceGroupDiv = styled.div`
  display: flex;
  align-items: center;
`

interface RowProps {
  pieces: string[]
  colorPrefix: 'w' | 'b'
}

const CapturedRow = ({ pieces, colorPrefix }: RowProps) => (
  <PieceRow>
    {groupPieces(pieces).map((group, gi) => (
      <PieceGroupDiv key={gi}>
        {Array.from({ length: group.count }).map((_, i) => (
          <div key={i} style={{ marginLeft: i === 0 ? 0 : -OVERLAP, zIndex: i }}>
            <PieceImage
              pieceKey={`${colorPrefix}${group.type.toUpperCase()}`}
              size={PIECE_SIZE}
            />
          </div>
        ))}
      </PieceGroupDiv>
    ))}
  </PieceRow>
)

const CapturedPieces = ({ capturedByWhite, capturedByBlack }: CapturedPiecesProps) => {
  if (capturedByWhite.length === 0 && capturedByBlack.length === 0) return null

  return (
    <Section>
      {capturedByWhite.length > 0 && (
        <CapturedRow pieces={capturedByWhite} colorPrefix='b' />
      )}
      {capturedByBlack.length > 0 && (
        <CapturedRow pieces={capturedByBlack} colorPrefix='w' />
      )}
    </Section>
  )
}

export default CapturedPieces
