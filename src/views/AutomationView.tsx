/**
 * Atomberg Aura: Smart Automation Rules Engine
 * Configurable environmental thresholds, target devices, hysteresis deadbands, and anti-cycling protections.
 */

import React, { useState } from 'react';
import { useAura } from '../context/AuraContext';
import { AutomationRule, AutomationTrigger, TargetDevice, AutomationAction } from '../types';
import {
  Sliders,
  Play,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

export const AutomationView: React.FC = () => {
  const {
    rules,
    toggleRule,
    addRule,
    deleteRule,
    resetRulesToDefault,
    forceReevaluateDecision,
    readings,
  } = useAura();

  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleDesc, setNewRuleDesc] = useState('');
  const [newTrigger, setNewTrigger] = useState<AutomationTrigger>('temp_above');
  const [newThreshold, setNewThreshold] = useState<number>(29.0);
  const [newHysteresis, setNewHysteresis] = useState<number>(0.8);
  const [newTarget, setNewTarget] = useState<TargetDevice>('smart_fan');
  const [newAction, setNewAction] = useState<AutomationAction>('set_fan_speed');
  const [newActionValue, setNewActionValue] = useState<number>(5);
  const [newCooldown, setNewCooldown] = useState<number>(25);

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    addRule({
      name: newRuleName.trim(),
      description: newRuleDesc.trim() || `Automated trigger when ${newTrigger} threshold reached.`,
      enabled: true,
      trigger: newTrigger,
      threshold: newThreshold,
      unit: newTrigger.startsWith('temp') ? '°C' : newTrigger.startsWith('humidity') ? '%' : 'state',
      hysteresis: newHysteresis,
      targetDevice: newTarget,
      action: newAction,
      actionValue: newActionValue,
      cooldownSeconds: newCooldown,
    });

    setNewRuleName('');
    setNewRuleDesc('');
    setIsAddingRule(false);
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-stone-900">
                Automation Logic & Threshold Rules
              </h1>
              <span className="text-xs font-mono bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                Active Rules: {rules.filter((r) => r.enabled).length} of {rules.length}
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-1">
              Deterministic environmental rules with hysteresis deadbands to eliminate rapid fan thrashing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={forceReevaluateDecision}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-stone-900 text-white rounded-md hover:bg-stone-800 transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Evaluate Against Current Telemetry</span>
            </button>

            <button
              onClick={resetRulesToDefault}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-stone-200 text-stone-700 rounded-md hover:bg-stone-50 transition-colors"
              title="Reset rules to default baseline"
            >
              <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {rules.map((rule) => {
          const isTriggerConditionMet =
            (rule.trigger === 'temp_above' && readings.temperatureC >= rule.threshold) ||
            (rule.trigger === 'temp_below' && readings.temperatureC <= rule.threshold) ||
            (rule.trigger === 'humidity_above' && readings.humidityPercent >= rule.threshold) ||
            (rule.trigger === 'room_unoccupied' && readings.occupancy === false) ||
            (rule.trigger === 'room_occupied' && readings.occupancy === true);

          return (
            <div
              key={rule.id}
              className={`bg-white border rounded-lg p-5 transition-colors shadow-xs ${
                rule.enabled ? 'border-stone-200' : 'border-stone-200/60 opacity-60'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Rule Info */}
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <span className="font-bold text-sm text-stone-900">
                      {rule.name}
                    </span>
                    <span className="text-[11px] font-mono text-stone-500 uppercase px-1.5 py-0.5 rounded bg-stone-100">
                      Target: {rule.targetDevice.replace('_', ' ')}
                    </span>
                    {rule.enabled && isTriggerConditionMet && (
                      <span className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Condition Satisfied</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    {rule.description}
                  </p>

                  {/* Metadata & Hysteresis Metrics (Zero-Pill Rule: unboxed text with separators) */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-stone-500 pt-1">
                    <span>
                      Trigger: {rule.trigger} @ {rule.threshold}
                      {rule.unit}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Hysteresis Deadband: ±{rule.hysteresis}
                      {rule.unit}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Cooldown Dwell: {rule.cooldownSeconds}s</span>
                    <span aria-hidden="true">·</span>
                    <span>Executions: {rule.executionCount}</span>
                  </div>
                </div>

                {/* Controls & Status */}
                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
                      rule.enabled
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    {rule.enabled ? 'Rule Enabled' : 'Rule Disabled'}
                  </button>

                  <button
                    onClick={() => deleteRule(rule.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-700 hover:bg-stone-100 rounded-md transition-colors"
                    title="Delete rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Rule Section */}
      {!isAddingRule ? (
        <button
          onClick={() => setIsAddingRule(true)}
          className="w-full py-3 border-2 border-dashed border-stone-300 hover:border-stone-400 rounded-lg text-xs font-semibold text-stone-700 flex items-center justify-center gap-2 hover:bg-stone-50 transition-colors"
        >
          <Plus className="w-4 h-4 text-stone-500" />
          <span>Configure New Automation Rule</span>
        </button>
      ) : (
        <form
          onSubmit={handleCreateRule}
          className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 space-y-4 shadow-xs text-xs"
        >
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="font-bold text-sm text-stone-900">
              Create Custom Environmental Comfort Rule
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingRule(false)}
              className="text-stone-500 hover:text-stone-800"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Rule Name:
              </label>
              <input
                type="text"
                required
                value={newRuleName}
                onChange={(e) => setNewRuleName(e.target.value)}
                placeholder="e.g. Afternoon Peak Thermal Relief"
                className="w-full px-3 py-2 border border-stone-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Trigger Type:
              </label>
              <select
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value as AutomationTrigger)}
                className="w-full px-3 py-2 border border-stone-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-stone-900"
              >
                <option value="temp_above">Temperature Rises Above (°C)</option>
                <option value="temp_below">Temperature Falls Below (°C)</option>
                <option value="humidity_above">Humidity Exceeds (% RH)</option>
                <option value="room_unoccupied">Room Becomes Unoccupied</option>
                <option value="room_occupied">Room Becomes Occupied</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Threshold Value:
              </label>
              <input
                type="number"
                step="0.5"
                value={newThreshold}
                onChange={(e) => setNewThreshold(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-stone-300 rounded-md text-xs font-mono focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Hysteresis Deadband (Anti-Oscillation):
              </label>
              <input
                type="number"
                step="0.1"
                value={newHysteresis}
                onChange={(e) => setNewHysteresis(parseFloat(e.target.value))}
                className="w-full px-3 py-2 border border-stone-300 rounded-md text-xs font-mono focus:outline-none focus:ring-1 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Target Device:
              </label>
              <select
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value as TargetDevice)}
                className="w-full px-3 py-2 border border-stone-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-stone-900"
              >
                <option value="smart_fan">Primary BLDC Smart Fan</option>
                <option value="exhaust_fan">Auxiliary Exhaust Fan Relay</option>
                <option value="air_conditioner">Connected Air Conditioner</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Actuation Action:
              </label>
              <select
                value={newAction}
                onChange={(e) => setNewAction(e.target.value as AutomationAction)}
                className="w-full px-3 py-2 border border-stone-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-stone-900"
              >
                <option value="set_fan_speed">Set Fan Speed Preset</option>
                <option value="increase_fan_speed">Increase Speed by 1 Level</option>
                <option value="turn_off_fan">Turn Off Fan</option>
                <option value="turn_on_exhaust">Turn On Auxiliary Exhaust</option>
                <option value="turn_off_exhaust">Turn Off Auxiliary Exhaust</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingRule(false)}
              className="px-3 py-1.5 border border-stone-300 rounded-md text-stone-700 hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-stone-900 text-white rounded-md font-semibold hover:bg-stone-800"
            >
              Save Rule
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
