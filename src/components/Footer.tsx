/**
 * Atomberg Aura: Application Footer & Legal Disclosure
 * Complies with Section 11 (Legal pages & prototype disclosure).
 */

import React from 'react';
import { useAura } from '../context/AuraContext';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentView, setShowLaunchAuditModal } = useAura();

  return (
    <footer className="border-t border-stone-200 bg-white mt-12 text-stone-600">
      {/* Prototype & Electrical Safety Disclosure Strip */}
      <div className="bg-stone-100/80 border-b border-stone-200 py-3 px-4 sm:px-6 lg:px-8 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-2 text-stone-700">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong className="text-stone-900">Prototype Disclosure:</strong> Atomberg Aura is an engineering hackathon prototype and proposed comfort control concept. Not an officially launched Atomberg product. No official endorsement or certified production deployment is implied.
            </span>
          </div>
          <div className="text-[11px] font-mono text-stone-600 md:text-right shrink-0">
            Electrical Safety: Always use isolated optocouplers / certified relays. Never connect microcontrollers directly to high-voltage AC mains.
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: About */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-stone-900 flex items-center justify-center text-emerald-400 font-bold text-xs">
                A
              </div>
              <span className="font-bold text-sm text-stone-900 tracking-tight">
                Atomberg Aura
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Intelligent Comfort Control for BLDC smart fans. Automating climate equilibrium through ambient temperature, humidity, and occupancy telemetry.
            </p>
          </div>

          {/* Col 2: System Architecture */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900 mb-3">
              Architecture
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setCurrentView('home')}
                  className="hover:text-stone-900 transition-colors"
                >
                  Primary Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('comfort')}
                  className="hover:text-stone-900 transition-colors"
                >
                  Explainable Comfort Engine
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('automation')}
                  className="hover:text-stone-900 transition-colors"
                >
                  Automation Rules & Deadbands
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('devices')}
                  className="hover:text-stone-900 transition-colors"
                >
                  ESP32 & Sensor Gateway
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Governance */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900 mb-3">
              Compliance & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setCurrentView('privacy')}
                  className="hover:text-stone-900 transition-colors underline underline-offset-2"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('terms')}
                  className="hover:text-stone-900 transition-colors underline underline-offset-2"
                >
                  Terms and Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowLaunchAuditModal(true)}
                  className="hover:text-stone-900 transition-colors flex items-center gap-1 text-emerald-800 font-medium"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Launch Readiness Checklist</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('settings')}
                  className="hover:text-stone-900 transition-colors"
                >
                  System Preferences
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Project Status & Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-900 mb-3">
              Project Information
            </h4>
            <p className="text-xs text-stone-600 leading-relaxed mb-2">
              Developed as a demonstration concept for intelligent micro-climate regulation using energy-efficient BLDC ceiling fans.
            </p>
            <div className="text-[11px] font-mono text-stone-600 space-y-1">
              <div>Telemetry Mode: Local Simulation</div>
              <div>Firmware Target: ESP32-WROOM-32E</div>
              <div>Motor Spec: 28W BLDC Sensorless FOC</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Unboxed Metadata */}
        <div className="border-t border-stone-200 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-600">
          <div>
            © {new Date().getFullYear()} Atomberg Aura Concept. All prototype rights reserved.
          </div>
          <div className="flex items-center gap-3">
            <span>Sense</span>
            <span aria-hidden="true">→</span>
            <span>Analyze</span>
            <span aria-hidden="true">→</span>
            <span>Automate</span>
            <span aria-hidden="true">→</span>
            <span>Measure</span>
            <span aria-hidden="true">→</span>
            <span>Improve</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
