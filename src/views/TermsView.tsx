/**
 * Atomberg Aura: Terms and Conditions & Hardware Safety Warranty
 * Complies with Section 11 & Mandatory Launch Requirements.
 */

import React from 'react';
import { useAura } from '../context/AuraContext';
import { ShieldAlert, FileText, ArrowLeft, AlertTriangle } from 'lucide-react';

export const TermsView: React.FC = () => {
  const { setCurrentView } = useAura();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 shadow-xs">
        <button
          onClick={() => setCurrentView('home')}
          className="text-xs text-stone-500 hover:text-stone-900 font-medium flex items-center gap-1.5 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Dashboard</span>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-stone-900 flex items-center justify-center text-emerald-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-stone-900">
              Terms and Conditions & Hardware Disclaimers
            </h1>
            <p className="text-xs text-stone-600">
              Atomberg Aura Hackathon Prototype · Effective Date: October 2026
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white border border-stone-200 rounded-lg p-6 sm:p-8 space-y-6 text-xs text-stone-700 leading-relaxed shadow-xs">
        {/* Critical Electrical Safety Notice */}
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-md text-amber-950">
          <div className="flex items-center gap-2 mb-1.5 font-bold text-xs uppercase tracking-wider text-amber-900">
            <ShieldAlert className="w-4 h-4 text-amber-700" />
            <span>Mandatory Electrical Safety Warning</span>
          </div>
          <p className="font-medium leading-relaxed">
            CRITICAL ELECTRICAL HAZARD: Never connect any low-voltage microcontroller (ESP32, Arduino, Raspberry Pi) directly to 110V/230V AC mains electricity. All physical fan actuation must utilize galvanic optical isolation, certified solid-state relays, or manufacturer-approved low-voltage UART/RS-485 interfaces installed by a licensed electrician.
          </p>
        </div>

        {/* 1. Prototype & Non-Endorsement Status */}
        <div>
          <h2 className="text-sm font-bold text-stone-900 mb-2">
            1. Hackathon Prototype Scope & Brand Relationship
          </h2>
          <p className="mb-2">
            Atomberg Aura is an independent hackathon prototype and conceptual demonstration created to evaluate intelligent micro-climate comfort regulation algorithms for BLDC smart ceiling fans.
          </p>
          <p>
            This application is not an officially launched commercial product of Atomberg Technologies Pvt. Ltd., nor does it imply official corporate sponsorship, trademark endorsement, or production hardware integration unless expressly verified in writing.
          </p>
        </div>

        {/* 2. Permitted Use & Software License */}
        <div>
          <h2 className="text-sm font-bold text-stone-900 mb-2">
            2. Permitted Use & Demonstration License
          </h2>
          <p>
            Users are granted a revocable, non-exclusive license to inspect, demonstrate, and test the software for non-commercial educational and prototype evaluation purposes. Reverse engineering of safety interlocks or bypassing anti-cycling protections on real hardware is strictly prohibited.
          </p>
        </div>

        {/* 3. Limitation of Liability */}
        <div>
          <h2 className="text-sm font-bold text-stone-900 mb-2">
            3. Disclaimer of Warranties & Limitation of Liability
          </h2>
          <p className="mb-2">
            THE APPLICATION AND ALL ASSOCIATED AUTOMATION HEURISTICS ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. UNDER NO CIRCUMSTANCES SHALL THE CREATORS OR CONTRIBUTORS BE LIABLE FOR:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Any physical damage to fans, BLDC motor drivers, relay switches, or connected HVAC devices.</li>
            <li>Electrical faults, short circuits, or property damage resulting from improper hardware wiring.</li>
            <li>Inaccuracies in estimated airflow rates or ambient temperature readings due to uncalibrated third-party sensors.</li>
            <li>Loss of comfort, unintended device state changes, or interruption of home network connectivity.</li>
          </ul>
        </div>

        {/* 4. Pending Legal Verification Notice */}
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-md">
          <h3 className="text-xs font-bold text-stone-900 mb-1 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-stone-500" />
            <span>Unresolved Legal Terms Awaiting Publication Review</span>
          </h3>
          <p className="text-stone-600 mb-2">
            Prior to public release or commercial distribution, the legal owner must supply formal legal counsel review for:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-stone-600">
            <li>Binding arbitration clauses and governing law jurisdiction.</li>
            <li>Commercial warranty coverage for certified Atomberg BLDC hardware accessories.</li>
            <li>Consumer Protection (E-Commerce) compliance under applicable jurisdictional statutes.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
