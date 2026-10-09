/**
 * Atomberg Aura: Primary Dashboard View
 * Central comfort control with prominent fan, 4-metric grid, AI explanation, and demo runner.
 */

import React from 'react';
import { useAura } from '../context/AuraContext';
import { FanVisualization } from '../components/FanVisualization';
import { MetricCards } from '../components/MetricCards';
import { ComfortDecisionPanel } from '../components/ComfortDecisionPanel';
import { DemoController } from '../components/DemoController';
import { Zap, Wind } from 'lucide-react';
import { FAN_POWER_DRAW } from '../services/comfortEngine';

export const DashboardView: React.FC = () => {
  const { roomInfo, fanState, exhaustFanPower } = useAura();

  const currentPowerWatts = fanState.confirmedPower
    ? FAN_POWER_DRAW[fanState.confirmedSpeed]
    : 0.8;

  return (
    <div className="space-y-6">
      {/* Zone Status Banner */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-stone-900">
              {roomInfo.name}
            </h1>
            <span className="text-xs font-mono text-stone-500">
              ({roomInfo.areaSqMeters} m² · {roomInfo.floor})
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Centrally regulated micro-climate zone. Primary actuator: Atomberg BLDC Ceiling Fan.
          </p>
        </div>

        {/* Connected Auxiliary Quick Strip */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-md">
            <Zap className="w-3.5 h-3.5 text-stone-600" />
            <span className="text-stone-600">Fan Draw:</span>
            <span className="font-semibold text-stone-900">{currentPowerWatts.toFixed(1)}W</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-md">
            <Wind className="w-3.5 h-3.5 text-stone-600" />
            <span className="text-stone-600">Exhaust Relay:</span>
            <span className={`font-semibold ${exhaustFanPower ? 'text-emerald-700' : 'text-stone-500'}`}>
              {exhaustFanPower ? 'ACTIVE' : 'STANDBY'}
            </span>
          </div>
        </div>
      </div>

      {/* 1. Main Fan Control & Aerodynamic Rotor Visualization */}
      <FanVisualization />

      {/* 2. Live Fan Metrics (2-cols mobile / 4-cols desktop) */}
      <MetricCards />

      {/* 3. AI Comfort Decision (Explainable Plain-Language Engine) */}
      <ComfortDecisionPanel />

      {/* 4. Hackathon Presentation & Demo Scenario Simulator */}
      <DemoController />
    </div>
  );
};
