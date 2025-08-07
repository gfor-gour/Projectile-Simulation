"use client"

import { useEffect, useState } from "react"
import { useSimulation } from "@/hooks/useSimulation"
import Canvas from "@/components/simulation/Canvas"
import PlotVisualization from "@/components/simulation/PlotVisualization"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LiaRocketSolid } from "react-icons/lia";
import { TbRocketOff } from "react-icons/tb";

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

  const [zoom, setZoom] = useState(1)

  // Results state, updated after each simulation
  const [results, setResults] = useState({
    timeOfFlight: 0,
    maximumHeight: 0,
    range: 0,
  })
  // Update results after landing
  useEffect(() => {
    if (!startState) return;
    // Check if projectile has landed
    if (simulationState.position.y < 0 && simulationState.trajectory.length > 1) {
      const traj = simulationState.trajectory;
      // Time of flight: last t where y >= 0 (linear interpolation for better accuracy)
      let timeOfFlight = traj[traj.length - 1].t;
      let range = traj[traj.length - 1].x;
      // Interpolate for more accurate landing time and range
      for (let i = traj.length - 2; i >= 0; i--) {
        if (traj[i].y >= 0) {
          const t1 = traj[i].t, t2 = traj[i + 1].t;
          const y1 = traj[i].y, y2 = traj[i + 1].y;
          const x1 = traj[i].x, x2 = traj[i + 1].x;
          const frac = y1 / (y1 - y2);
          timeOfFlight = t1 + frac * (t2 - t1);
          range = x1 + frac * (x2 - x1);
          break;
        }
      }
      // Maximum height
      const maximumHeight = Math.max(...traj.map(p => p.y));
      setResults({ timeOfFlight: Number(timeOfFlight.toFixed(2)), maximumHeight: Number(maximumHeight.toFixed(2)), range: Number(range.toFixed(2)) });
      setStartState(false); // Stop simulation after landing
    }
  }, [simulationState, startState]);

  const handleInputChange = (name: string, value: string | number) => {
    setFormValues((prev) => ({
      ...prev,
      [name]: typeof value === "string" ? Number(value) : value,
    }))
  }

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
        {/* <h1 className="text-4xl font-bold text-white">Simulating Projectile Motion (with Optional Air Resistance)</h1> */}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr_200px] gap-6 px-6 pb-6">
        {/* Controls Panel */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-xl">Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Zoom out */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-white font-medium">Zoom Out</label>
                <span className="text-white">-{zoom} x</span>
              </div>
              <Slider
                value={[zoom]}
                onValueChange={(value) => setZoom(value[0])}
                max={100}
                min={0}
                step={10}
                className="w-full"
              />
            </div>

            <hr />
            {/* Initial Speed */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-white font-medium">Initial speed</label>
                <span className="text-white">{formValues.initialVelocity} m/s</span>
              </div>
              <Input
                type="number"
                value={formValues.initialVelocity}
                min={1}
                max={2000}
                step={1}
                onChange={e => handleInputChange("initialVelocity", e.target.value)}
                className="w-full"
              />
            </div>

            {/* Launch Angle */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-white font-medium">Launch angle</label>
                <span className="text-white">{formValues.angle}°</span>
              </div>
              <Input
                type="number"
                value={formValues.angle}
                min={0}
                max={90}
                step={1}
                onChange={e => handleInputChange("angle", e.target.value)}
                className="w-full"
              />
            </div>

            {/* Mass */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-white font-medium">Mass</label>
                <span className="text-white">{formValues.mass} kg</span>
              </div>
              <Input
                type="number"
                value={formValues.mass}
                min={0.1}
                max={500}
                step={0.1}
                onChange={e => handleInputChange("mass", e.target.value)}
                className="w-full"
              />
            </div>
            {formValues.airResistance && (
              <>
                {/* Drag Coefficient */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-white font-medium">Drag Coefficient</label>
                    <span className="text-white">{formValues.dragCoefficient}</span>
                  </div>
                  <Slider
                    value={[formValues.dragCoefficient]}
                    onValueChange={(value) => handleSliderChange("dragCoefficient", value)}
                    max={1}
                    min={0.01}
                    step={0.01}
                    className="w-full"
                  />
                </div>

                {/* Wind Speed */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-white font-medium">Wind Speed</label>
                    <span className="text-white">{formValues.windSpeed} m/s</span>
                  </div>
                  <Input
                    type="number"
                    value={formValues.windSpeed}
                    min={0}
                    max={500}
                    step={1}
                    onChange={e => handleInputChange("windSpeed", e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Wind Direction */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-white font-medium">Wind Direction</label>
                    
                  </div>

                    <div className="flex items-center justify-between gap-1 mt-2">
                    <span
                      className={`text-sm font-medium transition-colors ${
                      formValues.windDirection === 180
                        ? "text-primary"
                        : "text-gray-400"
                      }`}
                    >
                      ← Left 180°
                    </span>
                    <button
                      type="button"
                      aria-label="Toggle wind direction"
                      onClick={() =>
                      handleInputChange(
                        "windDirection",
                        formValues.windDirection === 0 ? 180 : 0
                      )
                      }
                      className={`flex items-center justify-center  bg-primary border-primary shadow-lg w-12 h-12 rounded-full border-2 transition-all duration-200
                      `}
                    >
                      <svg
                      width="32"
                      height="32"
                      viewBox="0 0 32 32"
                      className={`transition-transform duration-300 ${
                        formValues.windDirection === 180 ? "rotate-180" : ""
                      }`}
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      >
                      <path
                        d="M6 16h20M18 10l8 6-8 6"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      </svg>
                    </button>
                    <span
                      className={`text-sm font-medium transition-colors ${
                      formValues.windDirection === 0
                        ? "text-primary"
                        : "text-gray-400"
                      }`}
                    >
                      Right → 0°
                    </span>
                    </div>
                </div>
              </>
            )}

            {/* Air Resistance */}
            <div className="flex justify-between items-center">
              <label className="text-white font-medium">Air resistance</label>
              <Switch checked={formValues.airResistance} onCheckedChange={handleSwitchChange} />
            </div>

            {/* Launch Button */}
            <Button
              onClick={startState ? handleStop : handleLaunch}
              className="w-full bg-primary text-white font-semibold py-3 text-lg"
            >
              {startState ? <TbRocketOff /> : <LiaRocketSolid />}
              {startState ? "Stop" : "Launch"}
            </Button>
          </CardContent>
        </Card>

        {/* Simulation Canvas */}
        <div className="space-y-6">
          <Canvas
            simulationState={simulationState}
            projectileParams={params}
            missileImageUrl="/torpedo.png"
            maxWorldHeight={Math.max(zoom * 500, 500)}
            maxWorldRange={Math.max(zoom * 500, 1100)}
          />

          <PlotVisualization simulationState={simulationState} maxPoints={150} />
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
