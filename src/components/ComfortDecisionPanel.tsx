/**
 * Atomberg Aura: AI Comfort Decision Panel
 * Explainable, transparent environmental decision log with underlying rule trace.
 */

import React from 'react';
import { useAura } from '../context/AuraContext';
import { Cpu, CheckCircle2, ShieldAlert, ArrowRight, RefreshCw } from 'lucide-react';

export const ComfortDecisionPanel: React.FC = () => {
  const { comfortDecision, forceReevaluateDecision, fanState } = useAura();

  const formattedTime = new Date(comfortDecision.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 shadow-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-stone-900 flex items-center justify-center text-emerald-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 tracking-tight">
              Explainable Comfort Automation Decision
            </h3>
            <p className="text-xs text-stone-600">
              Deterministic rule-based comfort logic (ASHRAE-55 thermal equilibrium)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-stone-600">
            Evaluated: {formattedTime}
          </span>
          <button
            onClick={forceReevaluateDecision}
            title="Re-evaluate comfort conditions against rules"
            className="p-1 rounded-md text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Plain-Language Explanation */}
      <div className="py-4">
        <div className="bg-stone-50 border border-stone-200 rounded-md p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
            Plain Language Analysis
          </div>
          <p className="text-sm text-stone-900 font-medium leading-relaxed">
            "{comfortDecision.plainLanguageExplanation}"
          </p>
        </div>
      </div>

      {/* Grid: Inputs Considered -> Decision -> Action -> Result */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 text-xs">
        {/* 1. Inputs Considered */}
        <div className="border border-stone-200 rounded-md p-3 bg-white">
          <div className="font-semibold text-stone-600 uppercase tracking-wider text-[11px] mb-2">
            1. Inputs Considered
          </div>
          <div className="space-y-1 font-mono text-stone-700">
            <div className="flex justify-between">
              <span className="text-stone-600">Ambient Temp:</span>
              <span className="font-medium">{comfortDecision.inputsConsidered.temperatureC.toFixed(1)}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Relative Humidity:</span>
              <span className="font-medium">{comfortDecision.inputsConsidered.humidityPercent}% RH</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Apparent Temp:</span>
              <span className="font-medium">{comfortDecision.inputsConsidered.apparentTempC.toFixed(1)}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Room Occupancy:</span>
              <span className="font-medium">
                {comfortDecision.inputsConsidered.occupancy === null
                  ? 'Sensor N/A'
                  : comfortDecision.inputsConsidered.occupancy
                  ? 'Present'
                  : 'Vacant'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Temp Trend:</span>
              <span className="font-medium capitalize">{comfortDecision.inputsConsidered.tempTrend}</span>
            </div>
          </div>
        </div>

        {/* 2. Decision Made */}
        <div className="border border-stone-200 rounded-md p-3 bg-white">
          <div className="font-semibold text-stone-600 uppercase tracking-wider text-[11px] mb-2">
            2. Decision Made
          </div>
          <div className="space-y-1.5">
            <div className="text-stone-600 text-[11px]">
              Active Rule: <span className="font-medium text-stone-900">{comfortDecision.ruleName}</span>
            </div>
            <p className="text-stone-700 font-medium leading-snug">
              {comfortDecision.decisionMade}
            </p>
          </div>
        </div>

        {/* 3. Requested Action */}
        <div className="border border-stone-200 rounded-md p-3 bg-white">
          <div className="font-semibold text-stone-600 uppercase tracking-wider text-[11px] mb-2">
            3. Requested Action
          </div>
          <div className="flex items-start gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
            <p className="text-stone-800 font-medium leading-snug">
              {comfortDecision.requestedAction}
            </p>
          </div>
          {fanState.mode === 'manual' && (
            <p className="mt-2 text-[11px] text-amber-700">
              Note: Fan is currently in Manual Mode. Automatic actuation suppressed.
            </p>
          )}
        </div>

        {/* 4. Confirmed Result */}
        <div className="border border-stone-200 rounded-md p-3 bg-white">
          <div className="font-semibold text-stone-600 uppercase tracking-wider text-[11px] mb-2">
            4. Confirmed Result
          </div>
          <div className="flex items-start gap-1.5">
            {comfortDecision.antiCyclingProtected ? (
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <p className="text-stone-800 font-medium leading-snug">
              {comfortDecision.confirmedResult}
            </p>
          </div>
          <p className="mt-2 text-[11px] text-stone-600 font-mono">
            State verification: Software bus verified
          </p>
        </div>
      </div>
    </div>
  );
};
