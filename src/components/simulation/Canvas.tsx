'use client'
import { useEffect, useRef } from 'react'
import { ProjectileParams, SimulationState } from '@/types/simulation'

interface CanvasProps {
    simulationState: SimulationState
    projectileParams: ProjectileParams
    missileImageUrl?: string
    maxWorldHeight: number
    maxWorldRange: number
}

export default function Canvas({ projectileParams, simulationState, missileImageUrl, maxWorldHeight, maxWorldRange }: CanvasProps) {
    const staticCanvasRef = useRef<HTMLCanvasElement>(null)
    const dynamicCanvasRef = useRef<HTMLCanvasElement>(null)
    const imageRef = useRef<HTMLImageElement | null>(null)

    const width = 1200
    const height = 600
    const missileSize = 35

    // Load missile image
    useEffect(() => {
        if (missileImageUrl) {
            const img = new Image()
            img.src = missileImageUrl
            img.onload = () => (imageRef.current = img)
        }
    }, [missileImageUrl])

    // Dynamic scaling
    const scaleX = width / maxWorldRange;
    const scaleY = height / maxWorldHeight;

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


        // Grid lines (every 100m in world coordinates)
        ctx.strokeStyle = '#334155' // slate-700
        ctx.lineWidth = 1
        ctx.setLineDash([2, 6])
        ctx.font = '12px Inter'
        ctx.fillStyle = '#94a3b8' // slate-400

        for (let gx = 0; gx <= maxWorldRange; gx += 100) {
            const sx = gx * scaleX;
            ctx.beginPath()
            ctx.moveTo(sx, 0)
            ctx.lineTo(sx, height)
            ctx.stroke()
            ctx.fillText(`${gx}m`, sx + 2, height - 5)
        }

        for (let gy = 0; gy <= maxWorldHeight; gy += 100) {
            const sy = height - gy * scaleY;
            ctx.beginPath()
            ctx.moveTo(0, sy)
            ctx.lineTo(width, sy)
            ctx.stroke()
            ctx.fillText(`${gy}m`, 2, sy - 2)
        }

        ctx.setLineDash([])

        // Trajectory
        ctx.beginPath()
        if (simulationState.trajectory.length > 0) {
            ctx.moveTo(
                simulationState.trajectory[0].x * scaleX,
                height - simulationState.trajectory[0].y * scaleY
            )
            simulationState.trajectory.forEach(({ x, y }) => {
                ctx.lineTo(x * scaleX, height - y * scaleY)
            })
        }

        ctx.strokeStyle = '#facc15' // yellow-400
        ctx.lineWidth = 3
        ctx.stroke()
    }, [simulationState.trajectory, maxWorldRange, maxWorldHeight, scaleX, scaleY])

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
                ctx.translate(x * scaleX, height - y * scaleY)
                ctx.rotate(angle)
                ctx.shadowColor = '#facc15'
                ctx.shadowBlur = 8
                ctx.drawImage(imageRef.current, -missileSize / 2, -missileSize / 2, missileSize, missileSize)
                ctx.restore()
            } else {
                ctx.fillStyle = '#f87171' // red-400
                ctx.beginPath()
                ctx.arc(x * scaleX, height - y * scaleY, missileSize / 2, 0, 2 * Math.PI)
                ctx.fill()
            }

            // Velocity Vectors
            ctx.save()
            ctx.lineWidth = 2

            // Vx (green)
            ctx.strokeStyle = '#4ade80' // green-400
            ctx.beginPath()
            ctx.moveTo(x * scaleX, height - y * scaleY + 15)
            ctx.lineTo(x * scaleX, height)
            ctx.stroke()

            // Vy (blue)
            ctx.strokeStyle = '#60a5fa' // blue 
            ctx.beginPath()
            ctx.moveTo(0, height - y * scaleY)
            ctx.lineTo(x * scaleX - 15, height - y * scaleY)
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
                    ctx.moveTo(x * scaleX + 20, height - maxPoint.y * scaleY)
                    ctx.lineTo(width, height - maxPoint.y * scaleY)
                    ctx.stroke()
                    ctx.setLineDash([])
                    ctx.fillStyle = 'primary'
                    ctx.font = 'bold 16px Inter'
                    ctx.fillText(
                        `MaxHeight (${maxPoint.y.toFixed(1)} m)`,
                        width - 180,
                        height - maxPoint.y * scaleY - 10
                    )
                    ctx.restore()
                }
            }

            // HUD panel
            const v = Math.sqrt(vx ** 2 + vy ** 2)
            const panelX = 900
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
    }, [simulationState, projectileParams, scaleX, scaleY, maxWorldRange, maxWorldHeight])

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
