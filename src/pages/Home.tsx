import { useState, useEffect } from 'react'
import { ProjectsGrid } from "@/components/projects-grid"
import { ProjectQuotesGrid } from "@/components/project-quotes-grid"
import { Hero } from "@/components/hero"
import { Navigation } from "@/components/navigation"
import { FloatingAddProject } from "@/components/floating-add-project"
import { SnakeGameOverlay } from "@/components/snake-game-overlay"
import { useSecretCell } from "@/contexts/secret-cell-context"

export default function Home() {
  const [showSnake, setShowSnake] = useState(false)
  const { secretCell, gridSize, setSecretCell, calculateGridSize } = useSecretCell()

  // Calculate grid size based on screen size
  useEffect(() => {
    calculateGridSize()
    window.addEventListener('resize', calculateGridSize)
    return () => window.removeEventListener('resize', calculateGridSize)
  }, [calculateGridSize])

  // Set initial secret cell if not already set
  useEffect(() => {
    if (!secretCell && gridSize.rows > 0 && gridSize.cols > 0) {
      setSecretCell({
        row: Math.floor(Math.random() * gridSize.rows),
        col: Math.floor(Math.random() * gridSize.cols)
      })
    }
  }, [secretCell, gridSize, setSecretCell])

  // Handle clicks anywhere on the page to check for secret cell
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (!secretCell || gridSize.rows === 0 || gridSize.cols === 0) return
      
      const cellWidth = window.innerWidth / gridSize.cols
      const cellHeight = window.innerHeight / gridSize.rows
      
      const col = Math.floor(e.clientX / cellWidth)
      const row = Math.floor(e.clientY / cellHeight)
      
      if (secretCell && col === secretCell.col && row === secretCell.row) {
        setShowSnake(true)
        // Reset secret cell so it can be triggered again if needed
        setSecretCell(null)
      }
    }

    document.addEventListener('click', handleDocumentClick)
    return () => document.removeEventListener('click', handleDocumentClick)
  }, [secretCell, gridSize, setSecretCell])

  // Calculate secret cell position for debugging
  const cellWidth = window.innerWidth / gridSize.cols
  const cellHeight = window.innerHeight / gridSize.rows
  const secretCellTop = secretCell ? secretCell.row * cellHeight : 0
  const secretCellLeft = secretCell ? secretCell.col * cellWidth : 0

  return (
    <div className="min-h-screen relative">
      <Navigation />
      <main>
        <Hero />
        <div className="space-y-4">
          <ProjectQuotesGrid />
          <div className="container mx-auto px-6">
            <div className="border-t border-border/50"></div>
          </div>
          <ProjectsGrid />
        </div>
      </main>
      <FloatingAddProject />
      
      {/* Debug indicator for secret cell */}
      {secretCell && gridSize.rows > 0 && gridSize.cols > 0 && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            top: `${secretCellTop}px`,
            left: `${secretCellLeft}px`,
            width: `${cellWidth}px`,
            height: `${cellHeight}px`,
            boxSizing: 'border-box'
          }}
        />
      )}
      
      {/* Snake game overlay */}
      {showSnake && (
        <SnakeGameOverlay
          gridSize={gridSize}
          onClose={() => {
            setShowSnake(false)
            // Regenerate secret cell after game closes
            setSecretCell({
              row: Math.floor(Math.random() * gridSize.rows),
              col: Math.floor(Math.random() * gridSize.cols)
            })
          }}
        />
      )}
    </div>
  )
}
