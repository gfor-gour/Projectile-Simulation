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

    // Dynamic scaling based on maxWorldRange and maxWorldHeight
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


        // Grid lines (every 100m in world coordinates, scaled)
        ctx.strokeStyle = '#334155' // slate-700
        ctx.lineWidth = 1
        ctx.setLineDash([2, 6])
        ctx.font = '12px Inter'
        ctx.fillStyle = '#94a3b8' // slate-400
        // Calculate dynamic offsets to keep the trajectory always visible in the canvas
        let offsetX = 0
        let offsetY = 0
        if (simulationState.trajectory.length > 0) {
            const last = simulationState.trajectory[simulationState.trajectory.length - 1]
            const margin = 60 // px margin from edge
            const pxX = last.x * scaleX
            const pxY = height - last.y * scaleY

            // Adjust X offset if projectile is near the right edge
            if (pxX > width - margin) {
            offsetX = pxX - (width - margin)
            } else if (pxX < margin) {
            offsetX = pxX - margin
            }

            // Adjust Y offset if projectile is near the top edge
            if (pxY < margin) {
            offsetY = pxY - margin
            } else if (pxY > height - margin) {
            offsetY = pxY - (height - margin)
            }
        }

        // Draw X (ground) and Y (vertical) axes at (0,0) with sky color
        ctx.save()
        ctx.setLineDash([]) // Ensure solid line (not dashed)
        ctx.strokeStyle = '#38bdf8' // sky-400
        ctx.lineWidth = 2

        // Y axis (x=0)
        ctx.beginPath()
        ctx.moveTo(0 * scaleX - offsetX, 0)
        ctx.lineTo(0 * scaleX - offsetX, height)
        ctx.stroke()

        // X axis (y=0)
        ctx.beginPath()
        ctx.moveTo(0, height - 0 * scaleY - offsetY)
        ctx.lineTo(width, height - 0 * scaleY - offsetY)
        ctx.stroke()

        ctx.restore()

        // Determine min/max X and Y for grid lines (including negatives)
        const minX = Math.min(0, ...simulationState.trajectory.map(p => p.x), -1000)
        const maxX = Math.max(maxWorldRange, ...simulationState.trajectory.map(p => p.x), 1000)
        const maxY = Math.max(maxWorldHeight, ...simulationState.trajectory.map(p => p.y), 1000)

        // Draw vertical grid lines (every 100m, including negatives)
        for (let gx = Math.floor(minX / 100) * 100; gx <= maxX; gx += 100) {
            const sx = gx * scaleX - offsetX
            ctx.beginPath()
            ctx.moveTo(sx, 0)
            ctx.lineTo(sx, height)
            ctx.stroke()
            ctx.fillText(`${gx}m`, sx + 2, height - 5)
        }

        // Draw horizontal grid lines (every 100m, only for y >= 0)
        for (let gy = 0; gy <= maxY; gy += 100) {
            const sy = height - gy * scaleY - offsetY
            ctx.beginPath()
            ctx.moveTo(0, sy)
            ctx.lineTo(width, sy)
            ctx.stroke()
            ctx.fillText(`${gy}m`, 2, sy - 2)
        }

        ctx.setLineDash([])

      

        ctx.strokeStyle = '#facc15' // yellow-400
        ctx.lineWidth = 3
        ctx.stroke()
    }, [simulationState.trajectory, maxWorldRange, maxWorldHeight, scaleX, scaleY])

    // Draw a target on target position from projectileParams
