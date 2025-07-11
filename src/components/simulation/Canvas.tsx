'use client'
import { useEffect, useRef } from 'react'
import { ProjectileParams, SimulationState } from '@/types/simulation'

interface CanvasProps {
    simulationState: SimulationState
    projectileParams: ProjectileParams
    missileImageUrl?: string
}

export default function Canvas({ projectileParams, simulationState, missileImageUrl }: CanvasProps) {
    const staticCanvasRef = useRef<HTMLCanvasElement>(null)
    const dynamicCanvasRef = useRef<HTMLCanvasElement>(null)
    const imageRef = useRef<HTMLImageElement | null>(null)

    const width = 1000
    const height = 500
    const missileSize = 35

    // Load missile image
    useEffect(() => {
        if (missileImageUrl) {
            const img = new Image()
            img.src = missileImageUrl
            img.onload = () => (imageRef.current = img)
        }
    }, [missileImageUrl])

    // Draw static grid and trajectory
    useEffect(() => {
        const canvas = staticCanvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Background
        const bgGradient = ctx.createLinearGradient(0, 0, 0, height)
        bgGradient.addColorStop(0, '#0f172a') // slate-900
        bgGradient.addColorStop(1, '#1e293b') // slate-800
        ctx.fillStyle = bgGradient
        ctx.fillRect(0, 0, width, height)

        // Grid lines
        ctx.strokeStyle = '#334155' // slate-700
        ctx.lineWidth = 1
        ctx.setLineDash([2, 6])
        ctx.font = '12px Inter'
        ctx.fillStyle = '#94a3b8' // slate-400

        for (let gx = 0; gx <= width; gx += 100) {
            ctx.beginPath()
            ctx.moveTo(gx, 0)
            ctx.lineTo(gx, height)
            ctx.stroke()
            ctx.fillText(`${gx}m`, gx + 2, height - 5)
        }

        for (let gy = 0; gy <= height; gy += 100) {
            ctx.beginPath()
            ctx.moveTo(0, gy)
            ctx.lineTo(width, gy)
            ctx.stroke()
            ctx.fillText(`${height - gy}m`, 2, gy - 2)
        }

        ctx.setLineDash([])

        // Trajectory
        ctx.beginPath()
        ctx.moveTo(
            simulationState.trajectory[0]?.x ?? 0,
            height - (simulationState.trajectory[0]?.y ?? 0)
        )
        simulationState.trajectory.forEach(({ x, y }) => {
            ctx.lineTo(x, height - y)
        })

        ctx.strokeStyle = '#facc15' // yellow-400
        ctx.lineWidth = 3
        ctx.stroke()
    }, [simulationState.trajectory])

    // Animate missile
    useEffect(() => {
        const canvas = dynamicCanvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let animationFrameId: number

        const draw = () => {
            ctx.clearRect(0, 0, width, height)

            const { x, y } = simulationState.position
            const { x: vx, y: vy } = simulationState.velocity

            let angle = (projectileParams.angle * Math.PI) / 180
            if (vx !== 0 || vy !== 0) angle = Math.atan2(-vy, vx)

            // Missile
            if (imageRef.current) {
                ctx.save()
                ctx.translate(x, height - y)
                ctx.rotate(angle)
                ctx.shadowColor = '#facc15'
                ctx.shadowBlur = 8
                ctx.drawImage(imageRef.current, -missileSize / 2, -missileSize / 2, missileSize, missileSize)
                ctx.restore()
            } else {
                ctx.fillStyle = '#f87171' // red-400
                ctx.beginPath()
                ctx.arc(x, height - y, missileSize / 2, 0, 2 * Math.PI)
                ctx.fill()
            }

            // Velocity Vectors
            ctx.save()
            ctx.lineWidth = 2

            // V (red)
            // ctx.strokeStyle = '#f43f5e' // rose-500
            // ctx.beginPath()
            // ctx.moveTo(x, height - y)
            // ctx.lineTo(x + vx * 2, height - (y + vy * 2))
            // ctx.stroke()

            // Vx (green)
            ctx.strokeStyle = '#4ade80' // green-400
            ctx.beginPath()
            ctx.moveTo(x, height - y+15)
            ctx.lineTo(x, height)
            ctx.stroke()

            // Vy (blue)
            ctx.strokeStyle = '#60a5fa' // blue 
            ctx.beginPath()
            ctx.moveTo(0, height - y)   // From Y-axis (left)
            ctx.lineTo(x-15, height - y)   // To current X
            ctx.stroke()

            // Draw Max Height level line and label
            const trajectory = simulationState.trajectory
            if (trajectory && trajectory.length > 0 ) {
                // Find the max height point
                const maxPoint = trajectory.reduce((max, p) => (p.y > max.y ? p : max), trajectory[0])
                // Only draw if the projectile is at or past max height
                if (Math.abs(y - maxPoint.y) < 1 && y!=0) {
                    ctx.save()
                    ctx.setLineDash([8, 6])
                    ctx.strokeStyle = 'priamry'
                    ctx.lineWidth = 2
                    ctx.beginPath()
                    ctx.moveTo(x+15, height - maxPoint.y)
                    ctx.lineTo(width, height - maxPoint.y)
                    ctx.stroke()
                    ctx.setLineDash([])
                    ctx.fillStyle = 'primary'
                    ctx.font = 'bold 16px Inter'
                    ctx.fillText(
                        `MaxHeight (${maxPoint.y.toFixed(1)} m)`,
                        width - 180,
                        height - maxPoint.y - 10
                    )
                    ctx.restore()
                }
            }



              

            // HUD panel
            const v = Math.sqrt(vx ** 2 + vy ** 2)
            const panelX = 700
            const panelY = 20

            ctx.save()
            ctx.fillStyle = 'rgba(30, 41, 59, 0.75)' // slate-800 w/ opacity
            ctx.fillRect(panelX, panelY, 260, 120)
            ctx.fillStyle = '#e2e8f0' // slate-200
            ctx.font = '14px Inter'

            ctx.fillText(`Position: x = ${x.toFixed(1)} m, y = ${y.toFixed(1)} m`, panelX + 10, panelY + 25)
            ctx.fillText(`Velocity: V  = ${v.toFixed(1)} m/s`, panelX + 10, panelY + 45)
            ctx.fillText(`Vx = ${vx.toFixed(1)} m/s`, panelX + 10, panelY + 65)
            ctx.fillText(`Vy = ${vy.toFixed(1)} m/s`, panelX + 10, panelY + 85)

            if (projectileParams.airResistance) {
                const windDir = projectileParams.windDirection === 180 ? 'Left' : 'Right'
                ctx.fillText(`Air: ${projectileParams.windSpeed ?? 0} m/s ${windDir}`, panelX + 10, panelY + 105)
            }

            ctx.restore()

            animationFrameId = requestAnimationFrame(draw)
        }

        animationFrameId = requestAnimationFrame(draw)
        return () => cancelAnimationFrame(animationFrameId)
    }, [simulationState, projectileParams])

    return (
        <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-800">
            <canvas
                ref={staticCanvasRef}
                width={width}
                height={height}
                className="absolute top-0 left-0 w-full h-full z-0"
            />
            <canvas
                ref={dynamicCanvasRef}
                width={width}
                height={height}
                className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none"
            />
        </div>
    )
}
