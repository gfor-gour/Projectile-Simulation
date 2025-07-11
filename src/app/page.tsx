"use client"

import { useEffect, useState } from "react"
import { useSimulation } from "@/hooks/useSimulation"
import Canvas from "@/components/simulation/Canvas"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const { simulationState, startSimulation, stopSimulation, updateParams, params } = useSimulation()

  const [startState, setStartState] = useState(false)
  const [formValues, setFormValues] = useState({
    initialVelocity: params.initialVelocity || 20,
    angle: params.angle || 45,
    mass: params.mass || 1,
    airResistance: params.airResistance || false,
    dragCoefficient: params.dragCoefficient || 0.02,
    windSpeed: params.windSpeed || 0,
    windDirection: params.windDirection || 0,
  })

  // Mock results - replace with actual simulation results
  const [results, setResults] = useState({
    timeOfFlight: 2.88,
    maximumHeight: 10.2,
    range: 40.8,
  })

  const handleSliderChange = (name: string, value: number[]) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: value[0],
    }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormValues((prev) => ({
      ...prev,
      airResistance: checked,
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
      if (e.code === "Space") {
        e.preventDefault()
        startState ? handleStop() : handleLaunch()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [startState])

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-white">Simulating Projectile Motion (with Optional Air Resistance)</h1>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr_300px] gap-6 px-6 pb-6">
        {/* Controls Panel */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-xl">Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Initial Speed */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-white font-medium">Initial speed</label>
                <span className="text-white">{formValues.initialVelocity} m/s</span>
              </div>
              <Slider
                value={[formValues.initialVelocity]}
                onValueChange={(value) => handleSliderChange("initialVelocity", value)}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
            </div>

            {/* Launch Angle */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-white font-medium">Launch angle</label>
                <span className="text-white">{formValues.angle}°</span>
              </div>
              <Slider
                value={[formValues.angle]}
                onValueChange={(value) => handleSliderChange("angle", value)}
                max={90}
                min={0}
                step={1}
                className="w-full"
              />
            </div>

            {/* Mass */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-white font-medium">Mass</label>
                <span className="text-white">{formValues.mass} kg</span>
              </div>
              <Slider
                value={[formValues.mass]}
                onValueChange={(value) => handleSliderChange("mass", value)}
                max={10}
                min={0.1}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Air Resistance */}
            <div className="flex justify-between items-center">
              <label className="text-white font-medium">Air resistance</label>
              <Switch checked={formValues.airResistance} onCheckedChange={handleSwitchChange} />
            </div>

            {/* Launch Button */}
            <Button
              onClick={startState ? handleStop : handleLaunch}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 text-lg"
            >
              {startState ? "Stop" : "Launch"}
            </Button>
          </CardContent>
        </Card>

        {/* Simulation Canvas */}
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-4">
          <Canvas simulationState={simulationState} projectileParams={params} missileImageUrl="/torpedo.png" />
        </div>

        {/* Results Panel */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-xl">Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Time of flight</span>
              <span className="text-white font-semibold">{results.timeOfFlight}s</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Maximum height</span>
              <span className="text-white font-semibold">{results.maximumHeight} m</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Range</span>
              <span className="text-white font-semibold">{results.range} m</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
