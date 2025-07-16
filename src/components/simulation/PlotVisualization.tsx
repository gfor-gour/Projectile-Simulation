'use client'

import { SimulationState } from "@/types/simulation";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { Card, CardContent } from "../ui/card";
import { useEffect, useState } from "react";

interface PlotVisualizationProps {
    simulationState: SimulationState;
    maxPoints?: number;
}

interface DataPoint {
    time: number;
    velocity: number;
    vx: number;
    vy: number;
}

export default function PlotVisualization({ simulationState, maxPoints = 100 }: PlotVisualizationProps) {
    const [animatedData, setAnimatedData] = useState<DataPoint[]>([]);
    
    // Calculate velocity data from trajectory
    useEffect(() => {
        const velocityData: DataPoint[] = simulationState.trajectory.map(point => {
            const idx = simulationState.trajectory.indexOf(point);
            if (idx === 0) return {
                time: point.t,
                velocity: Math.sqrt(simulationState.velocity.x ** 2 + simulationState.velocity.y ** 2),
                vx: simulationState.velocity.x,
                vy: simulationState.velocity.y
            };

            // Calculate velocity components using central difference
            const prev = simulationState.trajectory[Math.max(0, idx - 1)];
            const dt = point.t - prev.t;
            const vx = dt > 0 ? (point.x - prev.x) / dt : 0;
            const vy = dt > 0 ? (point.y - prev.y) / dt : 0;
            const v = Math.sqrt(vx * vx + vy * vy);

            return {
                time: point.t,
                velocity: v,
                vx: vx,
                vy: vy
            };
        });

        // If we have more points than maxPoints, sample them
        const stride = Math.max(1, Math.floor(velocityData.length / maxPoints));
        const sampledData = velocityData.filter((_, i) => i % stride === 0);
        
        // Animate the data points
        let currentIndex = 0;
        const intervalId = setInterval(() => {
            if (currentIndex <= sampledData.length) {
                setAnimatedData(sampledData.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(intervalId);
            }
        }, 16); // ~60fps

        return () => clearInterval(intervalId);
    }, [simulationState.trajectory, maxPoints, simulationState.velocity]);

    const commonChartProps = {
        margin: { top: 5, right: 10, left: 40, bottom: 20 },
        height: 150
    };

    const commonAxisProps = {
        tick: { fill: '#94a3b8' },
        stroke: '#94a3b8'
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Velocity Chart */}
            <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-4">
                    <div className="text-sm text-white mb-2 font-semibold">Total Velocity vs Time</div>
                    <ResponsiveContainer width="100%" height={commonChartProps.height}>
                        <LineChart data={animatedData} {...commonChartProps}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                            <XAxis dataKey="time" {...commonAxisProps} />
                            <YAxis {...commonAxisProps} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }}
                                labelStyle={{ color: '#94a3b8' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="velocity" 
                                stroke="#ef4444" 
                                dot={false}
                                strokeWidth={2}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* X Velocity Chart */}
            <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-4">
                    <div className="text-sm text-white mb-2 font-semibold">Horizontal Velocity vs Time</div>
                    <ResponsiveContainer width="100%" height={commonChartProps.height}>
                        <LineChart data={animatedData} {...commonChartProps}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                            <XAxis dataKey="time" {...commonAxisProps} />
                            <YAxis {...commonAxisProps} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }}
                                labelStyle={{ color: '#94a3b8' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="vx" 
                                stroke="#22c55e" 
                                dot={false}
                                strokeWidth={2}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Y Velocity Chart */}
            <Card className="bg-slate-800 border-slate-700">
                <CardContent className="pt-4">
                    <div className="text-sm text-white mb-2 font-semibold">Vertical Velocity vs Time</div>
                    <ResponsiveContainer width="100%" height={commonChartProps.height}>
                        <LineChart data={animatedData} {...commonChartProps}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                            <XAxis dataKey="time" {...commonAxisProps} />
                            <YAxis {...commonAxisProps} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569' }}
                                labelStyle={{ color: '#94a3b8' }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="vy" 
                                stroke="#3b82f6" 
                                dot={false}
                                strokeWidth={2}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
