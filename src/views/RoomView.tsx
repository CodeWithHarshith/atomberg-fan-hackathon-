/**
 * Atomberg Aura: Room Climate & Environmental Analysis View
 * Interactive historical charts, ASHRAE-55 comfort zone mapping, and sensor telemetry.
 */

import React, { useState } from 'react';
import { useAura } from '../context/AuraContext';
import {
  Thermometer,
  Droplets,
  Wind,
  Layers,
  Activity,
  Compass,
} from 'lucide-react';
import { calculateApparentTemperature, categorizeComfort } from '../services/comfortEngine';

export const RoomView: React.FC = () => {
  const {
    roomInfo,
    readings,
    fanState,
    historyChartData,
    tempUnit,
    demoMode,
  } = useAura();

  const [activeChartMetric, setActiveChartMetric] = useState<'temp' | 'humidity'>('temp');

  const apparentTemp = calculateApparentTemperature(
    readings.temperatureC,
    readings.humidityPercent,
    fanState.confirmedSpeed
  );
  const comfortCategory = categorizeComfort(apparentTemp);

  // Psychrometric comfort envelope coordinates
  // ASHRAE 55 summer comfort bounds: 23°C - 26°C, 30% - 60% RH
  const isInAshraeComfort =
    readings.temperatureC >= 22.5 &&
    readings.temperatureC <= 26.5 &&
    readings.humidityPercent >= 35 &&
    readings.humidityPercent <= 65;

  // Chart min/max scaling
  const temps = historyChartData.map((d) => d.temperatureC);
  const minTemp = Math.floor(Math.min(...temps)) - 1;
  const maxTemp = Math.ceil(Math.max(...temps)) + 1;

  const humidities = historyChartData.map((d) => d.humidityPercent);
  const minHum = Math.max(20, Math.floor(Math.min(...humidities)) - 5);
  const maxHum = Math.min(100, Math.ceil(Math.max(...humidities)) + 5);

  return (
    <div className="space-y-6">
      {/* Room Header */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-stone-900">
                {roomInfo.name} — Environmental Dynamics
              </h1>
              <span className="text-xs font-mono bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                Zone Area: {roomInfo.areaSqMeters} m²
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-1">
              Real-time ambient sensing, historical diurnal telemetry, and ASHRAE-55 thermal equilibrium analysis.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-stone-500">Source:</span>
            <span className="text-stone-800 font-semibold">
              {demoMode ? 'Simulated Environmental Feed' : 'BME280 Hardware Bus'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Comfort Envelope & Live Sensor States */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Comfort Envelope (ASHRAE-55 2D Plane) */}
        <div className="lg:col-span-6 bg-white border border-stone-200 rounded-lg p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-stone-600" />
                <h3 className="text-sm font-bold text-stone-900 tracking-tight">
                  ASHRAE-55 Thermal Comfort Envelope
                </h3>
              </div>
              <span className="text-xs font-mono text-stone-500">
                2D Psychrometric Zone
              </span>
            </div>

            <p className="text-xs text-stone-600 my-3 leading-relaxed">
              Maps sensible dry-bulb temperature against relative humidity. Green boundary demarcates the standard human thermal neutrality boundary.
            </p>

            {/* Visual SVG Scatter Chart for Comfort Zone */}
            <div className="relative bg-stone-50 border border-stone-200 rounded-md p-4 h-56 flex flex-col justify-between">
              <svg viewBox="0 0 300 160" className="w-full h-full">
                {/* Axes */}
                <line x1="30" y1="130" x2="290" y2="130" stroke="#CBD5E1" strokeWidth="1" />
                <line x1="30" y1="20" x2="30" y2="130" stroke="#CBD5E1" strokeWidth="1" />

                {/* Grid lines */}
                <line x1="30" y1="75" x2="290" y2="75" stroke="#E2E8F0" strokeDasharray="3 3" />
                <line x1="160" y1="20" x2="160" y2="130" stroke="#E2E8F0" strokeDasharray="3 3" />

                {/* Comfort zone polygon (Temp: 22-26°C -> x: 90 to 180, RH: 35-65% -> y: 55 to 95) */}
                <rect
                  x="100"
                  y="50"
                  width="90"
                  height="50"
                  fill="#DCFCE7"
                  stroke="#16A34A"
                  strokeWidth="1.5"
                  rx="4"
                  opacity="0.8"
                />
                <text x="145" y="78" fill="#15803D" fontSize="8" textAnchor="middle" fontWeight="bold">
                  Comfort Neutrality Zone
                </text>

                {/* Current Condition Point */}
                {/* Scale: Temp 16-36°C (x: 30 to 290), RH 20-90% (y: 130 to 20) */}
                {(() => {
                  const clampedTemp = Math.min(36, Math.max(16, readings.temperatureC));
                  const clampedRh = Math.min(90, Math.max(20, readings.humidityPercent));
                  const px = 30 + ((clampedTemp - 16) / 20) * 260;
                  const py = 130 - ((clampedRh - 20) / 70) * 110;
                  return (
                    <g>
                      <circle cx={px} cy={py} r="5" fill="#1C1917" stroke="#FFFFFF" strokeWidth="1.5" />
                      <text x={px} y={py - 8} fill="#1C1917" fontSize="8" fontWeight="bold" textAnchor="middle">
                        Current ({readings.temperatureC}°C, {readings.humidityPercent}%)
                      </text>
                    </g>
                  );
                })()}

                {/* Axis Labels */}
                <text x="30" y="145" fill="#64748B" fontSize="7">16°C</text>
                <text x="160" y="145" fill="#64748B" fontSize="7" textAnchor="middle">26°C</text>
                <text x="290" y="145" fill="#64748B" fontSize="7" textAnchor="end">36°C (Temp)</text>

                <text x="25" y="130" fill="#64748B" fontSize="7" textAnchor="end">20%</text>
                <text x="25" y="75" fill="#64748B" fontSize="7" textAnchor="end">55%</text>
                <text x="25" y="25" fill="#64748B" fontSize="7" textAnchor="end">90% (RH)</text>
              </svg>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
            <span className="text-stone-600">Current Comfort State:</span>
            <span className={`font-semibold ${isInAshraeComfort ? 'text-emerald-700' : 'text-amber-800'}`}>
              {isInAshraeComfort ? 'Within Comfort Envelope' : `${comfortCategory} (Equilibrium Action Applied)`}
            </span>
          </div>
        </div>

        {/* Right: Sensor Status & Micro-Climate Diagnostics */}
        <div className="lg:col-span-6 bg-white border border-stone-200 rounded-lg p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-stone-600" />
                <h3 className="text-sm font-bold text-stone-900 tracking-tight">
                  Active Sensor Inventory & Health
                </h3>
              </div>
              <span className="text-xs font-mono text-stone-500">
                Zone Telemetry
              </span>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              {/* Temp / Humidity Sensor */}
              <div className="p-3 border border-stone-200 rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Thermometer className="w-4 h-4 text-stone-500" />
                  <div>
                    <span className="font-semibold text-stone-900 block">Bosch BME280 Environmental Sensor</span>
                    <span className="text-stone-500 text-[11px]">Reports dry-bulb temp, relative humidity & barometric pressure</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-emerald-700 font-medium block">Nominal</span>
                  <span className="text-stone-500 text-[11px]">{readings.temperatureC}°C · {readings.humidityPercent}%</span>
                </div>
              </div>

              {/* PIR Occupancy Sensor */}
              <div className="p-3 border border-stone-200 rounded-md flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-stone-500" />
                  <div>
                    <span className="font-semibold text-stone-900 block">Passive Infrared (PIR) Motion Sensor</span>
                    <span className="text-stone-500 text-[11px]">Monitors room vacancy for automated eco-comfort modulation</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-emerald-700 font-medium block">
                    {readings.occupancy ? 'Occupied' : 'Vacant'}
                  </span>
                  <span className="text-stone-500 text-[11px]">Pin GPIO 19</span>
                </div>
              </div>

              {/* Thermal Anemometer (Honest: Not Connected) */}
              <div className="p-3 border border-stone-200 rounded-md flex items-center justify-between bg-stone-50">
                <div className="flex items-center gap-2.5">
                  <Wind className="w-4 h-4 text-stone-400" />
                  <div>
                    <span className="font-semibold text-stone-700 block">Thermal Mass Anemometer (Airflow)</span>
                    <span className="text-stone-500 text-[11px]">Optional probe for direct volumetric measurement</span>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-stone-500 block">Not Connected</span>
                  <span className="text-stone-500 text-[11px]">Estimated via RPM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-mono text-stone-600">
            <span>Apparent Temperature (Steadman):</span>
            <span className="font-bold text-stone-900 text-sm">{apparentTemp.toFixed(1)}°C</span>
          </div>
        </div>
      </div>

      {/* Historical 24-Hour Telemetry Time Series Chart */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
          <div>
            <h3 className="text-sm font-bold text-stone-900 tracking-tight">
              24-Hour Environmental Time Series
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Simulated diurnal cycle illustrating temperature fluctuations and automated fan speed responses.
            </p>
          </div>

          {/* Metric Selector Buttons */}
          <div className="inline-flex rounded-md border border-stone-200 bg-stone-50 p-1 text-xs">
            <button
              onClick={() => setActiveChartMetric('temp')}
              className={`px-3 py-1 font-medium rounded-xs transition-colors ${
                activeChartMetric === 'temp'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Temperature Curve (°C)
            </button>
            <button
              onClick={() => setActiveChartMetric('humidity')}
              className={`px-3 py-1 font-medium rounded-xs transition-colors ${
                activeChartMetric === 'humidity'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Relative Humidity (% RH)
            </button>
          </div>
        </div>

        {/* SVG Time Series Chart */}
        <div className="mt-4 h-64 w-full">
          <svg viewBox="0 0 900 240" className="w-full h-full select-none">
            {/* Grid Lines */}
            <line x1="50" y1="30" x2="880" y2="30" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="50" y1="80" x2="880" y2="80" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="50" y1="130" x2="880" y2="130" stroke="#F1F5F9" strokeWidth="1" />
            <line x1="50" y1="180" x2="880" y2="180" stroke="#F1F5F9" strokeWidth="1" />

            {/* Baseline axis */}
            <line x1="50" y1="200" x2="880" y2="200" stroke="#CBD5E1" strokeWidth="1" />

            {/* Path rendering */}
            {(() => {
              const count = historyChartData.length;
              const stepX = (880 - 50) / (count - 1);
              const points = historyChartData.map((d, index) => {
                const x = 50 + index * stepX;
                const val = activeChartMetric === 'temp' ? d.temperatureC : d.humidityPercent;
                const min = activeChartMetric === 'temp' ? minTemp : minHum;
                const max = activeChartMetric === 'temp' ? maxTemp : maxHum;
                const y = 190 - ((val - min) / (max - min || 1)) * 150;
                return { x, y, val, time: d.timestamp, speed: d.fanSpeed };
              });

              const pathString = points.reduce((acc, curr, idx) => {
                return idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`;
              }, '');

              return (
                <g>
                  {/* Line */}
                  <path
                    d={pathString}
                    fill="none"
                    stroke={activeChartMetric === 'temp' ? '#1C1917' : '#0284C7'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Points */}
                  {points.map((pt, i) => (
                    <g key={i}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="3"
                        fill={activeChartMetric === 'temp' ? '#1C1917' : '#0284C7'}
                        stroke="#FFFFFF"
                        strokeWidth="1"
                      />
                      {/* Show timestamp every 4 points */}
                      {i % 4 === 0 && (
                        <text
                          x={pt.x}
                          y={218}
                          fontSize="9"
                          fill="#64748B"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          {pt.time}
                        </text>
                      )}
                    </g>
                  ))}
                </g>
              );
            })()}

            {/* Y Axis Labels */}
            <text x="45" y="35" fontSize="9" fill="#64748B" textAnchor="end" fontFamily="monospace">
              {activeChartMetric === 'temp' ? `${maxTemp}°C` : `${maxHum}%`}
            </text>
            <text x="45" y="115" fontSize="9" fill="#64748B" textAnchor="end" fontFamily="monospace">
              {activeChartMetric === 'temp'
                ? `${Math.round((maxTemp + minTemp) / 2)}°C`
                : `${Math.round((maxHum + minHum) / 2)}%`}
            </text>
            <text x="45" y="195" fontSize="9" fill="#64748B" textAnchor="end" fontFamily="monospace">
              {activeChartMetric === 'temp' ? `${minTemp}°C` : `${minHum}%`}
            </text>
          </svg>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-stone-600 font-mono">
          <span>Simulation window: Last 24 Hours</span>
          <span>Sample Interval: 60 minutes</span>
        </div>
      </div>
    </div>
  );
};
