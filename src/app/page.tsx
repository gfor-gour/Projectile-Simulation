'use client'
import { useEffect } from 'react'
import { useSimulation } from '@/hooks/useSimulation'
import Canvas from '@/components/simulation/Canvas'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const { simulationState, startSimulation, stopSimulation, params } = useSimulation()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        if (simulationState.time === 0) {
          startSimulation()
        } else {
          stopSimulation()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [simulationState.time, startSimulation, stopSimulation])

  return (
    <div className="p-6 space-y-4 bg-gray-400">
      <h1 className="text-2xl font-bold">Missile Motion Simulator</h1>
      <Canvas simulationState={simulationState} projectileParams={params} missileImageUrl="/torpedo.png" />
      <div className="flex gap-4">
        <Button onClick={startSimulation}>Launch</Button> 
        <Button onClick={stopSimulation}>Stop</Button>
      </div>
    </div>
  )
}
