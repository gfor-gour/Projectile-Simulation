"use client"

import { useEffect, useState } from "react"
import { useSimulation } from "@/hooks/useSimulation"
import { getVelocityandAngle } from "@/hooks/MissileAutopilot"
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
  const [initialVelocity, setInitialVelocity] = useState<number | undefined>(undefined)
  const [launchAngle, setLaunchAngle] = useState<number | undefined>(undefined)

  useEffect(() => {
    let isMounted = true
    getVelocityandAngle(simulationState, params).then(result => {
      if (isMounted) {
        setInitialVelocity(result.initialVelocity)
        setLaunchAngle(result.launchAngle)
      }
    })
    return () => { isMounted = false }
  }, [simulationState, params])
  const [startState, setStartState] = useState(false)
  const [TargetPosition, setTargetPosition] = useState({ x: 500, y: 200 })

  // Ensure targetPosition is always up-to-date in formValues and params
  useEffect(() => {
    setFormValues((prev) => ({
      ...prev,
      targetPosition: TargetPosition,
    }))
    updateParams({ ...formValues, targetPosition: TargetPosition })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [TargetPosition])

  const handleSetTarget = () => {
    // Set random x between 100 and 1000, y between 100 and 500
    const x = Math.floor(Math.random() * 900) + 100
    const y = Math.floor(Math.random() * 400) + 100
    setTargetPosition({ x, y })
  }





  const [formValues, setFormValues] = useState({
    initialVelocity: params.initialVelocity || 20,
    angle: params.angle || 45,
    mass: params.mass || 1,
    airResistance: params.airResistance || false,
    dragCoefficient: params.dragCoefficient || 0.02,
    windSpeed: params.windSpeed || 0,
    windDirection: params.windDirection || 0,
    targetPosition: params.targetPosition || TargetPosition, // Default target at ground level
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white">

      {/* Header */}
      <div className="text-center py-8">
      <h1 className="text-4xl font-extrabold text-cyan-400 drop-shadow-lg">
        Projectile Missile Simulation
      </h1>
      <p className="text-lg text-cyan-200 mt-2 mb-4 font-medium">
        Simulate modern missile trajectories with advanced controls and visualization.
      </p>
      {/* Show only if air resistance is disabled */}
      {!formValues.airResistance && (
        <div className="flex flex-col items-center gap-3 w-full">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-center text-cyan-200 w-full justify-center">
        <span className="flex items-center gap-1">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M2 12h20M12 2v20" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="9" stroke="#22d3ee" strokeWidth="2"/>
          </svg>
          <span className="font-semibold">Initial Velocity:</span>
          <span className="ml-1 text-cyan-300">{initialVelocity} <span className="text-xs text-cyan-400">m/s</span></span>
        </span>
        <span className="flex items-center gap-1">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
            <path d="M12 2a10 10 0 1 1-7.07 2.93" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round"/>
            <path d="M12 12L4 20" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <span className="font-semibold">Launch Angle:</span>
          <span className="ml-1 text-cyan-300">{launchAngle} <span className="text-xs text-cyan-400">°</span></span>
        </span>
          </div>
          <Button
        onClick={handleSetTarget}
        className="mb-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-md flex items-center gap-2 px-4 py-2 rounded-lg w-full sm:w-auto"
          >
        <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="#fff" strokeWidth="2"/>
          <path d="M12 6v6l4 2" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Set Random Target Position
          </Button>
          <span className="flex flex-wrap items-center gap-2 text-cyan-400 bg-cyan-900/60 px-3 py-1 rounded-lg shadow w-full sm:w-auto justify-center">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
          <path d="M12 2v20M2 12h20" stroke="#22d3ee" strokeWidth="2"/>
          <circle cx="12" cy="12" r="4" stroke="#22d3ee" strokeWidth="2"/>
        </svg>
        <span className="font-semibold">Target Position:</span>
        <span className="ml-1">{TargetPosition.x}, {TargetPosition.y}</span>
          </span>
        </div>
      )}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[270px_1fr_220px] gap-8 px-8 pb-8">
      {/* Controls Panel */}
      <Card className="bg-slate-800/90 border-cyan-900 shadow-xl">
        <CardHeader>
        <CardTitle className="text-cyan-300 text-xl">Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
      

        <hr className="border-cyan-900" />
        {/* Initial Speed */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
          <label className="text-cyan-200 font-medium">Initial speed</label>
          <span className="text-cyan-200">{formValues.initialVelocity} m/s</span>
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
          <label className="text-cyan-200 font-medium">Launch angle</label>
          <span className="text-cyan-200">{formValues.angle}°</span>
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
          <label className="text-cyan-200 font-medium">Mass</label>
          <span className="text-cyan-200">{formValues.mass} kg</span>
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
            <label className="text-cyan-200 font-medium">Drag Coefficient</label>
            <span className="text-cyan-200">{formValues.dragCoefficient}</span>
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
            <label className="text-cyan-200 font-medium">Wind Speed</label>
            <span className="text-cyan-200">{formValues.windSpeed} m/s</span>
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
            <label className="text-cyan-200 font-medium">Wind Direction</label>
            </div>
            <div className="flex items-center justify-between gap-1 mt-2">
            <span
              className={`text-sm font-medium transition-colors ${formValues.windDirection === 180
                ? "text-cyan-400"
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
              className={`flex items-center justify-center bg-cyan-600 border-cyan-400 shadow-lg w-12 h-12 rounded-full border-2 transition-all duration-200`}
            >
              <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              className={`transition-transform duration-300 ${formValues.windDirection === 180 ? "rotate-180" : ""
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
              className={`text-sm font-medium transition-colors ${formValues.windDirection === 0
                ? "text-cyan-400"
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
          <label className="text-cyan-200 font-medium">Air resistance</label>
          <Switch checked={formValues.airResistance} onCheckedChange={handleSwitchChange} />
        </div>

        {/* Launch Button */}
        <Button
          onClick={startState ? handleStop : handleLaunch}
          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-semibold py-3 text-lg shadow-lg flex items-center justify-center gap-2"
        >
          {startState ? <TbRocketOff size={22} /> : <LiaRocketSolid size={22} />}
          {startState ? "Stop" : "Launch Missile"}
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
      <Card className="bg-gradient-to-br md:h-3/6 from-slate-800 via-slate-900 to-slate-950 border-0 shadow-2xl rounded-2xl p-0 overflow-hidden">
        <CardHeader className="bg-cyan-900/80 rounded-t-2xl px-6 py-4 border-b border-cyan-800">
          <CardTitle className="text-cyan-300 text-xl flex items-center gap-2">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="#22d3ee" strokeWidth="2" />
              <path d="M8 12l2.5 2.5L16 9" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 px-6 py-6">
          <div className="flex items-center justify-between">
            <span className="text-cyan-200 font-medium">Time of flight</span>
            <span className="text-cyan-100 font-bold text-lg bg-cyan-900/60 px-3 py-1 rounded-lg shadow">{results.timeOfFlight} <span className="text-cyan-400 text-base font-normal">s</span></span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-cyan-200 font-medium">Maximum height</span>
            <span className="text-cyan-100 font-bold text-lg bg-cyan-900/60 px-3 py-1 rounded-lg shadow">{results.maximumHeight} <span className="text-cyan-400 text-base font-normal">m</span></span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-cyan-200 font-medium">Range</span>
            <span className="text-cyan-100 font-bold text-lg bg-cyan-900/60 px-3 py-1 rounded-lg shadow">{results.range} <span className="text-cyan-400 text-base font-normal">m</span></span>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  )
}
