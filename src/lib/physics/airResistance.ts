import { ProjectileParams } from "@/types/simulation";

const GRAVITY = 9.81;
const AIR_DENSITY = 1.225; // kg/m³ at sea level, standard conditions
const PI = Math.PI;

// More accurate trajectory estimation considering air resistance
export function estimateTrajectoryWithAirResistance(params: ProjectileParams) {
    const angleRad = (params.angle * PI) / 180;
    const v0 = params.initialVelocity;
    
    // Basic trajectory without air resistance
    const maxHeight = (v0 * Math.sin(angleRad)) ** 2 / (2 * GRAVITY);
    const range = (v0 ** 2 * Math.sin(2 * angleRad)) / GRAVITY;

    if (!params.airResistance) {
        return { maxHeight, range };
    }

    // With air resistance, using a more sophisticated approximation
    const dragCoeff = params.dragCoefficient || 0.02;
    const mass = params.mass;
    
    // Calculate ballistic coefficient (β = m/(Cd*A))
    // Assuming spherical projectile for cross-sectional area calculation
    const radius = Math.pow((3 * mass) / (4 * PI * 2700), 1/3); // Using approximate density of 2700 kg/m³
    const area = PI * radius * radius;
    const ballisticCoeff = mass / (dragCoeff * area);

    // Calculate air resistance factor (k = ρ/2β)
    const k = (AIR_DENSITY / 2) / ballisticCoeff;

    // Approximate reduction factors based on initial velocity and k
    // These equations are derived from numerical solutions of the differential equations
    const exp_factor = Math.exp(-k * v0);
    const heightFactor = Math.max(0.3, exp_factor * (1 - k * v0 * Math.sin(angleRad)));
    const rangeFactor = Math.max(0.3, exp_factor * (1 - k * v0 * Math.cos(angleRad)));

    // Apply wind effects if present
    let windCorrection = 1;
    if (params.windSpeed && params.windDirection !== undefined) {
        const windAngleRad = params.windDirection === 0 ? 0 : PI;
        const windEffect = (params.windSpeed * Math.cos(windAngleRad)) / v0;
        windCorrection = 1 + (windEffect * Math.cos(angleRad));
    }

    return {
        maxHeight: maxHeight * heightFactor,
        range: range * rangeFactor * windCorrection
    };
}

// Enhanced air resistance force calculation
export function calculateAirResistance(
    velocity: { x: number; y: number },
    params: ProjectileParams
): { x: number; y: number } {
    if (!params.airResistance) return { x: 0, y: 0 };

    const dragCoefficient = params.dragCoefficient || 0.02;
    const mass = params.mass;

    // Calculate projectile properties assuming spherical shape
    const radius = Math.pow((3 * mass) / (4 * PI * 2700), 1/3); // Using approximate density of 2700 kg/m³
    const crossSectionalArea = PI * radius * radius;

    // Handle wind effects
    let windVx = 0;
    let windVy = 0;
    if (params.windSpeed && params.windDirection !== undefined) {
        const windAngleRad = params.windDirection === 0 ? 0 : PI;
        windVx = params.windSpeed * Math.cos(windAngleRad);
        // Adding small vertical component for more realistic wind behavior
        windVy = params.windSpeed * 0.1 * Math.sin(windAngleRad);
    }

    // Calculate relative velocity components
    const relVx = velocity.x - windVx;
    const relVy = velocity.y - windVy;
    const relativeSpeed = Math.sqrt(relVx * relVx + relVy * relVy);

    if (relativeSpeed < 0.01) return { x: 0, y: 0 }; // Prevent division by zero

    // Reynolds number calculation for more accurate drag
    const kinematicViscosity = 1.5e-5; // m²/s for air at 20°C
    const reynoldsNumber = (relativeSpeed * 2 * radius) / kinematicViscosity;

    // Adjust drag coefficient based on Reynolds number (simplified model)
    let adjustedDragCoeff = dragCoefficient;
    if (reynoldsNumber < 1e5) {
        adjustedDragCoeff *= 1.5; // Increased drag in laminar flow
    } else if (reynoldsNumber > 2e5) {
        adjustedDragCoeff *= 0.2; // Reduced drag in turbulent flow
    }

    // Calculate force magnitude with adjusted coefficient
    const forceMagnitude = 0.5 * AIR_DENSITY * relativeSpeed * relativeSpeed * 
                          adjustedDragCoeff * crossSectionalArea;

    return {
        x: -forceMagnitude * relVx / relativeSpeed,
        y: -forceMagnitude * relVy / relativeSpeed
    };
}
