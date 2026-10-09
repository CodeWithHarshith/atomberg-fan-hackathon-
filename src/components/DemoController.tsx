/**
 * Atomberg Aura: Hackathon Presentation Demo Controller
 * Deterministic scenario simulator and guided 9-step presentation walkthrough.
 */

import React, { useState } from 'react';
import { useAura, DEMO_SCENARIOS } from '../context/AuraContext';
import {
  Play,
  RotateCcw,
  FastForward,
  CheckCircle,
  SlidersHorizontal,
  ChevronRight,
  Flame,
  Droplets,
  UserCheck,
  UserX,
  Compass,
} from 'lucide-react';

export const DemoController: React.FC = () => {
  const {
    selectedScenario,
    loadScenario,
    walkthroughStep,
    startWalkthrough,
    nextWalkthroughStep,
    resetWalkthrough,
    readings,
    setManualReadings,
  } = useAura();

  const [isFineTuneOpen, setIsFineTuneOpen] = useState(false);

  const scenarioIcons: Record<string, React.ReactNode> = {
    normal_room: <Compass className="w-3.5 h-3.5" />,
    rising_temperature: <Flame className="w-3.5 h-3.5 text-amber-600" />,
    high_humidity: <Droplets className="w-3.5 h-3.5 text-sky-600" />,
    occupied_room: <UserCheck className="w-3.5 h-3.5 text-emerald-600" />,
    unoccupied_room: <UserX className="w-3.5 h-3.5 text-stone-500" />,
    return_comfort: <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
  };

  // 9-step walkthrough instructions as defined in brief
  const walkthroughSteps = [
    { step: 1, title: 'Step 1: Normal Room Baseline', desc: 'Initialize ambient conditions at 24.0°C and 50% RH.' },
    { step: 2, title: 'Step 2: Select Rising Temperature', desc: 'Simulate heat accumulation to 31.2°C.' },
    { step: 3, title: 'Step 3: Update Simulated Telemetry', desc: 'Observe sensor reading propagation across UI.' },
    { step: 4, title: 'Step 4: Engine Comfort Explanation', desc: 'Inspect the rule-based convective heat calculation.' },
    { step: 5, title: 'Step 5: Increase Simulated Fan Speed', desc: 'Verify BLDC fan speed stepping up to Level 5.' },
    { step: 6, title: 'Step 6: Select High Humidity Spike', desc: 'Simulate moisture influx reaching 82% RH.' },
    { step: 7, title: 'Step 7: Exhaust Actuation Response', desc: 'Trigger connected auxiliary exhaust relay.' },
    { step: 8, title: 'Step 8: Return to Normal Comfort', desc: 'Observe thermal recovery down to 23.8°C.' },
    { step: 9, title: 'Step 9: Review Audit Event Log', desc: 'Navigate to History page to verify persisted log.' },
  ];

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-stone-900 tracking-tight">
              Hackathon Presentation & Demo Scenario Matrix
            </h3>
            <span className="font-mono text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              DEMO SIMULATION
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-0.5">
            Deterministic room conditions for predictable, repeatable evaluation without physical hardware.
          </p>
        </div>

        {/* Walkthrough Controls */}
        <div className="flex items-center gap-2">
          {walkthroughStep === 0 ? (
            <button
              onClick={startWalkthrough}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-stone-900 text-white rounded-md hover:bg-stone-800 transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Start 9-Step Walkthrough</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={nextWalkthroughStep}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-700 text-white rounded-md hover:bg-emerald-800 transition-colors"
              >
                <span>Advance ({walkthroughStep}/9)</span>
                <FastForward className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={resetWalkthrough}
                className="p-1.5 text-xs text-stone-600 hover:text-stone-900 rounded-md border border-stone-200 hover:bg-stone-50"
                title="Reset Walkthrough"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Walkthrough Step Banner if active */}
      {walkthroughStep > 0 && (
        <div className="my-4 bg-emerald-50/70 border border-emerald-200 rounded-md p-3 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-emerald-900">
              WALKTHROUGH ACTIVE:
            </span>
            <span className="font-semibold text-emerald-950">
              {walkthroughSteps[walkthroughStep - 1]?.title}
            </span>
            <span className="text-emerald-700 hidden sm:inline">
              — {walkthroughSteps[walkthroughStep - 1]?.desc}
            </span>
          </div>
          <button
            onClick={nextWalkthroughStep}
            className="text-emerald-900 hover:text-emerald-950 font-semibold underline underline-offset-2 flex items-center gap-1 shrink-0"
          >
            <span>Next Step</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Scenario Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-4">
        {DEMO_SCENARIOS.map((sc) => {
          const isSelected = selectedScenario?.id === sc.id;
          return (
            <button
              key={sc.id}
              onClick={() => loadScenario(sc.id)}
              className={`p-3 text-left rounded-md border text-xs flex flex-col justify-between transition-colors ${
                isSelected
                  ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                  : 'bg-white text-stone-800 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className={isSelected ? 'text-emerald-400' : 'text-stone-500'}>
                    {scenarioIcons[sc.id]}
                  </span>
                  <span className="font-semibold truncate">{sc.name.split('. ')[1]}</span>
                </div>
                <div className={`font-mono text-[11px] ${isSelected ? 'text-stone-300' : 'text-stone-500'}`}>
                  {sc.temperatureC}°C · {sc.humidityPercent}% RH
                </div>
              </div>
              <div className={`mt-2 text-[10px] truncate ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                {sc.occupancy ? 'Occupied' : 'Vacant'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Scenario Description & Expected Behavior Bar */}
      {selectedScenario && (
        <div className="mt-4 p-3 bg-stone-50 rounded-md border border-stone-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="font-semibold text-stone-900">{selectedScenario.name}: </span>
            <span className="text-stone-700">{selectedScenario.description}</span>
          </div>
          <div className="text-stone-600 font-mono text-[11px] shrink-0">
            Expected fan: <span className="font-semibold text-stone-800">{selectedScenario.expectedFanAction}</span>
          </div>
        </div>
      )}

      {/* Fine-Tuning Drawer Toggle */}
      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
        <button
          onClick={() => setIsFineTuneOpen(!isFineTuneOpen)}
          className="text-xs text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1.5"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{isFineTuneOpen ? 'Hide Manual Sliders' : 'Fine-Tune Ambient Variables Manually'}</span>
        </button>
        <span className="text-[11px] text-stone-600 font-mono">
          Variables instantly trigger rule re-evaluation
        </span>
      </div>

      {/* Manual Fine-Tuning Sliders */}
      {isFineTuneOpen && (
        <div className="mt-3 p-4 bg-stone-50 rounded-md border border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {/* Temperature Slider */}
          <div>
            <div className="flex justify-between font-mono mb-1 text-stone-700">
              <span>Ambient Temp:</span>
              <span className="font-bold">{readings.temperatureC.toFixed(1)}°C</span>
            </div>
            <input
              type="range"
              min="18.0"
              max="38.0"
              step="0.2"
              value={readings.temperatureC}
              onChange={(e) => setManualReadings({ temperatureC: parseFloat(e.target.value) })}
              className="w-full accent-stone-900 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Humidity Slider */}
          <div>
            <div className="flex justify-between font-mono mb-1 text-stone-700">
              <span>Relative Humidity:</span>
              <span className="font-bold">{readings.humidityPercent}% RH</span>
            </div>
            <input
              type="range"
              min="30"
              max="95"
              step="1"
              value={readings.humidityPercent}
              onChange={(e) => setManualReadings({ humidityPercent: parseInt(e.target.value, 10) })}
              className="w-full accent-stone-900 h-1.5 bg-stone-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Occupancy Toggle */}
          <div>
            <div className="flex justify-between font-mono mb-1 text-stone-700">
              <span>Room Occupancy:</span>
              <span className="font-bold">{readings.occupancy ? 'Occupied' : 'Vacant'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                onClick={() => setManualReadings({ occupancy: true })}
                className={`py-1 text-xs rounded border transition-colors ${
                  readings.occupancy
                    ? 'bg-stone-900 text-white border-stone-900 font-medium'
                    : 'bg-white text-stone-700 border-stone-200'
                }`}
              >
                Occupied
              </button>
              <button
                onClick={() => setManualReadings({ occupancy: false })}
                className={`py-1 text-xs rounded border transition-colors ${
                  !readings.occupancy
                    ? 'bg-stone-900 text-white border-stone-900 font-medium'
                    : 'bg-white text-stone-700 border-stone-200'
                }`}
              >
                Vacant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
