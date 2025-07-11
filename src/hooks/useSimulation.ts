"use client"

import { useState, useRef, useEffect } from "react"

export const useSimulation = () => {
  const [simulationState, setSimulationState] = useState({ running: false, time: 0 })
  const [params, setParams] = useState({
    initialVelocity: 20,
    angle: 45,
    mass: 1,
    airResistance: false,
    dragCoefficient: 0.02,
    windSpeed: 0,
    windDirection: 0,
  })

  const animationFrameId = useRef<number | null>(null)

  const startSimulation = () => {
    setSimulationState({ running: true, time: 0 })
    // Mock simulation logic - replace with actual physics calculations
    const simulate = (startTime: number) => {
      animationFrameId.current = requestAnimationFrame((currentTime) => {
        const elapsedTime = (currentTime - startTime) / 1000 // Convert to seconds
        setSimulationState((prevState) => ({ ...prevState, time: elapsedTime }))
        simulate(currentTime) // Continue the animation loop
      })
    }

    animationFrameId.current = requestAnimationFrame(simulate)
  }

  const stopSimulation = () => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current)
      animationFrameId.current = null
    }
    setSimulationState({ running: false, time: 0 })
  }

  const updateParams = (newParams: any) => {
    setParams(newParams)
  }

  useEffect(() => {
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [])

  return {
    simulationState,
    startSimulation,
    stopSimulation,
    updateParams,
    params,
  }
}
