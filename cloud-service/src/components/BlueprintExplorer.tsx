/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Layers, Star, Play, Link as LinkIcon, AlertCircle, Award, Compass, Zap, Workflow } from 'lucide-react';
import { BridgeApp } from '../types';

interface BlueprintExplorerProps {
  apps: BridgeApp[];
  dispatchTestEvent: (appName: string, eventType: string, customPayload?: string) => void;
}

export default function BlueprintExplorer({ apps, dispatchTestEvent }: BlueprintExplorerProps) {
  const [selectedPhase, setSelectedPhase] = useState<number>(1);
  const [selectedApp, setSelectedApp] = useState<BridgeApp | null>(apps[0]);

  const phases = [
    { id: 1, title: 'Phase 1: Foundation', desc: 'The base operational apps delivering instant Care, Citizen records, CHW platforms, and Ambulance dispatches.' },
    { id: 2, title: 'Phase 2: Intelligence', desc: 'Real-time epidemiological monitoring, district policy boards, referrals syncing, and asset oversight.' },
    { id: 3, title: 'Phase 3: Optimization', desc: 'Supply chains, personnel payroll/training registries, and RSSB insurance verification engines.' },
    { id: 4, title: 'Phase 4: Expansion', desc: 'National laboratories, research registries, and NGO partner workflows.' }
  ];

  const filteredApps = apps.filter(app => app.phase === selectedPhase);

  // Map of integrations to display nicely
  const getIntegrationPartner = (appId: string) => {
    switch (appId) {
      case 'bridge-care': return { name: 'OpenMRS', role: 'Clinical EMR Sync' };
      case 'bridge-life': return { name: 'e-Ubuzima', role: 'National Citizen Records Sync' };
      case 'bridge-community': return { name: 'e-Ubuzima CHW Hub', role: 'Village Level Indicators' };
      case 'bridge-response': return { name: 'e-Banguka Dispatch', role: 'Urgent Referral Routes' };
      case 'bridge-link': return { name: 'e-Banguka', role: 'Dynamic Specialist Booking' };
      case 'bridge-cover': return { name: 'RSSB', role: 'National Insurance Claims Sync' };
      case 'bridge-gov': return { name: 'DHIS2 / HMIS', role: 'Weekly Indicator Pipelines' };
      case 'bridge-watch': return { name: 'DHIS2 Outbreaks', role: 'Syndromic Monitoring' };
      default: return null;
    }
  };

  const currentIntegration = selectedApp ? getIntegrationPartner(selectedApp.id) : null;

  return (
    <div className="flex flex-col gap-6" id="blueprint-explorer">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-start gap-4">
          <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
            <Workflow className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">The Modular Ecosystem Blueprint</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Bridge2Agency+ consists of independent applications connecting through 
              <strong className="text-emerald-400 font-mono font-bold"> BridgeCore</strong>. Every event registered (e.g., patient consult, vaccine tracking, alert dispatch) 
              reverberates logically through the network. This is the One-Update Rule.
            </p>
          </div>
        </div>
      </div>

      {/* Phase Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {phases.map((phase) => (
          <button
            key={phase.id}
            id={`phase-tab-${phase.id}`}
            onClick={() => {
              setSelectedPhase(phase.id);
              const firstAppOfPhase = apps.find(app => app.phase === phase.id);
              if (firstAppOfPhase) setSelectedApp(firstAppOfPhase);
            }}
            className={`p-4 rounded-xl border text-left transition-all duration-200 flex flex-col gap-1.5 cursor-pointer ${
              selectedPhase === phase.id
                ? 'bg-slate-900 border-emerald-500/30 shadow-[0_4px_20px_rgba(16,185,129,0.08)]'
                : 'bg-slate-950 hover:bg-slate-900/40 border-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                selectedPhase === phase.id ? 'text-emerald-400' : 'text-slate-500'
              }`}>
                Phase 0{phase.id}
              </span>
              {selectedPhase === phase.id && <Zap className="h-3 w-3 text-emerald-400 animate-pulse" />}
            </div>
            <h3 className="text-xs font-bold text-slate-200">{phase.title.split(': ')[1]}</h3>
          </button>
        ))}
      </div>

      {/* Main Grid: Left is Apps Menu, Right is Detailed View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Apps side list */}
        <div className="lg:col-span-1 flex flex-col gap-3">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
            <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest mb-1.5 flex items-center justify-between">
              <span>Phase App List</span>
              <span className="text-[10px] font-normal tracking-normal lowercase">{filteredApps.length} modules</span>
            </h3>
            <p className="text-[11px] text-slate-400 leading-relaxed mb-4">{phases[selectedPhase - 1].desc}</p>
            
            <div className="flex flex-col gap-2">
              {filteredApps.map((app) => {
                const isSelected = selectedApp?.id === app.id;
                return (
                  <button
                    key={app.id}
                    id={`app-card-${app?.id}`}
                    onClick={() => setSelectedApp(app)}
                    className={`w-full p-3 rounded-xl border text-left transition-all duration-150 flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-[inset_0_1px_3px_rgba(255,255,255,0.05)]'
                        : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg font-mono text-[11px] font-bold ${
                        isSelected ? 'bg-emerald-500/10 text-emerald-300' : 'bg-slate-900 text-slate-600'
                      }`}>
                        {app.name.substring(6, 8).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">{app.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{app.users}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-500 px-1.5 py-0.5 bg-emerald-500/5 rounded">
                      {app.eventCount} tx
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected App Detail & Event Simulator sandbox */}
        <div className="lg:col-span-2">
          {selectedApp && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-6" id={`app-details-${selectedApp.id}`}>
              {/* Top Banner */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">
                    Live Blueprint Sandbox
                  </span>
                  <h3 className="text-xl font-bold text-white mt-1">{selectedApp.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 font-mono">{selectedApp.purpose}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] font-mono font-bold text-emerald-400">ACTIVE BACKEND</span>
                </div>
              </div>

              {/* Scope & Users */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60 leading-relaxed">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Audience / Users</span>
                  <p className="text-xs font-bold text-slate-200 mt-1.5">{selectedApp.users}</p>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Designed particularly for streamlined workflows suited for health professionals on the ground.
                  </p>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/60">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">Function Scope</span>
                  <p className="text-xs font-bold text-slate-200 mt-1.5">{selectedApp.description}</p>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Provides zero-friction sync utilities communicating back and forth through our centralized core.
                  </p>
                </div>
              </div>

              {/* Partner Integrations */}
              <div className="border-t border-slate-800/60 pt-6">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest mb-3">Partner System Integrations</h4>
                {currentIntegration ? (
                  <div className="bg-slate-950 p-4 rounded-xl border border-dashed border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg">
                        <LinkIcon className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-100">{currentIntegration.name} Connection</span>
                          <span className="text-[9px] bg-emerald-500/15 text-emerald-400 px-1 py-0.2 rounded font-mono font-bold">100% Core API Verified</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{currentIntegration.role}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-500">Auto-Bridge</span>
                  </div>
                ) : (
                  <div className="bg-slate-950 p-4 rounded-xl border border-dashed border-slate-800 flex items-center gap-2.5">
                    <AlertCircle className="h-4 w-4 text-slate-500" />
                    <p className="text-[11px] text-slate-400">
                      Standard REST & WebSocket stubs registered with BridgeGateway. No custom external integrations needed.
                    </p>
                  </div>
                )}
              </div>

              {/* Event sandbox trigger */}
              <div className="border-t border-slate-800/60 pt-6 flex flex-col gap-3">
                <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Simulation Operations</h4>
                <div className="bg-indigo-950/25 border border-indigo-900/30 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <h5 className="text-xs font-bold text-indigo-300">Test Core Update Loop</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Trigger a sample event from this app to trace the One-Update Rule live.
                    </p>
                  </div>
                  <button
                    id={`trigger-event-${selectedApp.id}`}
                    onClick={() => {
                      const sampleTypes: { [key: string]: string } = {
                        'bridge-care': 'CLINICAL_DIAGNOSIS_LOGGED',
                        'bridge-life': 'CITIZEN_REGISTRATION_SUBMITTED',
                        'bridge-community': 'CHW_MATERNAL_VISIT_SCHEDULED',
                        'bridge-response': 'AMBULANCE_DISPATCHED_URGENT',
                        'bridge-watch': 'OUTBREAK_SUSPECT_ALERT',
                        'bridge-gov': 'REPORTING_QUERIES_REFRESH',
                      };
                      const type = sampleTypes[selectedApp.id] || 'GENERIC_HEALTH_TRANSAK';
                      dispatchTestEvent(selectedApp.name, type);
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
                  >
                    <Play className="h-3 w-3 fill-slate-950 text-slate-950" /> Publish Event
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
