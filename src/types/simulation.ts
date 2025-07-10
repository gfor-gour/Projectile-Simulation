export interface ProjectileParams {
  initialVelocity: number
  angle: number // degrees
  mass: number
  airResistance: boolean
  dragCoefficient?: number
}

export interface Vector2D {
  x: number
  y: number
}

export interface SimulationState {
  position: Vector2D
  velocity: Vector2D
  acceleration: Vector2D
  time: number
  trajectory: Array<{ x: number; y: number; t: number }>
}
