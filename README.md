
# Simulating Projectile Motion

## Overview

This project is an interactive web-based simulation of projectile motion, designed for educational and engineering purposes. It was built for the International Hackathon “Bridging Engineering & Computer Science”, where it competed as a showcase of modern web technologies applied to physics and STEM learning.

The simulator allows users to visualize, analyze, and experiment with projectile motion under various conditions, including optional air resistance, mass, drag coefficient, and more. The project features a modern UI, real-time analytics, and a learning hub for mastering the physics behind projectile motion.

## Features

- **Real-Time Simulation:** Visualizes projectile trajectories with and without air resistance.
- **Advanced Physics Engine:** Supports quadratic drag, mass, wind, and other real-world effects.
- **Interactive Controls:** Adjust initial velocity, launch angle, mass, drag coefficient, and air resistance.
- **Live Analytics:** Displays key metrics (range, max height, time of flight, velocity components) and compares theory vs. simulation.
- **Learning Hub:** Step-by-step physics concepts, formulas, and interactive experiments for students and engineers.
- **Modern UI:** Responsive, animated, and visually engaging interface built with Next.js and React.
- **Hackathon Ready:** Designed for rapid prototyping, collaboration, and presentation.

## Technologies Used

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) (for styling)
- [Lucide Icons](https://lucide.dev/) (for UI icons)
- Custom Physics Engine (RK4, Euler, and analytical solutions)

## Project Structure

- `src/components/simulation/ProjectileSimulation.tsx` — Main simulation component
- `src/components/simulation/ControlsPanel.tsx` — User controls for simulation parameters
- `src/components/simulation/SimulationVisualization.tsx` — Canvas-based trajectory visualization
- `src/components/simulation/ResultsPanel.tsx` — Displays simulation results and analytics
- `src/components/simulation/LearningHub.tsx` — Interactive physics learning and experiments
- `src/components/simulation/NewVelocityGraphs.tsx` — Velocity analysis graphs
- `src/hooks/useSimulation.ts` — Custom hook for simulation state and engine
- `src/types/simulation.ts` — TypeScript types for simulation data

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm, yarn, pnpm, or bun

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/gfor-gour/Simulating-Projectile-Motion-by-Gour_Robin.git
cd Simulating-Projectile-Motion-by-Gour_Robin
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to use the simulator.

## Usage

1. Adjust simulation parameters in the left panel (velocity, angle, mass, drag, air resistance).
2. Click **Launch Projectile** to start the simulation.
3. View real-time trajectory, analytics, and physics insights.
4. Explore the Learning Hub for theory, formulas, and interactive experiments.
5. Use the tabs for velocity analysis and parameter comparisons.

## Hackathon Context

This project was developed for the International Hackathon “Bridging Engineering & Computer Science”, aiming to:

- Demonstrate the power of modern web technologies in STEM education.
- Bridge the gap between engineering principles and computer science implementation.
- Provide an engaging, hands-on tool for students, educators, and engineers.

## Contributing

Contributions, feedback, and suggestions are welcome! Please open issues or submit pull requests for improvements, bug fixes, or new features.

## License

This project is released under the MIT License. See [LICENSE](LICENSE) for details.

## Acknowledgements

- Built with Next.js, React, and Tailwind CSS
- Inspired by physics education and hackathon innovation
- Special thanks to the International Hackathon organizers and all contributors
