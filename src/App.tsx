/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AuraProvider, useAura } from './context/AuraContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LaunchChecklistModal } from './components/LaunchChecklistModal';
import { HardwareConfigModal } from './components/HardwareConfigModal';
import { DashboardView } from './views/DashboardView';
import { RoomView } from './views/RoomView';
import { AutomationView } from './views/AutomationView';
import { ComfortEngineView } from './views/ComfortEngineView';
import { DevicesView } from './views/DevicesView';
import { HistoryView } from './views/HistoryView';
import { PrivacyView } from './views/PrivacyView';
import { TermsView } from './views/TermsView';
import { SettingsView } from './views/SettingsView';

const ViewRouter: React.FC = () => {
  const { currentView } = useAura();

  switch (currentView) {
    case 'home':
      return <DashboardView />;
    case 'room':
      return <RoomView />;
    case 'automation':
      return <AutomationView />;
    case 'comfort':
      return <ComfortEngineView />;
    case 'devices':
      return <DevicesView />;
    case 'history':
      return <HistoryView />;
    case 'privacy':
      return <PrivacyView />;
    case 'terms':
      return <TermsView />;
    case 'settings':
      return <SettingsView />;
    default:
      return <DashboardView />;
  }
};

export default function App() {
  return (
    <AuraProvider>
      <div className="min-h-screen flex flex-col bg-[#FBFBFA] text-[#1E232A]">
        {/* Top Header conforming to Top Bar Contract */}
        <Header />

        {/* Primary Viewport Canvas */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <ViewRouter />
        </main>

        {/* Global Footer & Legal Disclosures */}
        <Footer />

        {/* Modals & Audit Overlays */}
        <LaunchChecklistModal />
        <HardwareConfigModal />
      </div>
    </AuraProvider>
  );
}
