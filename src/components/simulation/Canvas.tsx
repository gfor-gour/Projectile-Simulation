"use client"

import { useEffect, useRef } from "react"

interface CanvasProps {
  simulationState: any
  projectileParams: any
  missileImageUrl: string
}

export default function Canvas({ simulationState, projectileParams, missileImageUrl }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.fillStyle = "#1e293b" // slate-800
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    drawGrid(ctx, canvas.width, canvas.height)

    // Draw axes
    drawAxes(ctx, canvas.width, canvas.height)

    // Draw trajectory (mock trajectory for demonstration)
    drawTrajectory(ctx, canvas.width, canvas.height)

    // Draw labels
    drawLabels(ctx, canvas.width, canvas.height)
  }, [simulationState, projectileParams])

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = "#374151" // gray-700
    ctx.lineWidth = 1

    // Vertical lines
    for (let x = 0; x <= width; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Horizontal lines
    for (let y = 0; y <= height; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
  }

  const drawAxes = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = "#6b7280" // gray-500
    ctx.lineWidth = 2

    // X-axis
    ctx.beginPath()
    ctx.moveTo(60, height - 60)
    ctx.lineTo(width - 20, height - 60)
    ctx.stroke()

    // Y-axis
    ctx.beginPath()
    ctx.moveTo(60, height - 60)
    ctx.lineTo(60, 20)
    ctx.stroke()

    // Arrow heads
    ctx.fillStyle = "#6b7280"
    // X-axis arrow
    ctx.beginPath()
    ctx.moveTo(width - 20, height - 60)
    ctx.lineTo(width - 30, height - 55)
    ctx.lineTo(width - 30, height - 65)
    ctx.fill()

    // Y-axis arrow
    ctx.beginPath()
    ctx.moveTo(60, 20)
    ctx.lineTo(55, 30)
    ctx.lineTo(65, 30)
    ctx.fill()
  }

  const drawTrajectory = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Mock trajectory points (parabolic path)
    const points: [number, number][] = []
    const startX = 80
    const startY = height - 80

    for (let i = 0; i <= 50; i++) {
      const x = startX + i * 8
      const y = startY - (i * 4 - i * i * 0.08)
      if (y <= height - 60) {
        points.push([x, y])
      }
    }

    // Draw trajectory points
    ctx.fillStyle = "#f59e0b" // amber-500
    points.forEach(([x, y]) => {
      ctx.beginPath()
      ctx.arc(x, y, 4, 0, 2 * Math.PI)
      ctx.fill()
    })
  }

  const drawLabels = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.fillStyle = "#9ca3af" // gray-400
    ctx.font = "14px sans-serif"

    // X-axis label
    ctx.fillText("Horizontal Distance (m)", width / 2 - 80, height - 20)

    // Y-axis label
    ctx.save()
    ctx.translate(20, height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText("Vertical Distance (m)", -60, 0)
    ctx.restore()

    // Scale markers
    ctx.font = "12px sans-serif"

    // X-axis markers
    for (let i = 0; i <= 5; i++) {
      const x = 60 + i * 80
      const value = i * 10
      ctx.fillText(value.toString(), x - 5, height - 40)
    }

    // Y-axis markers
    for (let i = 0; i <= 5; i++) {
      const y = height - 60 - i * 60
      const value = i * 2
      ctx.fillText(value.toString(), 35, y + 5)
    }
  }

  return <canvas ref={canvasRef} className="w-full h-[500px] bg-slate-800 rounded-lg" style={{ minHeight: "500px" }} />
}