useEffect(() => {
    if (projectileParams.airResistance==false && projectileParams.targetPosition) {
        const canvas = staticCanvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Draw target if position exists
        const targetPosition = projectileParams.targetPosition
        if (!targetPosition) return
        const targetX = targetPosition.x * scaleX
        const targetY = height - targetPosition.y * scaleY

        ctx.save()
        ctx.strokeStyle = '#f87171' // red-400
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(targetX, targetY, missileSize / 2, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.restore()
    }
}, [projectileParams.airResistance, projectileParams.targetPosition, scaleX, scaleY, height])
   
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

            // Calculate dynamic offsets to follow the projectile with the grid
            let offsetX = 0
            let offsetY = 0
            const margin = 60 // px margin from edge
            const pxX = x * scaleX
            const pxY = height - y * scaleY

            // Adjust X offset if projectile is near the right or left edge
            if (pxX > width - margin) {
                offsetX = pxX - (width - margin)
            } else if (pxX < margin) {
                offsetX = pxX - margin
            }

            // Adjust Y offset if projectile is near the top or bottom edge
            if (pxY < margin) {
                offsetY = pxY - margin
            } else if (pxY > height - margin) {
                offsetY = pxY - (height - margin)
            }

            // Draw trajectory line following the same offset as the missile
            ctx.save()
            ctx.beginPath()
            const trajectory = simulationState.trajectory
            if (trajectory.length > 0) {
                ctx.moveTo(
                    trajectory[0].x * scaleX - offsetX,
                    height - trajectory[0].y * scaleY - offsetY
                )
                trajectory.forEach(({ x: tx, y: ty }) => {
                    ctx.lineTo(
                        tx * scaleX - offsetX,
                        height - ty * scaleY - offsetY
                    )
                })
            }
            ctx.strokeStyle = '#facc15' // yellow-400
            ctx.lineWidth = 3
            ctx.stroke()
            ctx.restore()

            // Missile
            if (imageRef.current) {
                ctx.save()
                ctx.translate(x * scaleX - offsetX, height - y * scaleY - offsetY)
                ctx.rotate(angle)
                ctx.shadowColor = '#facc15'
                ctx.shadowBlur = 8
                ctx.drawImage(imageRef.current, -missileSize / 2, -missileSize / 2, missileSize, missileSize)
                ctx.restore()
            } else {
                ctx.fillStyle = '#f87171' // red-400
                ctx.beginPath()
                ctx.arc(x * scaleX - offsetX, height - y * scaleY - offsetY, missileSize / 2, 0, 2 * Math.PI)
                ctx.fill()
            }

            // Velocity Vectors
            ctx.save()
            ctx.lineWidth = 2

            // // Vx (green)
            // ctx.strokeStyle = '#4ade80' // green-400
            // ctx.beginPath()
            // ctx.moveTo(x * scaleX - offsetX, height - y * scaleY - offsetY + 15)
            // ctx.lineTo(x * scaleX - offsetX, height - offsetY)
            // ctx.stroke()

            // // Vy (blue)
            // ctx.strokeStyle = '#60a5fa' // blue 
            // ctx.beginPath()
            // ctx.moveTo(-offsetX, height - y * scaleY - offsetY)
            // ctx.lineTo(x * scaleX - offsetX - 15, height - y * scaleY - offsetY)
            // ctx.stroke()

            // ctx.restore()

            // Draw Max Height level line and label
            if (trajectory && trajectory.length > 0 ) {
                // Find the max height point
                const maxPoint = trajectory.reduce((max, p) => (p.y > max.y ? p : max), trajectory[0])
                // Only draw if the projectile is at or past max height
                if (Math.abs(y - maxPoint.y) < 1 && y !== 0) {
                    ctx.save()
                    ctx.setLineDash([8, 6])
                    ctx.strokeStyle = '#facc15'
                    ctx.lineWidth = 2
                    ctx.beginPath()
                    ctx.moveTo(x * scaleX - offsetX + 20, height - maxPoint.y * scaleY - offsetY)
                    ctx.lineTo(width, height - maxPoint.y * scaleY - offsetY)
                    ctx.stroke()
                    ctx.setLineDash([])
                    ctx.fillStyle = '#facc15'
                    ctx.font = 'bold 16px Inter'
                    ctx.fillText(
                        `MaxHeight (${maxPoint.y.toFixed(1)} m)`,
                        width - 180,
                        height - maxPoint.y * scaleY - offsetY - 10
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
