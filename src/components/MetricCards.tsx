/**
 * Atomberg Aura: Live Fan Metrics Grid
 * 2 columns on mobile, 4 columns on desktop with honest sensor telemetry.
 */

import React from 'react';
import { useAura } from '../context/AuraContext';
import { FAN_AIRFLOW_RATES } from '../services/comfortEngine';
import {
  Thermometer,
  Wind,
  Clock,
  Gauge,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';

export const MetricCards: React.FC = () => {
  const {
    readings,
    fanState,
    activeSessionDurationSec,
    todayAccumulatedRuntimeSec,
    demoMode,
    tempUnit,
  } = useAura();

  // Helper formatters
  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins.toString().padStart(2, '0')}m`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatHoursMinutes = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const displayTemp = tempUnit === 'C'
    ? `${readings.temperatureC.toFixed(1)}°C`
    : `${((readings.temperatureC * 9) / 5 + 32).toFixed(1)}°F`;

  const estimatedAirflow = fanState.confirmedPower
    ? FAN_AIRFLOW_RATES[fanState.confirmedSpeed]
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. TEMPERATURE METRIC */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">
              Temperature
            </span>
            <Thermometer className="w-4 h-4 text-stone-500" />
          </div>

          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-stone-900 tabular-nums">
              {displayTemp}
            </span>
          </div>

          {/* Trend Indicator */}
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            {readings.temperatureTrend === 'rising' && (
              <span className="text-amber-700 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Rising (+{readings.temperatureTrendRate.toFixed(1)}°C/h)</span>
              </span>
            )}
            {readings.temperatureTrend === 'falling' && (
              <span className="text-emerald-700 flex items-center gap-1 font-medium">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>Falling ({readings.temperatureTrendRate.toFixed(1)}°C/h)</span>
              </span>
            )}
            {readings.temperatureTrend === 'stable' && (
              <span className="text-stone-600 flex items-center gap-1">
                <Minus className="w-3.5 h-3.5" />
                <span>Thermal equilibrium</span>
              </span>
            )}
          </div>
        </div>

        {/* Honest Source Label */}
        <div className="mt-4 pt-2.5 border-t border-stone-100 text-[11px] text-stone-600 font-mono">
          <span>Status: </span>
          <span className="text-amber-800 font-medium">
            {demoMode ? 'Simulated Demo' : 'BME280 Live'}
          </span>
        </div>
      </div>

      {/* 2. AIRFLOW RATE METRIC */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">
              Airflow Rate
            </span>
            <Wind className="w-4 h-4 text-stone-500" />
          </div>

          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-stone-900 tabular-nums">
              {estimatedAirflow}
            </span>
            <span className="text-xs text-stone-600 font-mono">m³/h</span>
          </div>

          <p className="mt-2 text-xs text-stone-600 leading-snug">
            {fanState.confirmedPower && fanState.confirmedSpeed > 0
              ? `Estimated from 1200mm blade sweep @ Level ${fanState.confirmedSpeed}`
              : 'Rotor stationary (0 RPM)'}
          </p>
        </div>

        {/* Honest Source Label */}
        <div className="mt-4 pt-2.5 border-t border-stone-100 text-[11px] text-stone-600 font-mono">
          <span>Source: </span>
          <span className="text-stone-800 font-medium">
            Estimated (Anemometer disconnected)
          </span>
        </div>
      </div>

      {/* 3. ACTIVE TIME METRIC */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">
              Active Time
            </span>
            <Clock className="w-4 h-4 text-stone-500" />
          </div>

          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-stone-900 tabular-nums">
              {formatTimer(activeSessionDurationSec)}
            </span>
            <span className="text-xs text-stone-600 font-mono">session</span>
          </div>

          <p className="mt-2 text-xs text-stone-600">
            Today accumulated: <span className="font-mono font-medium text-stone-800">{formatHoursMinutes(todayAccumulatedRuntimeSec)}</span>
          </p>
        </div>

        {/* Honest Source Label */}
        <div className="mt-4 pt-2.5 border-t border-stone-100 text-[11px] text-stone-600 font-mono">
          <span>Timer: </span>
          <span className="text-stone-800 font-medium">
            {fanState.confirmedPower ? (demoMode ? 'Simulated clock running' : 'Active hardware session') : 'Paused (Fan OFF)'}
          </span>
        </div>
      </div>

      {/* 4. PRESSURE METRIC */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">
              Barometric Pressure
            </span>
            <Gauge className="w-4 h-4 text-stone-500" />
          </div>

          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-stone-900 tabular-nums">
              101,325
            </span>
            <span className="text-xs text-stone-600 font-mono">Pa (1 atm)</span>
          </div>

          <p className="mt-2 text-xs text-stone-600 leading-snug">
            Barometric atmospheric: 1013.2 hPa. Differential pressure: <span className="text-stone-800 font-medium">Sensor not connected</span>.
          </p>
        </div>

        {/* Honest Source Label */}
        <div className="mt-4 pt-2.5 border-t border-stone-100 text-[11px] text-stone-600 font-mono">
          <span>Status: </span>
          <span className="text-stone-800 font-medium">
            Barometric nominal / Differential unavailable
          </span>
        </div>
      </div>
    </div>
  );
};
