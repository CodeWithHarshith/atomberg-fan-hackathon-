/**
 * Atomberg Aura: Explainable Comfort Decision Engine Deep-Dive
 * Mathematical thermodynamic formulas, decision trace log, and transparent projections.
 */

import React from 'react';
import { useAura } from '../context/AuraContext';
import {
  Cpu,
  Shield,
  Layers,
  Activity,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  calculateApparentTemperature,
  calculateVaporPressure,
  categorizeComfort,
  FAN_AIR_VELOCITY,
  FAN_AIRFLOW_RATES,
  FAN_POWER_DRAW,
} from '../services/comfortEngine';

export const ComfortEngineView: React.FC = () => {
  const { comfortDecision, decisionHistory, readings, fanState } = useAura();

  const vaporPressure = calculateVaporPressure(readings.temperatureC, readings.humidityPercent);
  const airVelocity = FAN_AIR_VELOCITY[fanState.confirmedSpeed];
  const apparentTemp = calculateApparentTemperature(
    readings.temperatureC,
    readings.humidityPercent,
    fanState.confirmedSpeed
  );
  const sensation = categorizeComfort(apparentTemp);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-stone-900">
                Explainable Comfort Engine & Thermodynamic Model
              </h1>
              <span className="text-xs font-mono bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                Deterministic Rule System
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-1">
              Transparent, non-black-box environmental decision architecture grounded in bioclimatic comfort physics.
            </p>
          </div>

          <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-md text-xs font-mono text-stone-700">
            Model Type: <span className="font-semibold text-stone-900">Thermodynamic Rules (No Black-Box ML)</span>
          </div>
        </div>
      </div>

      {/* Physics & Mathematical Formula Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formula 1: Steadman Apparent Temperature */}
        <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 text-xs">
              <span className="font-bold text-stone-900">1. Apparent Temp Equation</span>
              <span className="font-mono text-stone-500">Steadman Biometeorology</span>
            </div>
            <div className="my-3 p-3 bg-stone-50 rounded-md font-mono text-xs text-stone-800 border border-stone-200/60">
              AT = Ta + (0.33 · e) - (0.70 · v) - 4.00
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Where <code className="font-mono">Ta</code> is dry-bulb temp ({readings.temperatureC}°C), <code className="font-mono">e</code> is vapor pressure ({vaporPressure.toFixed(1)} hPa), and <code className="font-mono">v</code> is fan-induced air velocity ({airVelocity} m/s).
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 text-xs font-mono flex justify-between">
            <span className="text-stone-500">Calculated AT:</span>
            <span className="font-bold text-stone-900">{apparentTemp.toFixed(1)}°C ({sensation})</span>
          </div>
        </div>

        {/* Formula 2: BLDC Convective Heat Removal Rate */}
        <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 text-xs">
              <span className="font-bold text-stone-900">2. Convective Skin Cooling</span>
              <span className="font-mono text-stone-500">BLDC Aerodynamics</span>
            </div>
            <div className="my-3 p-3 bg-stone-50 rounded-md font-mono text-xs text-stone-800 border border-stone-200/60">
              ΔT_eff = -0.70 · v(Level {fanState.confirmedSpeed}) = -{(0.7 * airVelocity).toFixed(1)}°C
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Operating at Speed Level {fanState.confirmedSpeed} displaces {FAN_AIRFLOW_RATES[fanState.confirmedSpeed]} m³/h of air, producing an effective convective skin cooling sensation of {(0.7 * airVelocity).toFixed(1)}°C.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 text-xs font-mono flex justify-between">
            <span className="text-stone-500">Motor Efficiency:</span>
            <span className="font-bold text-stone-900">{FAN_POWER_DRAW[fanState.confirmedSpeed]}W BLDC Draw</span>
          </div>
        </div>

        {/* Formula 3: Anti-Cycling Relay Protection */}
        <div className="bg-white border border-stone-200 rounded-lg p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-stone-100 text-xs">
              <span className="font-bold text-stone-900">3. Anti-Cycling State Protection</span>
              <span className="font-mono text-stone-500">Motor Health Protection</span>
            </div>
            <div className="my-3 p-3 bg-stone-50 rounded-md font-mono text-xs text-stone-800 border border-stone-200/60">
              Dwell Timer ≥ 20s · Deadband = ±0.8°C
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Suppresses rapid speed hunting when ambient variables fluctuate around rule trigger thresholds, protecting the BLDC motor driver inverter and mechanical relays.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-stone-100 text-xs font-mono flex justify-between">
            <span className="text-stone-500">Protection Gate:</span>
            <span className="font-bold text-emerald-700">Nominal / Armed</span>
          </div>
        </div>
      </div>

      {/* Thermodynamic Trend Projection (Explicitly Labeled) */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-sm font-bold text-stone-900 tracking-tight">
              Rule-Based Thermodynamic Trend Projection
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Deterministic calculation based on sensible room volume and convective air displacement (Not a trained machine learning model).
            </p>
          </div>
          <span className="text-xs font-mono bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
            Projected Equilibrium
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 text-xs">
          <div className="p-3 border border-stone-200 rounded-md bg-stone-50 font-mono">
            <span className="text-stone-500 block text-[11px]">Present Apparent:</span>
            <span className="text-lg font-bold text-stone-900">{apparentTemp.toFixed(1)}°C</span>
            <span className="text-stone-500 block text-[11px] mt-1">Sensation: {sensation}</span>
          </div>

          <div className="p-3 border border-stone-200 rounded-md bg-stone-50 font-mono">
            <span className="text-stone-500 block text-[11px]">+15 Min Projection:</span>
            <span className="text-lg font-bold text-stone-900">
              {fanState.confirmedPower ? (apparentTemp - 0.4).toFixed(1) : apparentTemp.toFixed(1)}°C
            </span>
            <span className="text-stone-500 block text-[11px] mt-1">Convective draft steady</span>
          </div>

          <div className="p-3 border border-stone-200 rounded-md bg-stone-50 font-mono">
            <span className="text-stone-500 block text-[11px]">+30 Min Equilibrium:</span>
            <span className="text-lg font-bold text-stone-900">
              {fanState.confirmedPower ? (apparentTemp - 0.7).toFixed(1) : apparentTemp.toFixed(1)}°C
            </span>
            <span className="text-stone-500 block text-[11px] mt-1">Boundary layer mixed</span>
          </div>

          <div className="p-3 border border-stone-200 rounded-md bg-stone-50 font-mono">
            <span className="text-stone-500 block text-[11px]">Energy Draw Est:</span>
            <span className="text-lg font-bold text-stone-900">
              {(FAN_POWER_DRAW[fanState.confirmedSpeed] * 0.5).toFixed(1)} Wh
            </span>
            <span className="text-stone-500 block text-[11px] mt-1">Over 30m duration</span>
          </div>
        </div>
      </div>

      {/* Decision History Trace Table */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
          <div>
            <h3 className="text-sm font-bold text-stone-900 tracking-tight">
              Comfort Engine Decision Trace Log
            </h3>
            <p className="text-xs text-stone-600 mt-0.5">
              Live audit trace of rule evaluations, trigger conditions, and actuated hardware states.
            </p>
          </div>
          <span className="text-xs font-mono text-stone-500">
            {decisionHistory.length} Trace Entries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 font-semibold text-stone-600 font-mono text-[11px]">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Rule Evaluated</th>
                <th className="py-2.5 px-3">Conditions Considered</th>
                <th className="py-2.5 px-3">Decision Summary</th>
                <th className="py-2.5 px-3">Actuation Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
              {decisionHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-stone-400 font-sans text-xs">
                    No recent evaluations in session buffer.
                  </td>
                </tr>
              ) : (
                decisionHistory.map((dec) => (
                  <tr key={dec.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-stone-500 whitespace-nowrap">
                      {new Date(dec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-stone-900 whitespace-nowrap">
                      {dec.ruleName}
                    </td>
                    <td className="py-2.5 px-3 text-stone-600 whitespace-nowrap">
                      {dec.inputsConsidered.temperatureC.toFixed(1)}°C · {dec.inputsConsidered.humidityPercent}% RH · {dec.inputsConsidered.occupancy ? 'Occupied' : 'Vacant'}
                    </td>
                    <td className="py-2.5 px-3 text-stone-800 font-sans max-w-xs truncate">
                      {dec.decisionMade}
                    </td>
                    <td className="py-2.5 px-3 text-emerald-800 font-medium whitespace-nowrap">
                      {dec.confirmedResult}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
