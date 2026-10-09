/**
 * Atomberg Aura: Engineering Ceiling Fan Visualization & Main Control
 * Technical schematic representation with dynamic rotational velocity.
 */

import React from 'react';
import { useAura } from '../context/AuraContext';
import { FanSpeedLevel } from '../types';
import { FAN_AIRFLOW_RATES, FAN_AIR_VELOCITY, FAN_POWER_DRAW } from '../services/comfortEngine';
import { Power, Wind, Sparkles, Gauge } from 'lucide-react';

export const FanVisualization: React.FC = () => {
  const {
    fanState,
    setFanPower,
    setFanSpeed,
    setFanMode,
    demoMode,
  } = useAura();

  const isPowerOn = fanState.confirmedPower && fanState.confirmedSpeed > 0;
  const currentSpeed = fanState.confirmedSpeed;
  const speedPercentage = Math.round((currentSpeed / 6) * 100);

  // Speed-dependent rotation duration (lower = faster)
  // Speed 6: 0.7s, Speed 5: 1.0s, Speed 4: 1.4s, Speed 3: 2.0s, Speed 2: 2.8s, Speed 1: 3.8s
  const rotationDuration = isPowerOn
    ? [0, 3.8, 2.8, 2.0, 1.4, 1.0, 0.7][currentSpeed]
    : 0;

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 shadow-xs">
      {/* Header with Mode Toggle & Confirmation telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-stone-900 tracking-tight">
              Primary BLDC Aerodynamic Rotor
            </h2>
            <span className="text-xs font-mono text-stone-600">
              Atomberg Renesa+ 1200mm
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-600 mt-1">
            <span>Requested: {fanState.requestedPower ? `ON (L${fanState.requestedSpeed})` : 'OFF'}</span>
            <span aria-hidden="true">·</span>
            <span className={isPowerOn ? 'text-emerald-700 font-medium' : 'text-stone-600'}>
              Confirmed Hardware: {fanState.confirmedPower ? `ENGAGED (L${fanState.confirmedSpeed})` : 'DISENGAGED'}
            </span>
            {demoMode && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-800 font-mono">
                  [Simulated controller]
                </span>
              </>
            )}
          </div>
        </div>

        {/* Manual vs Auto Comfort Mode Switcher (Segmented Control - Buttons, not pills) */}
        <div className="inline-flex rounded-md border border-stone-200 bg-stone-50 p-1">
          <button
            onClick={() => setFanMode('manual')}
            className={`px-3 py-1.5 text-xs font-medium rounded-xs transition-colors whitespace-nowrap ${
              fanState.mode === 'manual'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Manual Control
          </button>
          <button
            onClick={() => setFanMode('auto_comfort')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xs transition-colors whitespace-nowrap ${
              fanState.mode === 'auto_comfort'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Auto Comfort Engine</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Technical Visualization & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-6">
        {/* Left: Interactive Fan Technical Graphic */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-stone-50/70 border border-stone-100 rounded-lg">
          <div className="relative w-56 h-56 flex items-center justify-center">
            {/* Outer Stator Ring */}
            <div className="absolute inset-0 rounded-full border border-stone-300 border-dashed opacity-60" />
            <div className="absolute inset-4 rounded-full border border-stone-200" />

            {/* Subtle Wind Vortex rings when active */}
            {isPowerOn && (
              <div
                className="absolute inset-8 rounded-full border border-emerald-300/60 pointer-events-none"
                style={{
                  animation: `spin ${rotationDuration * 2}s linear infinite`,
                }}
              />
            )}

            {/* Rotating Rotor Blades SVG */}
            <svg
              viewBox="0 0 200 200"
              className="w-48 h-48 select-none"
              style={{
                animation: isPowerOn ? `spin ${rotationDuration}s linear infinite` : 'none',
                transformOrigin: '100px 100px',
              }}
            >
              <defs>
                <linearGradient id="bladeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#262626" />
                  <stop offset="100%" stopColor="#404040" />
                </linearGradient>
                <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodOpacity="0.2" />
                </filter>
              </defs>

              {/* Blade 1 (0 deg) */}
              <g transform="rotate(0 100 100)">
                <path
                  d="M 96 90 L 91 18 C 91 12 109 12 109 18 L 104 90 Z"
                  fill="url(#bladeGrad)"
                  filter="url(#shadow)"
                />
                <line x1="100" y1="20" x2="100" y2="85" stroke="#525252" strokeWidth="1" />
              </g>

              {/* Blade 2 (120 deg) */}
              <g transform="rotate(120 100 100)">
                <path
                  d="M 96 90 L 91 18 C 91 12 109 12 109 18 L 104 90 Z"
                  fill="url(#bladeGrad)"
                  filter="url(#shadow)"
                />
                <line x1="100" y1="20" x2="100" y2="85" stroke="#525252" strokeWidth="1" />
              </g>

              {/* Blade 3 (240 deg) */}
              <g transform="rotate(240 100 100)">
                <path
                  d="M 96 90 L 91 18 C 91 12 109 12 109 18 L 104 90 Z"
                  fill="url(#bladeGrad)"
                  filter="url(#shadow)"
                />
                <line x1="100" y1="20" x2="100" y2="85" stroke="#525252" strokeWidth="1" />
              </g>

              {/* Central Motor Hub Housing */}
              <circle cx="100" cy="100" r="24" fill="#1C1917" stroke="#292524" strokeWidth="2" />
              <circle cx="100" cy="100" r="18" fill="#292524" />
              <circle cx="100" cy="100" r="8" fill={isPowerOn ? '#16A34A' : '#78716C'} />
            </svg>

            {/* Center Status Badge Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 mt-28">
                {isPowerOn ? `L${currentSpeed}` : 'OFF'}
              </span>
            </div>
          </div>

          {/* Quick Aerodynamic Telemetry Under Fan */}
          <div className="mt-3 flex items-center justify-between w-full px-2 text-xs text-stone-600 font-mono">
            <span>Airflow: {FAN_AIRFLOW_RATES[currentSpeed]} m³/h</span>
            <span>Velocity: {FAN_AIR_VELOCITY[currentSpeed]} m/s</span>
            <span>Motor: {FAN_POWER_DRAW[currentSpeed]}W</span>
          </div>
        </div>

        {/* Right: Operational Controls */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-5">
          {/* Power Toggle & Speed Level Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFanPower(!fanState.confirmedPower)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-md font-semibold text-xs tracking-wide transition-colors ${
                  fanState.confirmedPower
                    ? 'bg-stone-900 text-white hover:bg-stone-800'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <Power className={`w-4 h-4 ${fanState.confirmedPower ? 'text-emerald-400' : 'text-stone-400'}`} />
                <span>{fanState.confirmedPower ? 'POWER: ON' : 'POWER: OFF'}</span>
              </button>

              <div className="text-xs text-stone-600">
                <span>Rotor Status: </span>
                <span className="font-semibold text-stone-900">
                  {isPowerOn ? `Active @ Level ${currentSpeed} (${speedPercentage}%)` : 'Idle Standby'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-bold font-mono tracking-tight text-stone-900">
                {isPowerOn ? `L${currentSpeed}` : '0'}
              </span>
              <span className="text-xs text-stone-600 block">Speed Level</span>
            </div>
          </div>

          {/* Speed Stepper Buttons (Level 1 to 6) */}
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-stone-700 mb-2">
              <span className="flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-stone-600" />
                <span>BLDC Speed Presets (1 to 6)</span>
              </span>
              <span className="text-stone-600 text-xs">
                {fanState.mode === 'auto_comfort' ? 'Auto Comfort override active' : 'Direct manual drive'}
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {/* Off Button */}
              <button
                onClick={() => setFanSpeed(0)}
                className={`py-2 px-2 text-xs font-mono font-medium rounded-md border text-center transition-colors ${
                  currentSpeed === 0
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                }`}
              >
                OFF
              </button>

              {/* Levels 1-6 */}
              {([1, 2, 3, 4, 5, 6] as FanSpeedLevel[]).map((level) => {
                const isSelected = currentSpeed === level && fanState.confirmedPower;
                return (
                  <button
                    key={level}
                    onClick={() => setFanSpeed(level)}
                    className={`py-2 px-2 text-xs font-mono font-medium rounded-md border text-center transition-colors ${
                      isSelected
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                    }`}
                  >
                    <span>L{level}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Fine Speed Slider */}
          <div>
            <div className="flex items-center justify-between text-xs text-stone-600 mb-1.5 font-mono">
              <span>0% (0 RPM)</span>
              <span>Linear Air Velocity Regulator</span>
              <span>100% (350 RPM)</span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              step="1"
              value={fanState.confirmedPower ? currentSpeed : 0}
              onChange={(e) => setFanSpeed(parseInt(e.target.value, 10) as FanSpeedLevel)}
              className="w-full accent-stone-900 cursor-pointer h-2 bg-stone-200 rounded-lg"
            />
          </div>

          {/* Hardware Connection Truth Disclosure */}
          <div className="bg-stone-50 rounded-md p-3 border border-stone-200/80 text-xs text-stone-600 flex items-start gap-2.5">
            <Wind className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-stone-800">
                Physical fan controller: Not connected (Operating in Demo Mode)
              </p>
              <p className="mt-0.5 text-stone-600">
                Speed adjustments and state transitions are executed within the software simulation layer. For physical motor control, connect an isolated ESP32 gateway module to the RS-485/UART interface.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
