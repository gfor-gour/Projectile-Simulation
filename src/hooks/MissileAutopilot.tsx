import { ProjectileParams, SimulationState, Vector2D } from '@/types/simulation'

const GRAVITY = 9.81

export async function getVelocityandAngle(
    simulationState: SimulationState,
    params: ProjectileParams
): Promise<{ initialVelocity?: number; launchAngle?: number }> {
    const position = { x: 0, y: 0 }
    const target = params.targetPosition
    if (!target) return { initialVelocity: undefined, launchAngle: undefined }

    const dx = target.x - position.x
    const dy = target.y - position.y

    let bestVelocity = Infinity
    let bestAngleRad = 0

    // Only use the closed-form solution (no air resistance)
    for (let angleDeg = 1; angleDeg < 90; angleDeg += 0.1) {
        const theta = (angleDeg * Math.PI) / 180
        const cos = Math.cos(theta)
        const tan = Math.tan(theta)

        const denominator = 2 * (dx * tan - dy) * cos * cos
        if (denominator <= 0) continue

        const v0Squared = (GRAVITY * dx * dx) / denominator
        if (v0Squared <= 0) continue

        const v0 = Math.sqrt(v0Squared)
        if (v0 < bestVelocity) {
            bestVelocity = v0
            bestAngleRad = theta
        }
    }

    if (bestVelocity !== Infinity) {
        return {
            initialVelocity: bestVelocity,
            launchAngle: (bestAngleRad * 180) / Math.PI
        }
    }

    return {
        initialVelocity: undefined,
        launchAngle: undefined
    }
}
