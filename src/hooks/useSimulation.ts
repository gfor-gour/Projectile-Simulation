'use client'
import { useEffect, useRef, useState } from 'react'
import { ProjectileParams, SimulationState } from '@/types/simulation'
import { simulateNextStep } from '@/components/physics/ProjectileSimulation'

const getInitialState = (params: ProjectileParams): SimulationState => {
    const angleRad = (params.angle * Math.PI) / 180
    const vX = params.initialVelocity * Math.cos(angleRad)
    const vY = params.initialVelocity * Math.sin(angleRad)

    return {
        position: { x: 0, y: 0 },
        velocity: { x: vX, y: vY },
        acceleration: { x: 0, y: -9.81 },
        time: 0,
        trajectory: [{ x: 0, y: 0, t: 0 }],
    }
}

export function useSimulation() {
    const [params, setParams] = useState<ProjectileParams>(
        {
        initialVelocity: 100,
        angle: 45,
        mass: 5,
        airResistance: false,
        dragCoefficient: 0.47,  //  Cd is around 0.47 for spherical objects
        windSpeed: 50,
        windDirection: 180,  
        targetPosition: { x: 500, y: 200 }, 
    }
)

    const updateParams = (newParams: Partial<ProjectileParams>) => {
        setParams(prev => ({ ...prev, ...newParams }))
    }

    const [simulationState, setSimulationState] = useState<SimulationState>(() =>
        getInitialState(params)
    )

    const animationRef = useRef<number | undefined>(undefined)

    const startSimulation = () => {
        const loop = () => {
            setSimulationState((prev) => {
                if (prev.position.y < 0 && prev.time > 0.3) {
                    return prev
                } else {
                    return simulateNextStep(prev, params)
                }
            })
            animationRef.current = requestAnimationFrame(loop)
        }
        cancelAnimationFrame(animationRef.current!)
        setSimulationState(getInitialState(params))
        animationRef.current = requestAnimationFrame(loop)
    }

    const stopSimulation = () => {
        cancelAnimationFrame(animationRef.current!)
    }

    useEffect(() => {
        return () => cancelAnimationFrame(animationRef.current!)
    }, [])

    return {
        simulationState,
        params,
        updateParams,
        startSimulation,
        stopSimulation,
    }
}
