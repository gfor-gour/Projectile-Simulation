// Parameters for the projectile simulation
export interface ProjectileParams {
  initialVelocity: number;
  angle: number; // in degrees
  mass: number;
  airResistance: boolean;
  dragCoefficient?: number;
}

// Physics constants and simulation state
export interface SimulationState {
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  acceleration: { x: number; y: number };
  time: number;
  trajectory: Array<{ x: number; y: number; t: number }>;
}