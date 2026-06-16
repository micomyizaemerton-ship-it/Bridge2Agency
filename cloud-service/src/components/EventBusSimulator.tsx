/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Terminal, Database, ShieldAlert, Cpu, CheckCircle2, RefreshCw, Send, AlertOctagon, HelpCircle } from 'lucide-react';
import { SystemEvent } from '../types';

interface EventBusSimulatorProps {
  events: SystemEvent[];
  dispatchTestEvent: (appName: string, eventType: string, customPayload?: string) => void;
  clearEvents: () => void;
}

export default function EventBusSimulator({ events, dispatchTestEvent, clearEvents }: EventBusSimulatorProps) {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [processingStep, setProcessingStep] = useState<number>(-1);
  const [simulationSteps, setSimulationSteps] = useState<any[]>([]);

  const scenarios = [
    {
      id: 'pregnancy',
      title: 'Maternal Registr. Loop',
      desc: 'Pregnant woman registers in BridgeLife app (Citizen)',
      steps: [
        { service: 'BridgeLife Portal', status: 'SUCCESS', detail: 'Citizen profile entered. Triggering central identity request.' },
        { service: 'BridgeCore: BridgeID', status: 'SUCCESS', detail: 'Primary Master Patient ID assigned: RW-550e8400.' },
        { service: 'BridgeCore: BridgeEvents', status: 'SUCCESS', detail: 'Event published: MATERNAL_PROFILE_REGISTERED' },
        { service: 'BridgeCommunity Mobile', status: 'SUCCESS', detail: 'CHW assigned. Direct SMS checkup alert dispatched.' },
        { service: 'BridgeCore: BridgeGateway', status: 'SUCCESS', detail: 'Pushed national health record payload to external e-Ubuzima.' },
        { service: 'BridgeGov Dashboard', status: 'SUCCESS', detail: 'National maternal indicator count +1' }
      ]
    },
    {
      id: 'emergency',
      title: 'Emergency Dispatch',
      desc: 'Accident reported at Sector in BridgeResponse',
      steps: [
        { service: 'BridgeResponse Dispatch', status: 'SUCCESS', detail: 'GPS signal matched. Ambulance 02 routes generated.' },
        { service: 'BridgeCore: BridgeEvents', status: 'SUCCESS', detail: 'Event published: EMERGENCY_CRITICAL_ACCIDENT' },
        { service: 'BridgeCore: BridgeNotify', status: 'SUCCESS', detail: 'Queued alert SMS streams sent to local referral physicians.' },
        { service: 'BridgeLink Referrals', status: 'SUCCESS', detail: 'Queried bed availability. Flagged 2 open rooms in Gisenyi post.' },
        { service: 'BridgeCore: BridgeSecurity', status: 'SUCCESS', detail: 'Dispatched emergency override signature audit log.' }
      ]
    },
    {
      id: 'outbreak',
      title: 'Epidemic Outbreak Pipe',
      desc: 'Ebola symptom detected in BridgeCare (Clinic)',
      steps: [
        { service: 'BridgeCare EMR', status: 'SUCCESS', detail: 'Suspected viral hemorrhagic fever code entered in consultations.' },
        { service: 'BridgeCore: BridgeEvents', status: 'SUCCESS', detail: 'Event published: OUTBREAK_ALERT_VHF' },
        { service: 'BridgeCore: BridgeSecurity', status: 'SUCCESS', detail: 'Access restricted. Encrypted health records logs verified.' },
        { service: 'BridgeWatch Surveill.', status: 'SUCCESS', detail: 'Calculated high-infection risk cluster in Musanze district border.' },
        { service: 'BridgeCore: BridgeGateway', status: 'SUCCESS', detail: 'Dispatched real-time JSON webhook package to DHIS2 HMIS.' }
      ]
    }
  ];

  const runScenarioSimulation = (sc: typeof scenarios[number]) => {
    setActiveScenario(sc.id);
    setProcessingStep(0);
    setSimulationSteps(sc.steps);
  };

  useEffect(() => {
    if (activeScenario && processingStep >= 0 && processingStep < simulationSteps.length) {
      const timer = setTimeout(() => {
        // Log individual step to global events feed to show integration
        const step = simulationSteps[processingStep];
        dispatchTestEvent(step.service, `SIMULATED_${step.status}`, step.detail);
        setProcessingStep(prev => prev + 1);
      }, 1500);
      return () => clearTimeout(timer);
    } else if (processingStep === simulationSteps.length) {
      setActiveScenario(null);
      setProcessingStep(-1);
    }
  }, [activeScenario, processingStep, simulationSteps]);

  const centralModules = [
    { id: 'bridge-id', name: 'BridgeID', port: ':3001', desc: 'National Health ID & MPI Indexer', step: 'Step 1 - ACTIVE', active: true },
    { id: 'bridge-events', name: 'BridgeEvents', port: ':3002', desc: 'Agnostic Pub/Sub Event Bus', step: 'Step 2 - ACTIVE', active: true },
    { id: 'bridge-sync', name: 'BridgeSync', port: ':3003', desc: 'Offline-First Sync Engine', step: 'Step 3', active: false },
    { id: 'bridge-notify', name: 'BridgeNotify', port: ':3004', desc: 'SMS, Push Alerts Engine', step: 'Step 4', active: false },
    { id: 'bridge-security', name: 'BridgeSecurity', port: ':3005', desc: 'RBAC Access & Auditing', step: 'Step 5', active: false },
    { id: 'bridge-gw', name: 'BridgeGateway', port: ':3000', desc: 'Secure Proxy Routing', step: 'Step 6', active: false },
    { id: 'bridge-ai', name: 'BridgeAI', port: ':3007', desc: 'Intelligent AI Predictions', step: 'Step 7', active: false }
  ];

  return (
    <div className="flex flex-col gap-6" id="event-bus-pane">
      {/* BridgeCore Architecture Topology Map */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4 select-none">
        <div>
          <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
            <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" /> BridgeCore Central Cloud Backbone
          </span>
          <h3 className="text-base font-bold text-white mt-1">Unified System Topology &amp; Middleware Bus</h3>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Acting as the central secure health cloud database and gateway (analogous to Google Cloud), BridgeCore orchestrates all transactional traffic, syncing, and notifications via isolated internal modules.
          </p>
        </div>

        {/* Gateway Box */}
        <div className="border border-indigo-500/30 rounded-xl p-4 bg-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_4px_20px_rgba(99,102,241,0.06)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 text-lg">
              <span className="font-mono font-bold text-xs text-indigo-300">GW</span>
            </div>
            <div>
              <h4 className="text-xs font-bold text-indigo-200 leading-none font-sans">BridgeGateway</h4>
              <p className="text-[10px] text-indigo-400/80 mt-1.5">Single Public Entry Point · All external applications traffic routes here (Step 6)</p>
            </div>
          </div>
          <span className="text-xs bg-indigo-500/20 border border-indigo-500/30 font-mono font-semibold px-2.5 py-1 rounded-lg text-indigo-300 self-start sm:self-auto shrink-0">
            PORT :3000
          </span>
        </div>

        <div className="flex items-center justify-center -my-1">
          <span className="text-slate-600 font-bold font-mono tracking-widest text-[9px] uppercase">↓ routes to 7 isolated middleware modules ↓</span>
        </div>

        {/* 7 Modules Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mt-1">
          {centralModules.map((mod) => (
            <div
              key={mod.id}
              className={`border rounded-xl p-3 flex flex-col justify-between gap-3 text-left transition duration-150 ${
                mod.active
                  ? 'bg-slate-950 border-emerald-500/30 shadow-[0_2px_10px_rgba(16,185,129,0.05)]'
                  : 'bg-slate-950/40 border-slate-900 opacity-85'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-1">
                  <h5 className={`text-xs font-bold leading-none ${mod.active ? 'text-emerald-400' : 'text-slate-200'}`}>{mod.name}</h5>
                  <span className={`text-[9px] font-mono leading-none ${mod.active ? 'text-emerald-400' : 'text-slate-500'}`}>{mod.port}</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal mt-1.5">{mod.desc}</p>
              </div>
              <span className={`inline-block text-[9px] font-mono font-bold px-1.5 py-0.5 rounded text-center leading-none ${
                mod.active 
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' 
                  : 'bg-slate-900 border border-slate-900 text-slate-500'
              }`}>
                {mod.step}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans" id="event-bus-simulator">
      {/* Simulation triggers */}
      <div className="lg:col-span-1 flex flex-col gap-5">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
            <Cpu className="h-3 w-3" /> One-Update Rule Engine
          </span>
          <h3 className="text-base font-bold text-white">Scenario Trigger Sandbox</h3>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            Select a complex case state to visually run integration event replication through the microservices.
          </p>

          <div className="flex flex-col gap-3.5 mt-4">
            {scenarios.map((sc) => {
              const isSelected = activeScenario === sc.id;
              return (
                <div
                  key={sc.id}
                  id={`scenario-card-${sc.id}`}
                  className={`p-4 rounded-xl border transition-all duration-200 flex flex-col gap-2 relative overflow-hidden ${
                    isSelected 
                      ? 'bg-slate-950 border-emerald-500/20' 
                      : 'bg-slate-950/40 border-slate-900 hover:border-slate-800 hover:bg-slate-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{sc.title}</span>
                    <button
                      id={`run-sc-button-${sc.id}`}
                      disabled={activeScenario !== null}
                      onClick={() => runScenarioSimulation(sc)}
                      className={`text-[10px] font-bold font-mono px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer select-none transition ${
                        activeScenario !== null
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                      }`}
                    >
                      <Play className="h-2.5 w-2.5 fill-current shrink-0" /> Run API Loop
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal">{sc.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-time stats */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4">
          <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest leading-none">Core Cloud Metrics</h4>
          <div className="grid grid-cols-2 gap-3.5 select-none text-xs">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/40">
              <span className="text-[10px] font-mono font-semibold text-slate-500 block leading-none">Event Bus Load</span>
              <span className="text-xl font-bold font-mono text-white mt-1.5 block">0.08 ms</span>
              <span className="text-[9px] font-mono text-slate-400 mt-1 block">Broker Latency</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/40">
              <span className="text-[10px] font-mono font-semibold text-slate-500 block leading-none">Throughput</span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-1.5 block">100% stable</span>
              <span className="text-[9px] font-mono text-slate-400 mt-1 block">0 Failed Transactions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live pipeline simulation visualizer */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        {activeScenario ? (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-4 animate-fade-in" id="visualizer-box">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest leading-none block">Replication visualizer</span>
                <h4 className="text-sm font-bold text-white mt-1">Simulating System Integration Path</h4>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <RefreshCw className="h-3 w-3 animate-spin text-emerald-400" />
                <span>Step {processingStep} of {simulationSteps.length}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 relative mt-1">
              {simulationSteps.map((step, idx) => {
                const isActive = idx === processingStep - 1;
                const isCompleted = idx < processingStep - 1;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs flex items-start gap-3 transition-all duration-300 ${
                      isActive
                        ? 'bg-emerald-500/10 border-emerald-500/30'
                        : isCompleted
                        ? 'bg-slate-950/60 border-slate-800/40 opacity-70'
                        : 'bg-slate-950/10 border-transparent opacity-30'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : isActive ? (
                        <div className="h-4 w-4 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
                      ) : (
                        <div className="h-4 w-4 rounded-full bg-slate-800" />
                      )}
                    </div>
                    <div>
                      <h5 className={`font-mono font-bold ${isActive ? 'text-emerald-300' : 'text-slate-300'}`}>{step.service}</h5>
                      <p className="text-[11px] text-slate-400 mt-0.5">{step.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Rolling Event Logs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white leading-none">BridgeEvents Hub Output (Live Stream)</h4>
            </div>
            <button
              id="clear-logs-btn"
              onClick={clearEvents}
              className="text-[10px] font-mono font-bold text-slate-500 hover:text-slate-300 cursor-pointer"
            >
              Clear Feed
            </button>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-950 font-mono text-[11px] text-slate-400 h-64 overflow-y-auto flex flex-col gap-2 select-text leading-relaxed">
            {events.length === 0 ? (
              <div className="my-auto text-center text-slate-600 font-mono text-xs italic">
                -- Terminal Empty --<br />
                Trigger an event or run a scenario to populate logs.
              </div>
            ) : (
              events.map((ev, idx) => (
                <div key={ev.id || idx} className="border-b border-slate-900/40 pb-2 flex items-start gap-2.5 hover:bg-slate-900/10">
                  <span className="text-slate-600 text-[10px] shrink-0">{ev.timestamp.split('T')[1].substring(0, 8)}</span>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-emerald-400 font-bold">{ev.type}</span>
                      <span className="text-[10px] bg-slate-900 px-1 rounded text-slate-500 uppercase">{ev.source}</span>
                    </div>
                    <p className="text-[10px] text-slate-300 mt-0.5">{ev.payload}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
