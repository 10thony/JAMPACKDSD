import { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSecretCell } from "@/contexts/secret-cell-context"

export function SnakeGameSettings() {
  const { secretCell, gridSize, setSecretCell } = useSecretCell()
  const [row, setRow] = useState(secretCell?.row ?? 0)
  const [col, setCol] = useState(secretCell?.col ?? 0)

  const handleSave = () => {
    if (row >= 0 && row < gridSize.rows && col >= 0 && col < gridSize.cols) {
      setSecretCell({ row, col })
    }
  }

  const handleRandom = () => {
    const randomRow = Math.floor(Math.random() * gridSize.rows)
    const randomCol = Math.floor(Math.random() * gridSize.cols)
    setRow(randomRow)
    setCol(randomCol)
    setSecretCell({ row: randomRow, col: randomCol })
  }

  const handleClear = () => {
    setSecretCell(null)
    setRow(0)
    setCol(0)
  }

  // Update local state when secret cell changes externally
  const updateFromContext = () => {
    if (secretCell) {
      setRow(secretCell.row)
      setCol(secretCell.col)
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-medium mb-2">Snake Game Secret Cell</h2>
          <p className="text-sm text-muted-foreground">
            Configure the hidden cell that triggers the snake game Easter egg when clicked.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="row">Row (0-{gridSize.rows - 1})</Label>
            <Input
              id="row"
              type="number"
              min="0"
              max={gridSize.rows - 1}
              value={row}
              onChange={(e) => setRow(parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>

          <div>
            <Label htmlFor="col">Column (0-{gridSize.cols - 1})</Label>
            <Input
              id="col"
              type="number"
              min="0"
              max={gridSize.cols - 1}
              value={col}
              onChange={(e) => setCol(parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleSave}>
            Save Cell
          </Button>
          <Button onClick={handleRandom} variant="outline">
            Random
          </Button>
          <Button onClick={handleClear} variant="outline">
            Clear
          </Button>
          <Button onClick={updateFromContext} variant="ghost" size="sm">
            Reset from Current
          </Button>
        </div>

        <div className="text-sm text-muted-foreground space-y-1 pt-2 border-t">
          <p>
            <strong>Current secret cell:</strong> {
              secretCell ? `Row ${secretCell.row}, Column ${secretCell.col}` : 'Not set'
            }
          </p>
          <p>
            <strong>Grid size:</strong> {gridSize.rows} rows × {gridSize.cols} columns
          </p>
        </div>
      </div>
    </Card>
  )
}

