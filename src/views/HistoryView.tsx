/**
 * Atomberg Aura: Event & Automation History Audit Log
 * Searchable, filterable audit records with CSV/JSON export capabilities.
 */

import React, { useState } from 'react';
import { useAura } from '../context/AuraContext';
import {
  FileText,
  Download,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  SlidersHorizontal,
} from 'lucide-react';

export const HistoryView: React.FC = () => {
  const {
    history,
    clearHistory,
    exportHistoryCSV,
    exportHistoryJSON,
  } = useAura();

  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredHistory = history.filter((item) => {
    const matchesType =
      filterType === 'all' ||
      (filterType === 'automatic' && item.eventType === 'automatic_rule') ||
      (filterType === 'manual' && item.eventType === 'manual_control') ||
      (filterType === 'demo' && item.eventType === 'demo_scenario');

    const matchesSearch =
      searchTerm.trim() === '' ||
      item.roomName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.requestedAction.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.triggeredBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.ruleName && item.ruleName.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white border border-stone-200 rounded-lg p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-stone-900">
                Environmental & Actuation Event History
              </h1>
              <span className="text-xs font-mono bg-stone-100 text-stone-700 px-2 py-0.5 rounded">
                Audit Trail ({history.length} logged)
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-1">
              Verifiable sequence of ambient readings, rule evaluations, manual adjustments, and simulation triggers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportHistoryCSV}
              disabled={history.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-stone-200 text-stone-700 rounded-md hover:bg-stone-50 disabled:opacity-40 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={exportHistoryJSON}
              disabled={history.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-stone-200 text-stone-700 rounded-md hover:bg-stone-50 disabled:opacity-40 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-stone-500" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={clearHistory}
              disabled={history.length === 0}
              className="p-1.5 text-stone-400 hover:text-rose-700 hover:bg-stone-100 rounded-md disabled:opacity-40 transition-colors"
              title="Clear history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-stone-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-md w-full sm:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 font-medium rounded-xs transition-colors ${
              filterType === 'all'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilterType('automatic')}
            className={`px-3 py-1 font-medium rounded-xs transition-colors ${
              filterType === 'automatic'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Auto Rules
          </button>
          <button
            onClick={() => setFilterType('manual')}
            className={`px-3 py-1 font-medium rounded-xs transition-colors ${
              filterType === 'manual'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Manual Actions
          </button>
          <button
            onClick={() => setFilterType('demo')}
            className={`px-3 py-1 font-medium rounded-xs transition-colors ${
              filterType === 'demo'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Demo Scenarios
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by action, room, or trigger..."
            className="w-full pl-8 pr-3 py-1.5 border border-stone-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-stone-900"
          />
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white border border-stone-200 rounded-lg overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 font-semibold text-stone-600 font-mono text-[11px]">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Zone</th>
                <th className="py-3 px-4">Conditions (T / RH)</th>
                <th className="py-3 px-4">Trigger / Rule</th>
                <th className="py-3 px-4">Requested Action</th>
                <th className="py-3 px-4">Confirmed Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
              {filteredHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400 font-sans text-xs">
                    No history events match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-4 text-stone-500 whitespace-nowrap">
                      {new Date(item.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded ${
                          item.eventType === 'automatic_rule'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : item.eventType === 'demo_scenario'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-stone-100 text-stone-800 border border-stone-200'
                        }`}
                      >
                        {item.eventType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-900 font-sans font-medium whitespace-nowrap">
                      {item.roomName}
                    </td>
                    <td className="py-3 px-4 text-stone-600 whitespace-nowrap">
                      {item.temperatureC.toFixed(1)}°C · {item.humidityPercent}% RH
                    </td>
                    <td className="py-3 px-4 text-stone-700 font-sans whitespace-nowrap max-w-xs truncate">
                      {item.ruleName || item.triggeredBy}
                    </td>
                    <td className="py-3 px-4 text-stone-900 font-sans font-medium">
                      {item.requestedAction}
                    </td>
                    <td className="py-3 px-4 text-emerald-800 font-sans">
                      {item.confirmedResult}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
