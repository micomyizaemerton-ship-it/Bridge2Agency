/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Activity, ShieldAlert, CheckCircle, Database, Link, Settings, Server, Users, Layers, Sparkles } from 'lucide-react';
import { HealthSystem } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  systems: HealthSystem[];
  role: string;
  setRole: (role: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab, systems, role, setRole }: SidebarProps) {
  return (
    <aside className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-100 font-sans" id="bridge-sidebar">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 text-slate-950 p-2.5 rounded-xl font-bold tracking-wider flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <span className="text-sm font-mono font-bold">B2A+</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight leading-none text-white font-sans flex items-center gap-1.5">
              Bridge2Agency<span className="text-emerald-400 font-bold">+</span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-1 font-mono uppercase tracking-wider">National Health OS</p>
          </div>
        </div>
      </div>

      {/* Navigation section */}
      <div className="p-4 flex-1 flex flex-col gap-6 overflow-y-auto">
        <div className="flex flex-col gap-1">
          <span className="px-3 text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest mb-1.5">Core Modules</span>
          {[
            { id: 'status', label: 'Real-time Event Bus', icon: Activity },
            { id: 'bridge-id', label: 'Master Patient Index', icon: Database },
            { id: 'blueprint', label: 'Blueprint Ecosystem', icon: Layers },
            { id: 'ai-copilot', label: 'Intellectual AI Copilot', icon: Sparkles },
          ].map((item) => {
            const IconComponent = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-btn-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all duration-200 text-left ${
                  isSelected
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[inset_0_1px_3px_rgba(16,185,129,0.1)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/40 border border-transparent'
                }`}
              >
                <IconComponent className={`h-4 w-4 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* User Persona / Access Control */}
        <div className="flex flex-col gap-1">
          <span className="px-3 text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest mb-1.5">Simulation Role</span>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/60 rounded-xl border border-slate-800/50">
            {['ministry', 'doctor', 'chw', 'citizen'].map((r) => (
              <button
                key={r}
                id={`role-btn-${r}`}
                onClick={() => setRole(r)}
                className={`py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase transition-all duration-150 ${
                  role === r
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/10'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {r === 'chw' ? 'CHW (Village)' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Integration Pipelines */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-3">
            <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest">Connected Partners</span>
            <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <div className="flex flex-col gap-2 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
            {systems.map((sys) => (
              <div key={sys.id} className="flex items-center justify-between" id={`sys-item-${sys.id}`}>
                <div className="flex items-center gap-2">
                  <span className={`h-1 px-1 rounded-full ${
                    sys.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`} />
                  <span className="text-[11px] font-semibold text-slate-300">{sys.name}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-400">
                  <span>{sys.syncCount} tx</span>
                  <span className="text-[8px] px-1 py-0.5 bg-slate-800 text-slate-400 rounded">sync</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Metadata / Version footer */}
      <div className="p-4 border-t border-slate-800/60 flex flex-col gap-1.5 text-[10px] font-mono text-slate-500 bg-slate-950/25">
        <div className="flex justify-between items-center text-slate-400">
          <span className="flex items-center gap-1"><Server className="h-3 w-3 text-emerald-500/70" /> Pipeline Host</span>
          <span>Online</span>
        </div>
        <div className="flex justify-between items-center">
          <span>License:</span>
          <span className="text-[9px] text-slate-400">MIT © B2A+</span>
        </div>
        <div className="text-[9px] text-center text-slate-600 mt-1 border-t border-slate-800/40 pt-1">
          micomyizaemerton-ship-it
        </div>
      </div>
    </aside>
  );
}
