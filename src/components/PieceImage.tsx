import { usePieces } from '../context/PiecesContext'

interface PieceImageProps {
  /** Piece key in react-chessboard format: color + uppercase type, e.g. 'wP', 'bN' */
  pieceKey: string
  size?: number
}

const PieceImage = ({ pieceKey, size = 28 }: PieceImageProps) => {
  const pieces = usePieces()
  const PieceComponent = pieces[pieceKey]
  if (!PieceComponent) return null
  return (
    <div style={{ width: size, height: size, flexShrink: 0 }}>
      <PieceComponent svgStyle={{ width: '100%', height: '100%' }} />
    </div>
  )
}

export default PieceImage
