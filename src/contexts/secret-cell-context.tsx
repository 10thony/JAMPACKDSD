import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

interface SecretCellContextType {
  secretCell: { row: number; col: number } | null
  gridSize: { rows: number; cols: number }
  setSecretCell: (cell: { row: number; col: number } | null) => void
  calculateGridSize: () => void
}

const SecretCellContext = createContext<SecretCellContextType | undefined>(undefined)

export function SecretCellProvider({ children }: { children: ReactNode }) {
  const [gridSize, setGridSize] = useState({ rows: 0, cols: 0 })
  const [secretCell, setSecretCellState] = useState<{ row: number; col: number } | null>(null)

  const calculateGridSize = useCallback(() => {
    const width = window.innerWidth
    const height = window.innerHeight
    const cellSize = 50 // 50px per cell
    
    const cols = Math.floor(width / cellSize)
    const rows = Math.floor(height / cellSize)
    
    setGridSize({ rows, cols })
  }, [])

  // Load secret cell from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('snake-secret-cell')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSecretCellState(parsed)
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [])

  // Save secret cell to localStorage whenever it changes
  useEffect(() => {
    if (secretCell) {
      localStorage.setItem('snake-secret-cell', JSON.stringify(secretCell))
    }
  }, [secretCell])

  const setSecretCell = (cell: { row: number; col: number } | null) => {
    setSecretCellState(cell)
  }

  return (
    <SecretCellContext.Provider value={{ secretCell, gridSize, setSecretCell, calculateGridSize }}>
      {children}
    </SecretCellContext.Provider>
  )
}

export function useSecretCell() {
  const context = useContext(SecretCellContext)
  if (context === undefined) {
    throw new Error('useSecretCell must be used within a SecretCellProvider')
  }
  return context
}

