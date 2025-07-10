import { ProjectileParams, SimulationState, Vector2D } from '@/types/simulation'

const GRAVITY = 9.81
const TIME_STEP = 0.016 // ~60fps

// Optional drag formula: F_d = 0.5 * Cd * A * ρ * v²
const getDragForce = (velocity: Vector2D, dragCoeff: number, mass: number): Vector2D => {
  const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2)
  const dragMagnitude = dragCoeff * speed * speed
  const dragX = -dragMagnitude * (velocity.x / speed)
  const dragY = -dragMagnitude * (velocity.y / speed)
  return { x: dragX / mass, y: dragY / mass }
}

export function simulateNextStep(
  state: SimulationState,
  params: ProjectileParams
): SimulationState {
  const { position, velocity, time, trajectory } = state

  let acceleration: Vector2D = { x: 0, y: -GRAVITY }

  if (params.airResistance && params.dragCoefficient) {
    const drag = getDragForce(velocity, params.dragCoefficient, params.mass)
    acceleration.x += drag.x
    acceleration.y += drag.y
  }

  const newVelocity = {
    x: velocity.x + acceleration.x * TIME_STEP,
    y: velocity.y + acceleration.y * TIME_STEP,
  }

  const newPosition = {
    x: position.x + newVelocity.x * TIME_STEP,
    y: position.y + newVelocity.y * TIME_STEP,
  }

  return {
    position: newPosition,
    velocity: newVelocity,
    acceleration,
    time: time + TIME_STEP,
    trajectory: [...trajectory, { x: newPosition.x, y: newPosition.y, t: time + TIME_STEP }],
  }
}
