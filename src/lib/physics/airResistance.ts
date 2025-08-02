import { ProjectileParams } from "@/types/simulation";

const GRAVITY = 9.81;
const AIR_DENSITY = 1.225; // kg/m³ at sea level, standard conditions
const PI = Math.PI;

// Enhanced air resistance force calculation
export function calculateAirResistance(
  velocity: { x: number; y: number },
  params: ProjectileParams
): { x: number; y: number } {
  if (!params.airResistance) return { x: 0, y: 0 };

  const dragCoefficient = params.dragCoefficient || 0.47; // Default drag coefficient for spherical objects
  const mass = params.mass;

  // Calculate projectile properties assuming spherical shape
  const radius = Math.pow((3 * mass) / (4 * Math.PI * 2700), 1 / 3); // Approximate density of 2700 kg/m³ for spherical projectile
  const crossSectionalArea = Math.PI * radius * radius;

  // Handle wind effects (wind speed and direction)
  let windVx = 0;
  let windVy = 0;

  if (params.windSpeed && params.windDirection !== undefined) {
    // Wind direction handling (0 = right-to-left, Math.PI = left-to-right)
    const windAngleRad = params.windDirection === 0 ? 0 : Math.PI;  // wind direction in radians
    windVx = params.windSpeed * Math.cos(windAngleRad);  // Horizontal wind component
    windVy = params.windSpeed * 0.1 * Math.sin(windAngleRad);  // Small vertical wind component for realism
  }

  // Calculate relative velocity components (subtract wind speed from velocity)
  const relVx = velocity.x - windVx;
  const relVy = velocity.y - windVy;
  const relativeSpeed = Math.sqrt(relVx * relVx + relVy * relVy);

  if (relativeSpeed < 0.01) return { x: 0, y: 0 }; // Prevent division by zero

  // Reynolds number for more accurate drag calculation
  const kinematicViscosity = 1.5e-5; // m²/s for air at 20°C
  const reynoldsNumber = (relativeSpeed * 2 * radius) / kinematicViscosity;

  // Adjust drag coefficient based on Reynolds number (simplified model)
  let adjustedDragCoeff = dragCoefficient;
  if (reynoldsNumber < 1e5) {
    adjustedDragCoeff *= 1.5; // Increased drag in laminar flow
  } else if (reynoldsNumber > 2e5) {
    adjustedDragCoeff *= 0.2; // Reduced drag in turbulent flow
  }

  // Calculate the drag force magnitude
  const forceMagnitude = 0.5 * AIR_DENSITY * relativeSpeed * relativeSpeed *
    adjustedDragCoeff * crossSectionalArea;

  // Return the drag force components in x and y directions (opposite to the velocity direction)
  return {
    x: -forceMagnitude * relVx / relativeSpeed,
    y: -forceMagnitude * relVy / relativeSpeed
  };
}
