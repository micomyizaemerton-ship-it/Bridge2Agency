/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import BlueprintExplorer from './components/BlueprintExplorer';
import BridgeIDRegistry from './components/BridgeIDRegistry';
import EventBusSimulator from './components/EventBusSimulator';
import AICopilot from './components/AICopilot';
import { Patient, HealthSystem, BridgeApp, SystemEvent, ChatMessage, ImageResult } from './types';
import { Heart, Activity, ShieldAlert, CheckCircle, Database, Server, RefreshCw, LayoutGrid, HelpCircle } from 'lucide-react';

const DISTRICT_CODES: Record<string, string> = {
  Nyarugenge: 'NYG', Gasabo: 'GAB', Kicukiro: 'KIC',
  Bugesera: 'BUG', Gatsibo: 'GAT', Kayonza: 'KAY',
  Kirehe: 'KIR', Ngoma: 'NGM', Nyagatare: 'NYT', Rwamagana: 'RWA',
  Huye: 'HUY', Gisagara: 'GIS', Nyanza: 'NYA', Nyamagabe: 'NYM',
  Ruhango: 'RUH', Muhanga: 'MUH', Kamonyi: 'KAM', Nyaruguru: 'NYR',
  Musanze: 'MUS', Burera: 'BUR', Gakenke: 'GAK', Rulindo: 'RUL', Gicumbi: 'GIC',
  Rubavu: 'RUB', Rusizi: 'RUS', Nyabihu: 'NYB', Ngororero: 'NGR',
  Karongi: 'KAR', Rutsiro: 'RTS', Nyamasheke: 'NYS',
  International: 'INT', Unknown: 'UNK', Kigali: 'KG'
};

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('status');
  const [role, setRole] = useState<string>('ministry');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [networkStatus, setNetworkStatus] = useState<'ONLINE' | 'OFFLINE'>('ONLINE');
  const [mpiSequence, setMpiSequence] = useState<number>(84723);
  const [offlineLocalSeq, setOfflineLocalSeq] = useState<number>(1);

  // Initializing mock systems live status
  const [systems, setSystems] = useState<HealthSystem[]>([
    { id: 'openmrs', name: 'OpenMRS Connector', description: 'Clinical electronic records broker', status: 'ONLINE', lastSync: '10s ago', syncCount: 142 },
    { id: 'eubuzima', name: 'e-Ubuzima Core', description: 'National health registry pipeline', status: 'ONLINE', lastSync: '1m ago', syncCount: 94 },
    { id: 'ebanguka', name: 'e-Banguka Engine', description: 'Referrals resource scheduler', status: 'ONLINE', lastSync: '10m ago', syncCount: 38 },
    { id: 'rssb', name: 'RSSB Claims Portal', description: 'National insurance verification', status: 'ONLINE', lastSync: '5m ago', syncCount: 81 },
    { id: 'dhis2', name: 'DHIS2 HMIS Sync', description: 'Surveillance outbreak compiler', status: 'ONLINE', lastSync: '30s ago', syncCount: 220 }
  ]);

  // Initializing the 12 apps of Bridge2Agency+
  const [apps, setApps] = useState<BridgeApp[]>([
    // Phase 1
    { id: 'bridge-care', name: 'BridgeCare', description: 'Clinical electronic record system. Directly synched with localized OpenMRS instances.', phase: 1, icon: 'EMR', users: 'Hospitals, Clinics, Health Posts', purpose: 'Patient intake, digital diagnostics, maternity monitoring, emergency admissions', status: 'CONNECTED', eventCount: 121 },
    { id: 'bridge-life', name: 'BridgeLife', description: 'Patient-centric mobile health file. Grants citizens agency over medical dossiers.', phase: 1, icon: 'Citizen', users: 'Citizens and Families', purpose: 'Appointment scheduling, vaccine logs, medication alerts, pregnancy tracker', status: 'CONNECTED', eventCount: 84 },
    { id: 'bridge-community', name: 'BridgeCommunity', description: 'Mobile tool matching Community Health Workers (CHWs/Abajyanama b\'ubuzima).', phase: 1, icon: 'CHW', users: 'CHWs and Community Supervisors', purpose: 'Household health maps, home pregnancy checks, routine child milestone logs', status: 'CONNECTED', eventCount: 153 },
    { id: 'bridge-response', name: 'BridgeResponse', description: 'Ambulance location manager & dispatcher. Real-time emergency vehicle optimization.', phase: 1, icon: 'Ambulance', users: 'Dispatch coordinators, Emergency staff', purpose: 'Accident GPS matching, emergency route optimization, ER unit hospital alerts', status: 'CONNECTED', eventCount: 42 },
    
    // Phase 2
    { id: 'bridge-watch', name: 'BridgeWatch', description: 'National outbreak detector. Consolidates syndromic profiles from clinical charts.', phase: 2, icon: 'Surveillance', users: 'Epidemiologists, Outbreak teams', purpose: 'Infection cluster tracking, real-time disease maps, laboratory alert queues', status: 'CONNECTED', eventCount: 19 },
    { id: 'bridge-gov', name: 'BridgeGov', description: 'Ministry health indicators portal. Houses decision-support intelligence dashboards.', phase: 2, icon: 'Government', users: 'MINISANTE, RBC directors, District officers', purpose: 'Weekly policy mapping, strategic resource allotment, program indicators', status: 'CONNECTED', eventCount: 52 },
    { id: 'bridge-link', name: 'BridgeLink', description: 'Inter-facility hospital referral management. Synchronized with e-Banguka.', phase: 2, icon: 'Referral', users: 'Referring physicians, bed coordinators', purpose: 'Specialist consultation search, hospital bed vacancy audits, result tracking', status: 'CONNECTED', eventCount: 33 },
    { id: 'bridge-asset', name: 'BridgeAsset', description: 'Critical biomedical equipment and facility readiness tracking platform.', phase: 2, icon: 'Biomedical', users: 'Clinical engineers, facility directors', purpose: 'Oxygen generator audits, cold-chain temperature alerts, vaccine fridge logs', status: 'CONNECTED', eventCount: 11 },

    // Phase 3
    { id: 'bridge-flow', name: 'BridgeFlow', description: 'National level pharmaceutical supply chain tracker. Integrates distribution routes.', phase: 3, icon: 'Logistics', users: 'Store managers, district suppliers', purpose: 'Inventory audits, expiring drug alerts, predictive consumption demand', status: 'CONNECTED', eventCount: 22 },
    { id: 'bridge-work', name: 'BridgeWork', description: 'Healthcare workforce credentials and training logging. Maintains staff files.', phase: 3, icon: 'HR', users: 'HR coordinators, professional councils', purpose: 'Physician registries, nursing licenses, dynamic village staffing maps', status: 'CONNECTED', eventCount: 8 },
    { id: 'bridge-cover', name: 'BridgeCover', description: 'Dynamic insurance claims pipeline. Integrates directly with RSSB systems.', phase: 3, icon: 'Insurance', users: 'Claim coordinators, billing clerks', purpose: 'Instant copay pre-check, coverage alerts, automated digital claims audit', status: 'CONNECTED', eventCount: 65 },
    { id: 'bridge-insight', name: 'BridgeInsight', description: 'Unified health research analytics suite. Anonymizes databases for deep search.', phase: 3, icon: 'Analytics', users: 'Health researchers, statisticians', purpose: 'Cohort queries, predictive modeling parameters, efficacy calculations', status: 'CONNECTED', eventCount: 5 }
  ]);

  // Initializing Patient list registered in Step 1 (BridgeID)
  const [patients, setPatients] = useState<Patient[]>([]);

  // Initializing Event stream for terminal/visual simulation
  const [events, setEvents] = useState<SystemEvent[]>([]);

  // Initializing AI chat history
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Load database from cloud on startup
  const fetchCloudCoreState = async () => {
    if (networkStatus === 'OFFLINE') return;
    try {
      const rp = await fetch("/api/patients");
      if (rp.ok) {
        const data = await rp.json();
        if (Array.isArray(data)) setPatients(data);
      }
      const re = await fetch("/api/events");
      if (re.ok) {
        const data = await re.json();
        if (Array.isArray(data)) setEvents(data);
      }
      const rs = await fetch("/api/systems");
      if (rs.ok) {
        const data = await rs.json();
        if (Array.isArray(data)) setSystems(data);
      }
    } catch (err) {
      console.warn("Using offline memory buffers:", err);
    }
  };

  useEffect(() => {
    fetchCloudCoreState();
  }, [networkStatus]);

  // Fetch systems logs on active polling loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (networkStatus === 'ONLINE') {
        fetchCloudCoreState();
      } else {
        // Fallback simulate rolling traffic locally
        setSystems(prev => prev.map(s => {
          const triggers = Math.random() > 0.6;
          return triggers 
            ? { ...s, syncCount: s.syncCount + Math.floor(Math.random() * 3) + 1, lastSync: 'Just now' }
            : s;
        }));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [networkStatus]);

  // Dispatch custom manual or automated scenario event onto the event bus
  const dispatchTestEvent = async (appName: string, eventType: string, customPayload?: string) => {
    const payloadText = customPayload || `Broadcast system status telemetry from ${appName} module. Event registered.`;
    
    // UI optimistic update
    const mockId = `ev_${Date.now()}_tmp`;
    const newLocalEvent: SystemEvent = {
      id: mockId,
      timestamp: new Date().toISOString(),
      source: appName,
      type: eventType,
      payload: payloadText,
      status: 'PROCESSED',
      description: `Replicated transaction inside core bus.`,
      steps: []
    };

    setEvents(prev => [newLocalEvent, ...prev]);

    setApps(prev => prev.map(app => {
      if (app.name === appName) {
        return { ...app, eventCount: app.eventCount + 1 };
      }
      return app;
    }));

    if (networkStatus === 'ONLINE') {
      try {
        const res = await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source: appName, type: eventType, payload: payloadText })
        });
        if (res.ok) {
          fetchCloudCoreState();
        }
      } catch (err) {
        console.warn("Event dispatched locally:", err);
      }
    }
  };

  const calculateAge = (dobString: string): number => {
    const birthday = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const m = today.getMonth() - birthday.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
      age--;
    }
    return age;
  };

  // Step 1: Add new patient with standard validation and dual-pass deduplication
  const addPatient = async (formData: Omit<Patient, 'id' | 'bridgeId' | 'createdAt' | 'status'>): Promise<{
    status: 'created' | 'pending_review' | 'existing' | 'offline_pending' | 'error';
    message: string;
    bridgeId?: string;
    errors?: string[];
  }> => {
    const validationErrors: string[] = [];
    const nameRegex = /^[A-Za-zÀ-ÿ\s'-]{2,100}$/;
    
    if (!nameRegex.test(formData.firstName.trim())) {
      validationErrors.push("First Name must contain at least 2 alphabetic characters.");
    }
    if (!nameRegex.test(formData.lastName.trim())) {
      validationErrors.push("Last Name must contain at least 2 alphabetic characters.");
    }
    if (formData.nationalId && !/^\d{16}$/.test(formData.nationalId.trim())) {
      validationErrors.push("National ID must be exactly 16 numeric digits.");
    }
    
    const age = calculateAge(formData.dateOfBirth);
    if (isNaN(age) || age < 0) {
      validationErrors.push("Date of birth must be a past date.");
    } else if (age < 18 && (!formData.guardianName || formData.guardianName.trim().length < 2)) {
      validationErrors.push("Guardian Name is strictly required for minors under 18 years old.");
    }

    if (validationErrors.length > 0) {
      dispatchTestEvent('BridgeID', 'REGISTRATION_VALIDATION_FAILED', `Validation crashed for ${formData.firstName} ${formData.lastName}. Errors count: ${validationErrors.length}`);
      return { status: 'error', message: "Validation failure. Fix input fields according to national norms.", errors: validationErrors };
    }

    // ONLINE SERVER-SIDE REGISTRATION OR OFFLINE SWAP
    if (networkStatus === 'ONLINE') {
      try {
        const response = await fetch('/api/patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        
        const resData = await response.json();
        if (response.ok && resData.status !== 'error') {
          // Sync patients list immediately
          await fetchCloudCoreState();
          return {
            status: resData.status,
            message: resData.message,
            bridgeId: resData.bridgeId
          };
        } else if (resData.status === 'error') {
          return {
            status: 'error',
            message: resData.message || "Failed server validation.",
            errors: resData.errors
          };
        }
      } catch (err) {
        console.warn("Server connection failed during registration, reverting to offline buffer storage:", err);
      }
    }

    // 1 — OFFLINE FALLBACK / OFFLINE BUFFER QUEUE
    const ts = new Date();
    const tsStr = ts.toISOString().replace(/[-:T]/g, '').slice(0, 8); // YYYYMMDD
    const rawDist = formData.birthDistrict || formData.district;
    const distCode = DISTRICT_CODES[rawDist] || 'UNK';
    const tempId = `TMP-${distCode}-${tsStr}-${String(offlineLocalSeq).padStart(4, '0')}`;

    const newPatient: Patient = {
      ...formData,
      id: `pat_offline_${Date.now()}`,
      bridgeId: tempId,
      createdAt: ts.toISOString(),
      status: 'OFFLINE_PENDING'
    };

    setPatients(prev => [newPatient, ...prev]);
    setOfflineLocalSeq(prev => prev + 1);

    dispatchTestEvent('BridgeSync', 'OFFLINE_REGISTRATION_QUEUED', `Registered patient ${formData.firstName} ${formData.lastName} in offline mode. Temp ID assigned: ${tempId}`);
    return { 
      status: 'offline_pending', 
      message: "No connection. Patient registration has been securely buffered to the offline sync storage.", 
      bridgeId: tempId 
    };
  };

  // Synchronize dynamic offline registrations batch on online transition
  const syncOfflineRecords = async () => {
    const list = patients.filter(p => p.status === 'OFFLINE_PENDING');
    if (list.length === 0) return;

    if (networkStatus === 'ONLINE') {
      try {
        const response = await fetch('/api/patients/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ batch: list })
        });
        if (response.ok) {
          dispatchTestEvent('BridgeSync', 'SYNC_COMPLETED', `Database synchronization complete! Safely synchronized ${list.length} localized registries onto the national patient index.`);
          await fetchCloudCoreState();
          return;
        }
      } catch (err) {
        console.error("Bulk sync request failed:", err);
      }
    }

    // Local fallback loop
    let currentSeq = mpiSequence;
    const synced = patients.map(p => {
      if (p.status === 'OFFLINE_PENDING') {
        const rawDist = p.birthDistrict || p.district;
        const distCode = DISTRICT_CODES[rawDist] || 'UNK';
        const parsedDob = new Date(p.dateOfBirth);
        const day = String(parsedDob.getDate()).padStart(2, '0');
        const month = String(parsedDob.getMonth() + 1).padStart(2, '0');
        const year = String(parsedDob.getFullYear()).slice(-2);
        const permanentId = `${distCode}-${day}${month}-${year}-${String(currentSeq).padStart(6, '0')}`;
        currentSeq++;

        dispatchTestEvent('BridgeSync', 'PATIENT_OFFLINE_RECORD_SYNCHRONIZED', `Synchronized offline profile: ${p.firstName} ${p.lastName}. Reassigned ${p.bridgeId} -> ${permanentId}.`);
        dispatchTestEvent('BridgeGateway', 'E_UBUZIMA_RECORD_REPLICATED', `Synchronized medical record for patient ${permanentId} to e-Ubuzima node.`);

        return {
          ...p,
          bridgeId: permanentId,
          status: 'SYNCED' as const
        };
      }
      return p;
    });

    setPatients(synced);
    setMpiSequence(currentSeq);
    dispatchTestEvent('BridgeSync', 'SYNC_COMPLETED', `Database synchronization complete (Local)! Safely synchronized ${list.length} localized registries.`);
  };

  // Simulate patient sync replication to e-Ubuzima manually
  const syncPatient = async (pId: string) => {
    const target = patients.find(p => p.id === pId);
    if (!target) return;

    if (networkStatus === 'ONLINE') {
      try {
        const response = await fetch('/api/patients/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ batch: [target] })
        });
        if (response.ok) {
          dispatchTestEvent('BridgeSync', 'PATIENT_OFFLINE_RECORD_SYNCHRONIZED', `Synchronized offline profile: ${target.firstName} ${target.lastName}. Secured in cloud master MPI.`);
          await fetchCloudCoreState();
          return;
        }
      } catch (err) {
        console.error("Sync single patient failed:", err);
      }
    }

    // Local manual sync fallback
    if (target.status === 'OFFLINE_PENDING') {
      const rawDist = target.birthDistrict || target.district;
      const distCode = DISTRICT_CODES[rawDist] || 'UNK';
      const parsedDob = new Date(target.dateOfBirth);
      const day = String(parsedDob.getDate()).padStart(2, '0');
      const month = String(parsedDob.getMonth() + 1).padStart(2, '0');
      const year = String(parsedDob.getFullYear()).slice(-2);
      const permanentId = `${distCode}-${day}${month}-${year}-${String(mpiSequence).padStart(6, '0')}`;

      setPatients(prev => prev.map(p => {
        if (p.id === pId) {
          return { ...p, bridgeId: permanentId, status: 'SYNCED' };
        }
        return p;
      }));
      setMpiSequence(prev => prev + 1);

      dispatchTestEvent('BridgeSync', 'PATIENT_OFFLINE_RECORD_SYNCHRONIZED', `Synchronized offline profile: ${target.firstName} ${target.lastName}. Reassigned ${target.bridgeId} -> ${permanentId}.`);
      dispatchTestEvent('BridgeGateway', 'E_UBUZIMA_RECORD_REPLICATED', `Synchronized medical record for patient ${permanentId} to e-Ubuzima node.`);
    } else {
      setPatients(prev => prev.map(p => {
        if (p.id === pId) {
          return { ...p, status: 'SYNCED' };
        }
        return p;
      }));

      dispatchTestEvent('BridgeGateway', 'E_UBUZIMA_REPLICATED', `Successfully replicated patient dossier for ${target.firstName} ${target.lastName} to external systems.`);
    }
  };

  // Simulate patient profiles merge under deduplication logic
  const mergePatients = async (p1Id: string, p2Id: string) => {
    const p1 = patients.find(p => p.id === p1Id);
    const p2 = patients.find(p => p.id === p2Id);

    if (p1 && p2) {
      if (networkStatus === 'ONLINE') {
        try {
          const response = await fetch('/api/patients/merge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ primaryId: p1Id, duplicateId: p2Id })
          });
          if (response.ok) {
            dispatchTestEvent('BridgeID', 'PATIENT_MPI_RECORD_MERGED', `Duplicate resolved in cloud database. Merged duplicate profile ${p2.firstName} ${p2.lastName} (NID: ${p2.nationalId}) into main health record ${p1.bridgeId}.`);
            await fetchCloudCoreState();
            return;
          }
        } catch (err) {
          console.error("Merge request error:", err);
        }
      }

      // Local fallback state
      setPatients(prev => prev.map(p => {
        if (p.id === p2Id) {
          return { ...p, status: 'DUPLICATE' };
        }
        return p;
      }));

      setPatients(prev => prev.map(p => {
        if (p.id === p1Id && p.status === 'PENDING_REVIEW') {
          return { ...p, status: 'SYNCED' };
        }
        return p;
      }));

      dispatchTestEvent('BridgeID', 'PATIENT_MPI_RECORD_MERGED', `Duplicate resolved (Local). Merged duplicate profile ${p2.firstName} ${p2.lastName} (NID: ${p2.nationalId}) into main health record ${p1.bridgeId}.`);
    }
  };

  // Submit Chat to Backend process
  const handleSubmitChat = async (promptMsg: string, modeMsg: 'thinking' | 'search' | 'maps' | 'standard') => {
    if (!promptMsg.trim()) return;

    // Append user message immediately
    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: promptMsg,
      timestamp: new Date().toISOString()
    };
    
    setChatHistory(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptMsg,
          mode: modeMsg,
          conversation: chatHistory.slice(-10) // Send up to last 10 messages for context
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Server responded with error');
      }

      const aiMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        sender: 'ai',
        text: data.text,
        timestamp: new Date().toISOString(),
        groundedSources: data.groundedSources
      };

      setChatHistory(prev => [...prev, aiMsg]);

      // Dispatch a small event to trace that an AI evaluation took place
      dispatchTestEvent('BridgeAI', 'COGNITIVE_QUERY_PROCESSED', `AI processed cognitive query in "${modeMsg}" mode. Feedback dispatched.`);
    } catch (err: any) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: `msg_e_${Date.now()}`,
        sender: 'ai',
        text: `Error connecting to BridgeAI backbone: ${err?.message || 'Check your internet connection or backend credentials.'}`,
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate Asset image from server
  const handleGenerateImage = async (promptMsg: string, sizeMsg: '1K' | '2K' | '4K'): Promise<ImageResult | null> => {
    try {
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: promptMsg,
          size: sizeMsg,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Asset generator failed.');
      }

      const imageResult: ImageResult = {
        id: `img_${Date.now()}`,
        prompt: promptMsg,
        url: data.imageUrl,
        size: sizeMsg,
        timestamp: new Date().toLocaleTimeString()
      };

      // Log event inside event bus
      dispatchTestEvent('BridgeAI', 'ASSET_SYNTHESIS_COMPLETED', `Successfully synthesized image graphic under size ${sizeMsg} utilizing ${data.model || 'model fallback'}.`);
      return imageResult;
    } catch (err: any) {
      alert(`Asset Synthesizer Error: ${err?.message || 'Check model pricing / configuration permissions.'}`);
      return null;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans" id="applet-viewport">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systems={systems}
        role={role}
        setRole={setRole}
      />

      {/* Main Panel Content container */}
      <main className="flex-1 flex flex-col min-w-0 bg-slate-950 text-slate-100 overflow-y-auto" id="main-viewport col">
        {/* Core Top Bar */}
        <header className="h-[73px] border-b border-slate-900 px-8 flex items-center justify-between shrink-0 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10 w-full select-none">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${networkStatus === 'ONLINE' ? 'bg-emerald-400' : 'bg-rose-450'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${networkStatus === 'ONLINE' ? 'bg-emerald-550' : 'bg-rose-500'}`} />
            </span>
            <div className="leading-none">
              <span className="text-xs font-semibold text-slate-100 uppercase tracking-wider font-mono">BridgeCore Cloud Engine</span>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-widest">
                STAGE ID: RW-CLOUD-9008 · LIVE PIPELINE: ACTIVE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Connection Toggle Slider */}
            <button
              id="network-toggle-switch"
              onClick={() => {
                const nextStatus = networkStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
                setNetworkStatus(nextStatus);
                dispatchTestEvent('BridgeGateway', 'NETWORK_STATUS_CHANGED', `Sovereign connectivity transition: Host system shifted to ${nextStatus} mode.`);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[10px] font-mono font-bold transition-all duration-200 cursor-pointer ${
                networkStatus === 'ONLINE'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-450 border-rose-500/25 animate-pulse hover:bg-rose-500/20'
              }`}
            >
              <RefreshCw className={`h-3 w-3 ${networkStatus === 'ONLINE' ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
              NET: {networkStatus}
            </button>

            {/* Quick telemetry indicators */}
            <div className="hidden md:flex items-center gap-3 text-[10px] text-slate-400 font-mono border border-slate-900 px-3 py-1.5 rounded-xl bg-slate-950/20">
              <span className="flex items-center gap-1">
                <LayoutGrid className="h-3.5 w-3.5 text-emerald-500/70" /> {apps.length} Labs In Roadmap
              </span>
              <span className="text-slate-800">|</span>
              <span className="flex items-center gap-1">
                <Database className="h-3.5 w-3.5 text-indigo-400" /> {patients.length} MPI Indexes
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Tab routing with entry transitions */}
        <div className="p-8 flex-1 max-w-7xl w-full mx-auto" id="dynamic-dashboard-body">
          {activeTab === 'status' && (
            <EventBusSimulator
              events={events}
              dispatchTestEvent={dispatchTestEvent}
              clearEvents={() => setEvents([])}
            />
          )}

          {activeTab === 'bridge-id' && (
            <BridgeIDRegistry
              patients={patients}
              addPatient={addPatient}
              mergePatients={mergePatients}
              syncPatient={syncPatient}
              networkStatus={networkStatus}
              syncOfflineRecords={syncOfflineRecords}
              setPatients={setPatients}
            />
          )}

          {activeTab === 'blueprint' && (
            <BlueprintExplorer
              apps={apps}
              dispatchTestEvent={dispatchTestEvent}
            />
          )}

          {activeTab === 'ai-copilot' && (
            <AICopilot
              chatHistory={chatHistory}
              onSubmitChat={handleSubmitChat}
              onGenerateImage={handleGenerateImage}
              clearHistory={() => setChatHistory([])}
              isLoading={isLoading}
            />
          )}
        </div>
      </main>
    </div>
  );
}
