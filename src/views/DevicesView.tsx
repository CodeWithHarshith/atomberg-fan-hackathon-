/**
 * Atomberg Aura: Connected Devices & Sensor Inventory View
 * Honest device telemetry with transparent hardware status indicators.
 */

import React from 'react';
import { useAura } from '../context/AuraContext';
import { ConnectedDevice, DeviceConnectionStatus } from '../types';
import {
  Cpu,
  Fan,
  Thermometer,
  Layers,
  Wind,
  Gauge,
  Power,
  Sliders,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';

export const DevicesView: React.FC = () => {
  const { devices, updateDeviceStatus, setShowHardwareModal } = useAura();

  const getStatusBadge = (status: DeviceConnectionStatus) => {
    switch (status) {
      case 'connected':
        return (
          <span className="font-mono text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Connected Live
          </span>
        );
      case 'demo_simulation':
        return (
          <span className="font-mono text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            Demo Simulation
          </span>
        );
      case 'disconnected':
        return (
          <span className="font-mono text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
            Sensor Disconnected
          </span>
        );
      case 'not_configured':
        return (
          <span className="font-mono text-xs font-semibold text-stone-500 bg-stone-50 px-2 py-0.5 rounded border border-stone-200">
            Not Configured
          </span>
        );
      case 'not_responding':
        return (
          <span className="font-mono text-xs font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
            Not Responding
          </span>
        );
    }
  };

  const getCategoryIcon = (category: ConnectedDevice['category']) => {
    switch (category) {
      case 'primary_fan':
        return <Fan className="w-4 h-4 text-stone-900" />;
      case 'sensor':
        return <Thermometer className="w-4 h-4 text-stone-600" />;
      case 'auxiliary_actuator':
        return <Power className="w-4 h-4 text-stone-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-stone-900">
                Connected Devices & Sensor Nodes
              </h1>
              <span className="text-xs font-mono bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                Verified Inventory
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-1">
              Centralized device status registry. Devices operate in software emulation unless linked to an active hardware gateway.
            </p>
          </div>

          <button
            onClick={() => setShowHardwareModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-stone-900 text-white rounded-md hover:bg-stone-800 transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Configure ESP32 Gateway</span>
          </button>
        </div>
      </div>

      {/* Honest Status Policy Disclosure */}
      <div className="p-4 bg-stone-100/70 border border-stone-200 rounded-lg text-xs text-stone-700 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-stone-900 block">
            Integrity Standard on Hardware Connections:
          </strong>
          <span>
            Every sensor and peripheral displays its genuine state. Unconnected hardware (such as differential pressure and mass airflow anemometers) is explicitly labeled as disconnected or unconfigured.
          </span>
        </div>
      </div>

      {/* Devices List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((device) => (
          <div
            key={device.id}
            className="bg-white border border-stone-200 rounded-lg p-5 flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-stone-100 flex items-center justify-center">
                    {getCategoryIcon(device.category)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900 tracking-tight">
                      {device.name}
                    </h3>
                    <span className="text-[11px] font-mono text-stone-500">
                      {device.model}
                    </span>
                  </div>
                </div>

                {getStatusBadge(device.status)}
              </div>

              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                {device.statusNote}
              </p>
            </div>

            {/* Device Metadata Footer (Zero-Pill Rule) */}
            <div className="mt-4 pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between text-[11px] font-mono text-stone-500">
              <div className="flex items-center gap-2">
                <span>Bus: {device.connectionType}</span>
                {device.powerDrawWatts !== undefined && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>Power: {device.powerDrawWatts}W</span>
                  </>
                )}
              </div>

              {device.isOptional && (
                <span className="text-stone-400">Optional Peripheral</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
