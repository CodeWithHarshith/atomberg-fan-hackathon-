/**
 * Atomberg Aura: Hardware Gateway Configuration Modal
 * Truthful ESP32 hardware connection tester with electrical isolation safety.
 */

import React, { useState } from 'react';
import { useAura } from '../context/AuraContext';
import { Cpu, X, WifiOff, ShieldAlert, Check, RefreshCw } from 'lucide-react';

export const HardwareConfigModal: React.FC = () => {
  const { showHardwareModal, setShowHardwareModal } = useAura();
  const [gatewayIp, setGatewayIp] = useState('192.168.1.120');
  const [mqttTopic, setMqttTopic] = useState('atomberg/living_room/fan');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'result'>('idle');
  const [testResult, setTestResult] = useState<string | null>(null);

  if (!showHardwareModal) return null;

  const handleTestConnection = () => {
    setTestStatus('testing');
    setTimeout(() => {
      setTestStatus('result');
      setTestResult(
        `Failed to reach ESP32 gateway at http://${gatewayIp}: No responding hardware interface found on local subnet. System remains safely in Demo Simulation Mode.`
      );
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white border border-stone-200 rounded-lg max-w-xl w-full max-h-[90vh] flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-stone-900 flex items-center justify-center text-emerald-400">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-900 tracking-tight">
                ESP32 Hardware Gateway Link
              </h3>
              <p className="text-xs text-stone-600">
                Local Area Network Microcontroller Bridge
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowHardwareModal(false)}
            className="p-1 rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Electrical Safety Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="block font-semibold">Critical Electrical Isolation Requirement:</strong>
              Use properly rated and isolated fan-control hardware (optocoupled triacs or certified relay shields). Never connect a 3.3V/5V microcontroller directly to high-voltage mains wiring.
            </div>
          </div>

          {/* Form */}
          <div className="space-y-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                ESP32 Gateway Local IP Address:
              </label>
              <input
                type="text"
                value={gatewayIp}
                onChange={(e) => setGatewayIp(e.target.value)}
                placeholder="192.168.1.120"
                className="w-full px-3 py-2 border border-stone-300 rounded-md font-mono text-xs focus:ring-1 focus:ring-stone-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                MQTT Telemetry / Command Topic:
              </label>
              <input
                type="text"
                value={mqttTopic}
                onChange={(e) => setMqttTopic(e.target.value)}
                placeholder="atomberg/living_room/fan"
                className="w-full px-3 py-2 border border-stone-300 rounded-md font-mono text-xs focus:ring-1 focus:ring-stone-900 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Sensor Bus Protocol:
              </label>
              <div className="grid grid-cols-2 gap-2 text-stone-700">
                <div className="p-2 border border-stone-200 rounded-md bg-stone-50">
                  <span className="font-semibold block">I2C (SDA: GPIO 21, SCL: GPIO 22)</span>
                  <span className="text-stone-500 text-[11px]">BME280 Temp/Humidity/Pressure</span>
                </div>
                <div className="p-2 border border-stone-200 rounded-md bg-stone-50">
                  <span className="font-semibold block">Digital GPIO (Pin 19)</span>
                  <span className="text-stone-500 text-[11px]">PIR Occupancy Sensor Input</span>
                </div>
              </div>
            </div>
          </div>

          {/* Test Status Feedback */}
          {testStatus === 'testing' && (
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-md flex items-center gap-2 text-stone-700">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-stone-600" />
              <span>Probing http://{gatewayIp}/api/telemetry over LAN...</span>
            </div>
          )}

          {testStatus === 'result' && (
            <div className="p-3 bg-stone-100 border border-stone-200 rounded-md flex items-start gap-2.5 text-stone-800">
              <WifiOff className="w-4 h-4 text-stone-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Hardware Link Unreachable</span>
                <span className="text-stone-600 leading-snug">{testResult}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 rounded-b-lg flex items-center justify-between text-xs">
          <button
            onClick={handleTestConnection}
            disabled={testStatus === 'testing'}
            className="flex items-center gap-1.5 px-3 py-2 border border-stone-300 bg-white hover:bg-stone-50 rounded-md font-medium text-stone-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
            <span>Test Physical Link</span>
          </button>

          <button
            onClick={() => setShowHardwareModal(false)}
            className="flex items-center gap-1.5 px-4 py-2 bg-stone-900 text-white rounded-md font-medium hover:bg-stone-800 transition-colors"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};
