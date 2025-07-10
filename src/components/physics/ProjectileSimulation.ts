import { ProjectileParams, SimulationState, Vector2D } from '@/types/simulation'

const GRAVITY = 9.81
const TIME_STEP = 0.016 // ~60fps

const toRadians = (deg: number) => (deg * Math.PI) / 180

const getDragForce = (
  velocity: Vector2D,
  dragCoeff: number,
  mass: number,
  windSpeed = 0,
  windDirection = 0
): Vector2D => {
  const windRad = toRadians(windDirection)
  const windVector: Vector2D = {
    x: windSpeed * Math.cos(windRad),
    y: windSpeed * Math.sin(windRad),
  }

  // Relative velocity (projectile velocity - wind velocity)
  const relativeVelocity = {
    x: velocity.x - windVector.x,
    y: velocity.y - windVector.y,
  }

  const speed = Math.sqrt(relativeVelocity.x ** 2 + relativeVelocity.y ** 2)
  if (speed === 0) return { x: 0, y: 0 }

  const dragMagnitude = dragCoeff * speed * speed
  return {
    x: (-dragMagnitude * relativeVelocity.x) / (speed * mass),
    y: (-dragMagnitude * relativeVelocity.y) / (speed * mass),
  }
}


export function simulateNextStep(
  state: SimulationState,
  params: ProjectileParams
): SimulationState {
  const { position, velocity, time, trajectory } = state

  let acceleration: Vector2D = { x: 0, y: -GRAVITY }

  if (params.airResistance && params.dragCoefficient) {
    const drag = getDragForce(
      velocity,
      params.dragCoefficient,
      params.mass,
      params.windSpeed,
      params.windDirection
    )
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
