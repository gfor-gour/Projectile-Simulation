'use client'

import { useEffect, useState } from 'react'
import { useSimulation } from '@/hooks/useSimulation'
import Canvas from '@/components/simulation/Canvas'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  const {
    simulationState,
    startSimulation,
    stopSimulation,
    updateParams,
    params,
  } = useSimulation()

  const [StartState, setStartState] = useState(false)

  const [formValues, setFormValues] = useState({
    initialVelocity: params.initialVelocity,
    angle: params.angle,
    mass: params.mass,
    airResistance: params.airResistance,
    dragCoefficient: params.dragCoefficient || 0.02,
    windSpeed: params.windSpeed || 0,
    windDirection: params.windDirection || 0,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : parseFloat(value),
    }))
  }

  const handleLaunch = () => {
    updateParams(formValues)
    startSimulation()
    setStartState(true)
  }

  const handleStop = () => {
    stopSimulation()
    setStartState(false)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        StartState ? handleStop() : handleLaunch()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [StartState])

  return (
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold">Missile Motion Simulator</h1>

      {/* Parameter Controls */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-white p-4 rounded-lg shadow">
        <InputField label="Initial Velocity" name="initialVelocity" value={formValues.initialVelocity} onChange={handleChange} />
        <InputField label="Angle" name="angle" value={formValues.angle} onChange={handleChange} />
        <InputField label="Mass" name="mass" value={formValues.mass} onChange={handleChange} />
        <InputField label="Drag Coefficient" name="dragCoefficient" value={formValues.dragCoefficient} onChange={handleChange} />
        <InputField label="Wind Speed" name="windSpeed" value={formValues.windSpeed} onChange={handleChange} />
        <div className="flex flex-col">
          <label htmlFor="windDirection" className="text-sm font-medium">Wind Direction</label>
          <select
        id="windDirection"
        name="windDirection"
        value={formValues.windDirection}
        onChange={e =>
          setFormValues(prev => ({
            ...prev,
            windDirection: parseFloat(e.target.value),
          }))
        }
        className="border rounded px-2 py-1"
          >
        <option value={0}>Left to Right</option>
        <option value={180}>Right to Left </option>
          </select>
        </div>
        <div className="flex items-center gap-2 col-span-2 md:col-span-1">
          <label htmlFor="airResistance" className="text-sm font-medium">Air Resistance</label>
          <input
        type="checkbox"
        id="airResistance"
        name="airResistance"
        checked={formValues.airResistance}
        onChange={handleChange}
          />
        </div>
      </div>

      <Canvas
        simulationState={simulationState}
        projectileParams={params}
        missileImageUrl="/torpedo.png"
      />

      <div className="flex gap-4">
        <Button onClick={handleLaunch}>Launch</Button>
        <Button onClick={handleStop}>Stop</Button>
      </div>
    </div>
  )
}

// Reusable input field component
function InputField({ label, name, value, onChange }: any) {
  return (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-sm font-medium">{label}</label>
      <input
        type="number"
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        className="border rounded px-2 py-1"
      />
    </div>
  )
}
