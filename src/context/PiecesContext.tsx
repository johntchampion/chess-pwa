import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import { defaultPieces } from 'react-chessboard'
import type { PieceRenderObject } from 'react-chessboard'

export type { PieceRenderObject }

const PiecesContext = createContext<PieceRenderObject>(defaultPieces)

export const PiecesProvider = ({
  pieces = defaultPieces,
  children,
}: {
  pieces?: PieceRenderObject
  children: ReactNode
}) => <PiecesContext.Provider value={pieces}>{children}</PiecesContext.Provider>

export const usePieces = () => useContext(PiecesContext)
