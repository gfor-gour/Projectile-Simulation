import { ProjectileParams, SimulationState, Vector2D } from '@/types/simulation'
import { calculateAirResistance } from '@/lib/physics/airResistance'

const GRAVITY = 9.81
const TIME_STEP = 0.016 // ~60fps

export function simulateNextStep(
  state: SimulationState,
  params: ProjectileParams
): SimulationState {
  const { position, velocity, time, trajectory } = state

  // Initial acceleration due to gravity
  let acceleration: Vector2D = { x: 0, y: -GRAVITY }

  // If air resistance is enabled, calculate the force of air resistance
  if (params.airResistance && params.dragCoefficient) {
    const airForce = calculateAirResistance(velocity, params)
    acceleration.x += airForce.x / params.mass
    acceleration.y += airForce.y / params.mass
  }

  // Update velocity based on acceleration
  const newVelocity = {
    x: velocity.x + acceleration.x * TIME_STEP,
    y: velocity.y + acceleration.y * TIME_STEP,
  }

  // Update position based on velocity
  const newPosition = {
    x: position.x + newVelocity.x * TIME_STEP,
    y: position.y + newVelocity.y * TIME_STEP,
  }

  // Return updated state with new position, velocity, acceleration, and trajectory
  return {
    position: newPosition,
    velocity: newVelocity,
    acceleration,
    time: time + TIME_STEP,
    trajectory: [...trajectory, { x: newPosition.x, y: newPosition.y, t: time + TIME_STEP }],
  }
}
