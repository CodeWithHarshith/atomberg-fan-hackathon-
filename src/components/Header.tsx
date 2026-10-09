/**
 * Atomberg Aura: Top Navigation Bar
 * Follows the 3-Zone Top Bar Contract & Anti-Slop Guidelines
 */

import React from 'react';
import { useAura, ROOMS_LIST } from '../context/AuraContext';
import { Sliders, ShieldCheck, Cpu, Volume2, VolumeX } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    currentRoom,
    setCurrentRoom,
    soundEnabled,
    setSoundEnabled,
    setShowHardwareModal,
    setShowLaunchAuditModal,
    demoMode,
  } = useAura();

  const navLinks = [
    { id: 'home', label: 'Dashboard' },
    { id: 'room', label: 'Room Climate' },
    { id: 'automation', label: 'Automation Rules' },
    { id: 'comfort', label: 'AI Comfort Engine' },
    { id: 'devices', label: 'Connected Devices' },
    { id: 'history', label: 'Event History' },
  ];

  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-30">
      {/* Top Bar Contract: Zone 1 (Wordmark) — Zone 2 (Nav Links) — Zone 3 (Primary Action) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setCurrentView('home')}
              className="text-left group flex items-center gap-2.5 focus-visible:outline-none"
            >
              <div className="w-8 h-8 rounded-md bg-stone-900 flex items-center justify-center text-emerald-400 font-semibold tracking-tighter text-sm border border-stone-800">
                A
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-stone-900 group-hover:text-stone-700 transition-colors whitespace-nowrap">
                  Atomberg Aura
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs font-mono text-stone-600 uppercase tracking-wider">
                  Comfort IoT
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-xs lg:text-sm font-medium text-stone-600">
            {navLinks.map((link) => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setCurrentView(link.id)}
                  className={`relative py-1 transition-colors whitespace-nowrap shrink-0 hover:text-stone-950 ${
                    isActive ? 'text-stone-950 font-semibold' : 'text-stone-600'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-stone-900" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action & Hardware Status */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Audio Feedback Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Acoustic feedback enabled' : 'Acoustic feedback muted'}
              className="p-1.5 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Hardware Config */}
            <button
              onClick={() => setShowHardwareModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-stone-200 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors whitespace-nowrap"
            >
              <Cpu className="w-3.5 h-3.5 text-stone-500" />
              <span>Hardware Link</span>
            </button>

            {/* Launch Checklist Modal Button */}
            <button
              onClick={() => setShowLaunchAuditModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-stone-900 text-xs font-medium text-white hover:bg-stone-800 transition-colors whitespace-nowrap shadow-xs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Launch Readiness</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-bar: Room Selector & Persistent Simulation / Hardware Status */}
      <div className="border-t border-stone-100 bg-stone-50/70 px-4 sm:px-6 lg:px-8 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Room Selector */}
          <div className="flex items-center gap-2">
            <span className="text-stone-600 font-medium whitespace-nowrap">Active Zone:</span>
            <div className="inline-flex rounded-md border border-stone-200 bg-white p-0.5">
              {ROOMS_LIST.map((room) => {
                const isSelected = room.id === currentRoom;
                return (
                  <button
                    key={room.id}
                    onClick={() => setCurrentRoom(room.id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-xs transition-colors whitespace-nowrap ${
                      isSelected
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {room.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Unboxed Status Metadata (Zero-Pill Rule) */}
          <div className="flex items-center gap-3 text-stone-600 text-xs">
            {demoMode ? (
              <span className="font-mono text-amber-700 font-medium">
                DEMO SIMULATION ACTIVE
              </span>
            ) : (
              <span className="font-mono text-emerald-700 font-medium">
                LIVE HARDWARE LINK
              </span>
            )}
            <span aria-hidden="true" className="text-stone-300">·</span>
            <span>Controller: ESP32 Emulated Gateway</span>
            <span aria-hidden="true" className="text-stone-300">·</span>
            <button
              onClick={() => setCurrentView('settings')}
              className="text-stone-600 hover:text-stone-900 underline underline-offset-2 flex items-center gap-1"
            >
              <Sliders className="w-3 h-3" />
              <span>Config</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      <div className="md:hidden border-t border-stone-200 bg-white px-4 py-2 overflow-x-auto flex items-center gap-2 text-xs">
        {navLinks.map((link) => {
          const isActive = currentView === link.id;
          return (
            <button
              key={link.id}
              onClick={() => setCurrentView(link.id)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-stone-900 text-white font-medium'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              {link.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
