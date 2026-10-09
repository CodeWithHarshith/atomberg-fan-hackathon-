/**
 * Atomberg Aura: System Settings & BLDC Motor Technical Specifications
 */

import React from 'react';
import { useAura } from '../context/AuraContext';
import { FAN_POWER_DRAW, FAN_AIRFLOW_RATES, FAN_AIR_VELOCITY } from '../services/comfortEngine';
import { FanSpeedLevel } from '../types';
import {
  Sliders,
  Volume2,
  VolumeX,
  RotateCcw,
  ShieldCheck,
  Zap,
  Info,
  Thermometer,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    tempUnit,
    setTempUnit,
    soundEnabled,
    setSoundEnabled,
    resetRulesToDefault,
    clearHistory,
    resetTodayRuntime,
  } = useAura();

  const handleResetAll = () => {
    if (window.confirm('Reset all prototype data, rules, and runtime timers to initial defaults?')) {
      resetRulesToDefault();
      clearHistory();
      resetTodayRuntime();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-stone-900 flex items-center justify-center text-emerald-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900">
              System Preferences & Hardware Specifications
            </h1>
            <p className="text-xs text-stone-600">
              Atomberg BLDC Motor Curves, Telemetry Units & Session Diagnostics
            </p>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 space-y-4 shadow-xs text-xs">
        <h3 className="font-bold text-sm text-stone-900 pb-2 border-b border-stone-100">
          User Interface & Display Units
        </h3>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-b border-stone-100">
          <div>
            <span className="font-semibold text-stone-900 block">Temperature Measurement Unit:</span>
            <span className="text-stone-500">Select Celsius (°C) or Fahrenheit (°F) for ambient display</span>
          </div>
          <div className="inline-flex rounded-md border border-stone-200 bg-stone-50 p-1">
            <button
              onClick={() => setTempUnit('C')}
              className={`px-3 py-1 font-medium rounded-xs transition-colors ${
                tempUnit === 'C' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
              }`}
            >
              Celsius (°C)
            </button>
            <button
              onClick={() => setTempUnit('F')}
              className={`px-3 py-1 font-medium rounded-xs transition-colors ${
                tempUnit === 'F' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
              }`}
            >
              Fahrenheit (°F)
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-2 border-b border-stone-100">
          <div>
            <span className="font-semibold text-stone-900 block">Acoustic Feedback (Web Audio API):</span>
            <span className="text-stone-500">Play subtle hardware click tones on stepper adjustments and state changes</span>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 font-medium rounded-md border flex items-center gap-1.5 transition-colors ${
              soundEnabled
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-stone-100 text-stone-600 border-stone-200'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'Acoustic Sound ON' : 'Muted'}</span>
          </button>
        </div>
      </div>

      {/* BLDC Motor Technical Specs Table */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 shadow-xs text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
          <div>
            <h3 className="font-bold text-sm text-stone-900">
              Atomberg BLDC Motor Engineering Specifications
            </h3>
            <p className="text-stone-500 mt-0.5">
              1200mm (48") Aerodynamic Rotor Sweep · Sensorless Field-Oriented Control (FOC)
            </p>
          </div>
          <Zap className="w-4 h-4 text-emerald-600" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-semibold">
                <th className="py-2.5 px-3">Speed Level</th>
                <th className="py-2.5 px-3">Power Draw (W)</th>
                <th className="py-2.5 px-3">Airflow Displacement (m³/h)</th>
                <th className="py-2.5 px-3">Induced Velocity (m/s)</th>
                <th className="py-2.5 px-3 font-sans">Acoustic Noise (dBA)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {([0, 1, 2, 3, 4, 5, 6] as FanSpeedLevel[]).map((level) => (
                <tr key={level} className="hover:bg-stone-50">
                  <td className="py-2.5 px-3 font-bold text-stone-900">
                    {level === 0 ? 'Level 0 (Standby)' : `Level ${level}`}
                  </td>
                  <td className="py-2.5 px-3 text-stone-800">
                    {FAN_POWER_DRAW[level]} W
                  </td>
                  <td className="py-2.5 px-3 text-stone-800">
                    {FAN_AIRFLOW_RATES[level]} m³/h
                  </td>
                  <td className="py-2.5 px-3 text-stone-800">
                    {FAN_AIR_VELOCITY[level]} m/s
                  </td>
                  <td className="py-2.5 px-3 font-sans text-stone-600">
                    {level === 0 ? '< 15 dBA' : `${28 + level * 3} dBA (Ultra-quiet)`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Danger Zone: Reset Data */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 shadow-xs text-xs">
        <h3 className="font-bold text-sm text-stone-900 mb-1">
          Prototype Reset Controls
        </h3>
        <p className="text-stone-500 mb-4">
          Reset local storage, automation rules, session history, and runtime counters back to initial factory preset.
        </p>

        <button
          onClick={handleResetAll}
          className="px-3.5 py-2 border border-rose-300 text-rose-800 hover:bg-rose-50 rounded-md font-semibold flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Prototype Data & Cache</span>
        </button>
      </div>
    </div>
  );
};
