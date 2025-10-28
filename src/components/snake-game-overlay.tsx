import { useEffect, useState, useCallback, useRef } from 'react'
import { X, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SnakeGameOverlayProps {
  onClose: () => void
  gridSize: { rows: number; cols: number }
}

type Position = { x: number; y: number }
type Direction = 'up' | 'down' | 'left' | 'right'

export function SnakeGameOverlay({ onClose, gridSize }: SnakeGameOverlayProps) {
  // Initialize positions based on grid size
  const initialSnake = [{ x: Math.floor(gridSize.cols / 2), y: Math.floor(gridSize.rows / 2) }]
  const initialApple = { 
    x: Math.floor(gridSize.cols / 2) + 5, 
    y: Math.floor(gridSize.rows / 2) 
  }

  const [snake, setSnake] = useState<Position[]>(initialSnake)
  const [direction, setDirection] = useState<Direction>('right')
  const [apple, setApple] = useState<Position>(initialApple)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [traversedCells, setTraversedCells] = useState<Set<string>>(new Set())
  
  const directionRef = useRef<Direction>(direction)
  const gameSpeedRef = useRef(150) // Speed in ms
  const snakeRef = useRef<Position[]>(initialSnake)
  const appleRef = useRef<Position>(initialApple)
  const traversedCellsRef = useRef<Set<string>>(new Set())

  // Update refs when state changes
  useEffect(() => {
    directionRef.current = direction
  }, [direction])

  useEffect(() => {
    snakeRef.current = snake
  }, [snake])

  useEffect(() => {
    appleRef.current = apple
  }, [apple])

  useEffect(() => {
    traversedCellsRef.current = traversedCells
  }, [traversedCells])

  // Reset game function
  const resetGame = useCallback(() => {
    setSnake(initialSnake)
    setDirection('right')
    setApple(initialApple)
    setGameOver(false)
    setScore(0)
    setTraversedCells(new Set())
    gameSpeedRef.current = 150
    snakeRef.current = initialSnake
    appleRef.current = initialApple
  }, [initialSnake, initialApple])

  // Check for collisions
  const checkCollision = useCallback((head: Position): boolean => {
    // Wall collision
    if (head.x < 0 || head.x >= gridSize.cols || head.y < 0 || head.y >= gridSize.rows) {
      return true
    }
    // Self collision
    for (let i = 1; i < snakeRef.current.length; i++) {
      if (head.x === snakeRef.current[i].x && head.y === snakeRef.current[i].y) {
        return true
      }
    }
    // Traversed cell collision
    const headKey = `${head.x},${head.y}`
    if (traversedCellsRef.current.has(headKey)) {
      return true
    }
    return false
  }, [gridSize])

  // Generate new apple position
  const generateApple = useCallback(() => {
    // Find all available positions (not occupied by snake or traversed)
    const occupied = new Set<string>()
    snakeRef.current.forEach(segment => occupied.add(`${segment.x},${segment.y}`))
    // Also exclude traversed cells
    traversedCellsRef.current.forEach(cell => occupied.add(cell))
    
    const available: Position[] = []
    for (let x = 0; x < gridSize.cols; x++) {
      for (let y = 0; y < gridSize.rows; y++) {
        const key = `${x},${y}`
        if (!occupied.has(key)) {
          available.push({ x, y })
        }
      }
    }
    
    if (available.length === 0) {
      // No available cells, place apple on a random cell
      return {
        x: Math.floor(Math.random() * gridSize.cols),
        y: Math.floor(Math.random() * gridSize.rows)
      }
    }
    
    const randomIndex = Math.floor(Math.random() * available.length)
    return available[randomIndex]
  }, [gridSize])

  // Game loop
  useEffect(() => {
    if (gameOver) {
      gameSpeedRef.current = 150 // Reset speed
      return
    }

    const moveSnake = () => {
      setSnake(prevSnake => {
        const newSnake = [...prevSnake]
        const head = { ...newSnake[0] }

        // Move head based on direction
        switch (directionRef.current) {
          case 'up':
            head.y -= 1
            break
          case 'down':
            head.y += 1
            break
          case 'left':
            head.x -= 1
            break
          case 'right':
            head.x += 1
            break
        }

        // Check collision
        if (checkCollision(head)) {
          setGameOver(true)
          return prevSnake
        }

        newSnake.unshift(head)

        // Check if apple was eaten
        if (head.x === appleRef.current.x && head.y === appleRef.current.y) {
          setScore(prev => prev + 1)
          const newApple = generateApple()
          appleRef.current = newApple
          setApple(newApple)
          // Don't remove tail (snake grows)
        } else {
          newSnake.pop()
        }

        // Track traversed cells
        setTraversedCells(prev => {
          const newSet = new Set(prev)
          newSet.add(`${head.x},${head.y}`)
          return newSet
        })

        return newSnake
      })
    }

    const intervalId = setInterval(moveSnake, gameSpeedRef.current)
    return () => clearInterval(intervalId)
  }, [gameOver, checkCollision, generateApple])

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver) return

      const key = e.key.toLowerCase()
      
      // Prevent direction reversal into self
      if (key === 'w' || key === 'arrowup') {
        if (directionRef.current !== 'down') setDirection('up')
      } else if (key === 's' || key === 'arrowdown') {
        if (directionRef.current !== 'up') setDirection('down')
      } else if (key === 'a' || key === 'arrowleft') {
        if (directionRef.current !== 'right') setDirection('left')
      } else if (key === 'd' || key === 'arrowright') {
        if (directionRef.current !== 'left') setDirection('right')
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [gameOver])

  const cellSize = Math.min(800 / gridSize.cols, 600 / gridSize.rows, 20)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-card border border-border rounded-lg p-6 shadow-2xl">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold mb-2">Snake Game</h2>
          <p className="text-sm text-muted-foreground mb-1">
            Score: <span className="font-bold text-foreground">{score}</span>
          </p>
          {gameOver && (
            <p className="text-red-500 font-semibold mt-2">Game Over!</p>
          )}
          <div className="mt-3 flex gap-2 justify-center">
            <Button onClick={resetGame} variant="outline" size="sm">
              <RotateCw className="h-4 w-4 mr-2" />
              Restart
            </Button>
          </div>
        </div>

        <div className="relative bg-muted/30 rounded-md overflow-hidden">
          <svg
            width={gridSize.cols * cellSize}
            height={gridSize.rows * cellSize}
            style={{ display: 'block' }}
          >
            {/* Grid lines */}
            {Array.from({ length: gridSize.cols + 1 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * cellSize}
                y1={0}
                x2={i * cellSize}
                y2={gridSize.rows * cellSize}
                stroke="currentColor"
                strokeWidth="1"
                className="text-border/30"
              />
            ))}
            {Array.from({ length: gridSize.rows + 1 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1={0}
                y1={i * cellSize}
                x2={gridSize.cols * cellSize}
                y2={i * cellSize}
                stroke="currentColor"
                strokeWidth="1"
                className="text-border/30"
              />
            ))}

            {/* Traversed cells (green body color) */}
            {Array.from(traversedCells).map(cell => {
              const [x, y] = cell.split(',').map(Number)
              return (
                <rect
                  key={`traversed-${cell}`}
                  x={x * cellSize}
                  y={y * cellSize}
                  width={cellSize}
                  height={cellSize}
                  fill="#22c55e"
                  opacity="0.3"
                />
              )
            })}

            {/* Snake body */}
            {snake.slice(1).map((segment, index) => (
              <rect
                key={`body-${index}`}
                x={segment.x * cellSize}
                y={segment.y * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#22c55e"
                rx="2"
              />
            ))}

            {/* Snake head */}
            {snake.length > 0 && (
              <rect
                x={snake[0].x * cellSize}
                y={snake[0].y * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#16a34a"
                rx="2"
              />
            )}

            {/* Apple */}
            <circle
              cx={apple.x * cellSize + cellSize / 2}
              cy={apple.y * cellSize + cellSize / 2}
              r={cellSize / 3}
              fill="#ef4444"
            />
          </svg>
        </div>

        <div className="mt-4 text-center text-sm text-muted-foreground">
          Use WASD or Arrow keys to move
        </div>
      </div>
    </div>
  )
}

