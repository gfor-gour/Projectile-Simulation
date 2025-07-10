'use client'
import { useEffect, useRef } from 'react'
import { ProjectileParams, SimulationState } from '@/types/simulation'

interface CanvasProps {
  simulationState: SimulationState
  projectileParams: ProjectileParams
  missileImageUrl?: string
}

export default function Canvas({projectileParams, simulationState, missileImageUrl }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  // Load missile image
  useEffect(() => {
    if (missileImageUrl) {
      const img = new Image()
      img.src = missileImageUrl
      img.onload = () => (imageRef.current = img)
    }
  }, [missileImageUrl])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw the trajectory path
      ctx.beginPath()
      ctx.moveTo(
        simulationState.trajectory[0]?.x ?? 0,
        height - (simulationState.trajectory[0]?.y ?? 0)
      )
    // Draw grid background
    ctx.save()
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, width, height)

    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1

    // Draw vertical grid lines (x units, every 100m)
    for (let gx = 0; gx <= width; gx += 100) {
      ctx.beginPath()
      ctx.moveTo(gx, 0)
      ctx.lineTo(gx, height)
      ctx.stroke()
      // Draw x label
      ctx.save()
      ctx.fillStyle = '#888'
      ctx.font = '12px Arial'
      ctx.fillText(`${gx / 1}m`, gx + 2, height - 5)
      ctx.restore()
    }

    // Draw horizontal grid lines (y units, every 100m)
    for (let gy = 0; gy <= height; gy += 100) {
      ctx.beginPath()
      ctx.moveTo(0, gy)
      ctx.lineTo(width, gy)
      ctx.stroke()
      // Draw y label
      ctx.save()
      ctx.fillStyle = '#888'
      ctx.font = '12px Arial'
      ctx.fillText(`${(height - gy) / 10}m`, 2, gy - 2)
      ctx.restore()
    }
    ctx.restore()
      simulationState.trajectory.forEach(({ x, y }) => {
        ctx.lineTo(x, height - y)
      })

    ctx.strokeStyle = 'orange'
    ctx.lineWidth = 4
    ctx.setLineDash([10, 10])
    ctx.stroke()
    ctx.setLineDash([])

      // Missile state
      const { x, y } = simulationState.position
      const { x: vx, y: vy } = simulationState.velocity
      const size = 30

      // Calculate rotation angle
      let angle = (projectileParams.angle * Math.PI) / 180 // fallback = initial angle
      if (vx !== 0 || vy !== 0) {
        angle = Math.atan2(-vy, vx) // canvas Y is flipped
      }

      if (imageRef.current) {
        ctx.save()
        ctx.translate(x, height - y)
        ctx.rotate(angle)
        ctx.drawImage(imageRef.current, -size / 2, -size / 2, size, size)
        ctx.restore()
      } else {
        ctx.fillStyle = 'red'
        ctx.beginPath()
        ctx.arc(x, height - y, size / 2, 0, 2 * Math.PI)
        ctx.fill()
      }

    // Draw velocity vector
    ctx.save()
    ctx.strokeStyle = 'red'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x, height - y)
    ctx.lineTo(x + vx * 2, height - (y + vy * 2)) // scale for visibility
    ctx.stroke()

    // Draw Vx component
    ctx.strokeStyle = 'green'
    ctx.beginPath()
    ctx.moveTo(x, height - y)
    ctx.lineTo(x + vx * 2, height - y)
    ctx.stroke()

    // Draw Vy component
    ctx.strokeStyle = 'orange'
    ctx.beginPath()
    ctx.moveTo(x + vx * 2, height - y)
    ctx.lineTo(x + vx * 2, height - (y + vy * 2))
    ctx.stroke()
    ctx.restore()

    // Draw labels for velocity components
    ctx.save()
    ctx.fillStyle = 'black'
    ctx.font = '16px Arial'
    ctx.fillText('v', x + vx * 2 + 10, height - (y + vy * 2))
    ctx.fillStyle = 'green'
    ctx.fillText('vx', x + vx * 2 + 10, height - y)
    ctx.fillStyle = 'orange'
    ctx.fillText('vy', x + vx * 2 + 10, height - (y + vy * 5 / 2))
    ctx.restore()

    // Draw position label
    ctx.save()
    ctx.fillStyle = 'black'
    ctx.font = '14px Arial'
    ctx.fillStyle = 'white'
    ctx.fillText(`x: ${x.toFixed(1)} m, y: ${y.toFixed(1)} m`, x + 10, height - y - 10)
    ctx.restore()
     // Draw velocity label
    ctx.save()
    ctx.fillStyle = 'white'
    ctx.font = '14px Arial'
    const v = Math.sqrt(vx * vx + vy * vy)
    ctx.fillText(`Vx: ${vx.toFixed(1)} m/s, Vy: ${vy.toFixed(1)} m/s, V: ${v.toFixed(1)} m/s`, x + 10, height - y - 30)
    ctx.restore()


      requestAnimationFrame(drawFrame)
    }

    requestAnimationFrame(drawFrame)
  }, [simulationState])

  return (
    <div className="w-full h-[500px]  border-black border-4 rounded-md overflow-hidden">
      <canvas
        ref={canvasRef}
        width={1000}
        height={500}
        className="w-full h-full bg-gray-100"
      />
    </div>
  )
}
