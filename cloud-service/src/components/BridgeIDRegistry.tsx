/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Database, Search, UserPlus, Merge, CheckCircle, MapPin, 
  AlertTriangle, RefreshCw, Fingerprint, Eye, CreditCard, 
  Printer, Radio, ShieldAlert, Check, Copy, Wifi, WifiOff, FileText, User
} from 'lucide-react';
import { Patient } from '../types';

interface BridgeIDRegistryProps {
  patients: Patient[];
  addPatient: (patient: Omit<Patient, 'id' | 'bridgeId' | 'createdAt' | 'status'>) => Promise<{ 
    status: 'created' | 'existing' | 'pending_review' | 'offline_pending' | 'error'; 
    message: string; 
    bridgeId?: string; 
    errors?: string[] 
  }>;
  mergePatients: (p1Id: string, p2Id: string) => void;
  syncPatient: (id: string) => void;
  networkStatus: 'ONLINE' | 'OFFLINE';
  syncOfflineRecords: () => void;
  setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
}

const RWANDA_GEOGRAPHY = {
  'Kigali City': ['Nyarugenge', 'Gasabo', 'Kicukiro'],
  'Northern Province': ['Musanze', 'Gicumbi', 'Burera', 'Rulindo', 'Gakenke'],
  'Southern Province': ['Huye', 'Nyanza', 'Gisagara', 'Nyamagabe', 'Ruhango', 'Muhanga', 'Kamonyi', 'Nyaruguru'],
  'Western Province': ['Rubavu', 'Karongi', 'Rusizi', 'Nyabihu', 'Rutsiro', 'Ngororero', 'Nyamasheke'],
  'Eastern Province': ['Kayonza', 'Rwamagana', 'Nyagatare', 'Gatsibo', 'Bugesera', 'Ngoma', 'Kirehe']
};

export default function BridgeIDRegistry({ 
  patients, 
  addPatient, 
  mergePatients, 
  syncPatient, 
  networkStatus, 
  syncOfflineRecords,
  setPatients
}: BridgeIDRegistryProps) {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<keyof typeof RWANDA_GEOGRAPHY>('Kigali City');
  const [selectedDistrict, setSelectedDistrict] = useState('Gasabo');
  const [birthDistrict, setBirthDistrict] = useState('Gasabo');

  // Form details mapped across Tier 1, 2, and 3
  const [form, setForm] = useState({
    nationalId: '',
    firstName: '',
    lastName: '',
    gender: 'FEMALE' as 'MALE' | 'FEMALE' | 'OTHER',
    dateOfBirth: '1995-04-12',
    phone: '',
    sector: 'Kacyiru',
    cell: 'Kamatamu',
    village: 'Amahoro',
    isibo: 'Isibo rya Nyampinga',
    guardianName: '',
    insuranceNumber: '',
    bloodGroup: 'O+' as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-',
    biometricType: 'FINGERPRINT' as 'FINGERPRINT' | 'FACE',
    biometricHash: '',
    emergencyContact: ''
  });

  // UI States
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [successMsg, setSuccessMsg] = useState('');
  const [diagnosticErrors, setDiagnosticErrors] = useState<string[]>([]);
  const [duplicateCandidates, setDuplicateCandidates] = useState<{ p1: Patient; p2: Patient } | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(patients[0] || null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [printingCard, setPrintingCard] = useState(false);

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const prov = e.target.value as keyof typeof RWANDA_GEOGRAPHY;
    setSelectedProvince(prov);
    setSelectedDistrict(RWANDA_GEOGRAPHY[prov][0]);
    setBirthDistrict(RWANDA_GEOGRAPHY[prov][0]);
  };

  // Simulate Biometric Scanning Plate
  const handleScanBiometrics = () => {
    setScanning(true);
    setScanProgress(0);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Generate deterministic yet pseudo-random biometric hash string representation
            const alphabet = 'abcd0123456789cef';
            let hash = '';
            for (let i = 0; i < 64; i++) {
              hash += alphabet[Math.floor(Math.random() * alphabet.length)];
            }
            setForm(prevForm => ({
              ...prevForm,
              biometricHash: hash
            }));
            setScanning(false);
          }, 400);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleCopy = (idValue: string) => {
    navigator.clipboard.writeText(idValue);
    setCopiedId(idValue);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDiagnosticErrors([]);

    const payload = {
      nationalId: form.nationalId.trim(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
      phone: form.phone.trim(),
      province: selectedProvince,
      district: selectedDistrict,
      birthDistrict: birthDistrict,
      sector: form.sector.trim(),
      cell: form.cell.trim(),
      village: form.village.trim(),
      isibo: form.isibo.trim(),
      guardianName: form.guardianName.trim(),
      insuranceNumber: form.insuranceNumber.trim() || `MUT-${Math.floor(100000 + Math.random() * 900000)}`,
      bloodGroup: form.bloodGroup,
      biometricType: form.biometricType,
      biometricHash: form.biometricHash || (form.nationalId ? `bio_${form.nationalId}_${Date.now().toString(16)}` : ''),
      emergencyContact: form.emergencyContact.trim() || '+250788000000 (Primary Support)'
    };

    const res = await addPatient(payload);

    if (res.status === 'error') {
      setDiagnosticErrors(res.errors || ["System database validation error."]);
      return;
    }

    // Reset Form Criteria
    setForm({
      nationalId: '',
      firstName: '',
      lastName: '',
      gender: 'FEMALE',
      dateOfBirth: '1995-04-12',
      phone: '',
      sector: 'Kacyiru',
      cell: 'Kamatamu',
      village: 'Amahoro',
      isibo: 'Isibo rya Nyampinga',
      guardianName: '',
      insuranceNumber: '',
      bloodGroup: 'O+',
      biometricType: 'FINGERPRINT',
      biometricHash: '',
      emergencyContact: ''
    });

    if (res.status === 'offline_pending') {
      setSuccessMsg(`OFFLINE CAPTURE QUEUED: Registered citizen under provisional identifier ${res.bridgeId}. Transferred onto offline synchronization buffers.`);
    } else if (res.status === 'pending_review') {
      setSuccessMsg(`DEMOGRAPHIC FLAG DETECTED. Citizen added conditionally under priority provisional identifier ${res.bridgeId} awaiting supervisor deduplication override.`);
    } else if (res.status === 'existing') {
      setSuccessMsg(`PROHIBITED REGISTRATION: citizen records match active database records under master ID: ${res.bridgeId}. Use MPI merge panel instead.`);
    } else {
      setSuccessMsg(`CITIZEN REGISTRY COMPLETED: lifetime identifier ${res.bridgeId} successfully minted and replicated to national MPI node.`);
    }

    // Select the newly minted record
    if (res.bridgeId) {
      setTimeout(() => {
        const added = patients.find(p => p.bridgeId === res.bridgeId);
        if (added) setSelectedPatient(added);
      }, 500);
    }

    setTimeout(() => setSuccessMsg(''), 6000);
  };

  // Quick automated search for potential duplicate combinations based on NID or phonetic surname duplicates
  const triggerDuplicateSearch = () => {
    let duplicateDetected = false;
    for (let i = 0; i < patients.length; i++) {
      for (let j = i + 1; j < patients.length; j++) {
        const p1 = patients[i];
        const p2 = patients[j];
        if (p1.status === 'DUPLICATE' || p2.status === 'DUPLICATE') continue;
        
        const matchingNid = p1.nationalId && p1.nationalId === p2.nationalId;
        const matchingFuzzy = p1.lastName.toLowerCase() === p2.lastName.toLowerCase() && p1.dateOfBirth === p2.dateOfBirth;

        if (matchingNid || matchingFuzzy) {
          setDuplicateCandidates({ p1, p2 });
          duplicateDetected = true;
          return;
        }
      }
    }
    if (!duplicateDetected) {
      alert('MPI ANALYZER RESULT:\n\nNo pending demographic profile overlaps or identity duplicate pairs detected inside current local database rows.');
    }
  };

  const handleMerge = () => {
    if (duplicateCandidates) {
      mergePatients(duplicateCandidates.p1.id, duplicateCandidates.p2.id);
      setDuplicateCandidates(null);
      setSuccessMsg('MPI BATCH RESOLVED: Successfully merged duplicate profiles. Assigned priority lifetime master dossier status.');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
  };

  const handlePrintCard = (patient: Patient) => {
    setPrintingCard(true);
    setTimeout(() => {
      setPrintingCard(false);
      alert(`RWANDA DIGITAL HEALTH PRINT AGENT:\n\nHardware print command sent to thermal card encoder. Encrypted smart metadata registered for citizen record index:\n\nBridgeID: ${patient.bridgeId}\nSubject: ${patient.firstName} ${patient.lastName}\nNFC Tag UID: rf-nx-${patient.id}`);
    }, 2000);
  };

  const filteredPatients = patients.filter(p => {
    const term = searchTerm.toLowerCase();
    return (
      p.firstName.toLowerCase().includes(term) ||
      p.lastName.toLowerCase().includes(term) ||
      p.bridgeId.toLowerCase().includes(term) ||
      (p.nationalId && p.nationalId.includes(term)) ||
      p.district.toLowerCase().includes(term)
    );
  });

  const offlinePendingCount = patients.filter(p => p.status === 'OFFLINE_PENDING').length;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6" id="bridge-id-manager">
      
      {/* 1. INPUT CITIZEN FORM */}
      <div className="xl:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col gap-5">
        <div>
          <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5">
            <UserPlus className="h-3 w-3" /> Citizen Intake Module
          </span>
          <h3 className="text-base font-bold text-white mt-1">Enroll Patient Profile</h3>
          <p className="text-xs text-slate-400 leading-relaxed mt-1">
            BridgeID sovereign registry. Checks national lists, captures biometrics, validates coordinates, and generates lifetime health identifiers.
          </p>
        </div>

        {/* CONNECTION ALERTS BANNER BACKGROUND */}
        {networkStatus === 'OFFLINE' && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs font-bold leading-none font-sans">
              <WifiOff className="h-4 w-4 text-amber-400 animate-pulse shrink-0" />
              <span>Offline Registry Buffering System Active</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              Direct connection to e-Ubuzima servers is currently severed. Mentoral temporary identifiers (<strong className="text-amber-400 font-mono">TMP-DIST-...</strong>) will be allocated and queued.
            </p>
          </div>
        )}

        {/* Success / Override banners */}
        {successMsg && (
          <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs rounded-xl flex items-start gap-2.5 font-medium animate-pulse">
            <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Technical Validation Diagnostics Banners */}
        {diagnosticErrors.length > 0 && (
          <div className="p-4 bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs rounded-xl flex flex-col gap-2">
            <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] font-mono">
              <ShieldAlert className="h-4 w-4" /> National Validation Breaches
            </div>
            <ul className="list-disc list-inside flex flex-col gap-1 text-[10px] text-slate-300">
              {diagnosticErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs select-none">
          {/* TIER 1: CORE INDIVIDUAL DEMOGRAPHICS */}
          <div className="border-b border-slate-800/60 pb-3">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-3">Tier 1: Core Demographics</span>
            
            <div className="flex flex-col gap-1.5 mb-3">
              <label className="text-slate-400 font-semibold font-mono">National ID Number (16 Digits)</label>
              <input
                type="text"
                id="input-nationid"
                maxLength={16}
                placeholder="e.g. 1199570003445892"
                value={form.nationalId}
                onChange={(e) => setForm({ ...form, nationalId: e.target.value.replace(/\D/g, '') })}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono tracking-wider"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">First Name (Prénom)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marie Grace"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Last Name (Nom)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Uwase"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Date of Birth</label>
                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 h-9"
                >
                  <option value="FEMALE">Female (Gore)</option>
                  <option value="MALE">Male (Gabo)</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            {/* MINOR GUARDIAN REQUIREMENT */}
            {new Date().getFullYear() - new Date(form.dateOfBirth).getFullYear() < 18 && (
              <div className="flex flex-col gap-1.5 p-3 bg-indigo-950/20 border border-indigo-900/35 rounded-xl mb-3 animate-fade-in">
                <label className="text-indigo-300 font-semibold flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> Guardian Name (Mandatory for Minors)
                </label>
                <input
                  type="text"
                  placeholder="Parent or legal guardian's name"
                  value={form.guardianName}
                  onChange={(e) => setForm({ ...form, guardianName: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            )}
          </div>

          {/* TIER 2: ADVANCED CLINICAL & RESIDENCE DETAILS */}
          <div className="border-b border-slate-800/60 pb-3">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-3">Tier 2: Contact, Address & Insurance</span>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold font-mono">Mobile Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 0788812345"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Blood Group</label>
                <select
                  value={form.bloodGroup}
                  onChange={(e) => setForm({ ...form, bloodGroup: e.target.value as any })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 h-9 font-mono"
                >
                  <option value="O+">O Rh+</option>
                  <option value="O-">O Rh-</option>
                  <option value="A+">A Rh+</option>
                  <option value="A-">A Rh-</option>
                  <option value="B+">B Rh+</option>
                  <option value="B-">B Rh-</option>
                  <option value="AB+">AB Rh+</option>
                  <option value="AB-">AB Rh-</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">Insurance Policy No.</label>
                <input
                  type="text"
                  placeholder="e.g. RSSB-20412 / Mutuelle"
                  value={form.insuranceNumber}
                  onChange={(e) => setForm({ ...form, insuranceNumber: e.target.value })}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-400 font-semibold">District of Birth</label>
                <select
                  value={birthDistrict}
                  onChange={(e) => setBirthDistrict(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 h-9 font-mono"
                >
                  {Object.values(RWANDA_GEOGRAPHY).flat().map((dist) => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mb-3">
              <label className="text-slate-400 font-semibold">Urgent Contact Info (Name & Phone)</label>
              <input
                type="text"
                placeholder="e.g. Jean Uwase (+250 788...)"
                value={form.emergencyContact}
                onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="border border-slate-800/80 p-3 rounded-xl bg-slate-950/30">
              <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block mb-2">Rwanda Administrative Hierarchy</span>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-semibold">Province (Intara)</label>
                  <select
                    value={selectedProvince}
                    onChange={handleProvinceChange}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 h-8 text-[11px]"
                  >
                    {Object.keys(RWANDA_GEOGRAPHY).map((prov) => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-semibold">District (Akarere)</label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 h-8 text-[11px]"
                  >
                    {RWANDA_GEOGRAPHY[selectedProvince].map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-semibold">Sector (Umurenge)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Remera"
                    value={form.sector}
                    onChange={(e) => setForm({ ...form, sector: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-semibold">Cell (Akagari)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rukiri II"
                    value={form.cell}
                    onChange={(e) => setForm({ ...form, cell: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-semibold">Village (Umudugudu)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rebero"
                    value={form.village}
                    onChange={(e) => setForm({ ...form, village: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-400 font-semibold">Isibo (Alliance Group)</label>
                  <input
                    type="text"
                    placeholder="e.g. Isibo y'Umutekano"
                    value={form.isibo}
                    onChange={(e) => setForm({ ...form, isibo: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TIER 3: SOVEREIGN REINFORCED BIOMETRIC ATTESTATION */}
          <div>
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block mb-2">Tier 3: Biometric Identity Crypt</span>
            
            <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Fingerprint className="h-4 w-4 text-indigo-400" />
                  <span className="font-semibold text-slate-300">Biometric Token Scan</span>
                </div>
                <select
                  value={form.biometricType}
                  onChange={(e) => setForm({ ...form, biometricType: e.target.value as any })}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-slate-300 focus:outline-none text-[10px]"
                >
                  <option value="FINGERPRINT">Thumbprint</option>
                  <option value="FACE">Iris/Face Scan</option>
                </select>
              </div>

              {!form.biometricHash && !scanning && (
                <button
                  type="button"
                  onClick={handleScanBiometrics}
                  className="w-full bg-indigo-950 hover:bg-indigo-900 border border-indigo-800/40 text-indigo-300 font-mono text-[10px] py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Radio className="h-3 w-3 animate-pulse text-indigo-400" /> Initialize Biometric Scanner Plate
                </button>
              )}

              {scanning && (
                <div className="flex flex-col gap-1.5 text-center p-1 select-none">
                  <div className="flex justify-between font-mono text-[9px] text-slate-500">
                    <span className="animate-pulse">Attaching cryptographic hardware...</span>
                    <span>{scanProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <motion.div 
                      className="h-full bg-indigo-500"
                      initial={{ width: '0%' }}
                      animate={{ width: `${scanProgress}%` }}
                      transition={{ duration: 0.15 }}
                    />
                  </div>
                </div>
              )}

              {form.biometricHash && !scanning && (
                <div className="flex flex-col gap-1 p-2 bg-emerald-950/10 border border-emerald-900/30 rounded-lg font-mono text-[9px]">
                  <div className="flex items-center justify-between text-emerald-400 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1"><Check className="h-3 w-3" /> Biometric Token Sealed</span>
                    <span>MD5 SHA-256</span>
                  </div>
                  <div className="text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap mt-0.5">
                    {form.biometricHash}
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            id="register-patient-btn"
            className="w-full mt-3 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold py-2.5 rounded-xl transition duration-150 cursor-pointer shadow-[0_4px_15px_rgba(99,102,241,0.35)] flex items-center justify-center gap-2"
          >
            <UserPlus className="h-4 w-4" /> Enroll To National MPI
          </button>
        </form>
      </div>

      {/* 2. DYNAMIC WORKSPACE EXPLORER, DIGITAL CARD DRAWER & BATCH MERGE */}
      <div className="xl:col-span-2 flex flex-col gap-6">

        {/* TOP STATUS ROW, SYNC CONSOLE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">NATIONAL REGISTRY STATUS</span>
              <h4 className="text-lg font-bold text-white mt-1 leading-none font-mono">10,000+ Nodes</h4>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Active secure synchronization tunnels connecting facilities.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">OFFLINE TEMP BUFFER</span>
              <h4 className="text-lg font-bold text-amber-400 mt-1 leading-none font-mono">{offlinePendingCount} profiles</h4>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Provisional entries staged inside local indexed database storage.</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden">
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">NATIONAL PATIENT INDEX</span>
              <h4 className="text-lg font-bold text-indigo-400 mt-1 leading-none font-mono">{patients.length} Registered</h4>
            </div>
            {offlinePendingCount > 0 && networkStatus === 'ONLINE' ? (
              <button
                onClick={syncOfflineRecords}
                className="w-full mt-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono font-bold text-[10px] py-1.5 px-2 rounded-lg cursor-pointer transition flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="h-3 w-3 animate-spin" /> Uplink {offlinePendingCount} Delayed Records
              </button>
            ) : (
              <p className="text-[10px] text-slate-500 mt-2 select-none">
                {networkStatus === 'OFFLINE' ? '⚠ Uplink disabled in offline mode.' : '✔ Registry fully up-to-date.'}
              </p>
            )}
          </div>
        </div>

        {/* SPECIAL: DIGITAL RWANDA HEALTH IDENTITY SMART CARD */}
        <AnimatePresence mode="wait">
          {selectedPatient && (
            <motion.div 
              id="id-card-viewport"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-indigo-950/20 border-2 border-indigo-500/20 p-6 rounded-2xl relative overflow-hidden backdrop-blur"
              style={{
                backgroundImage: 'radial-gradient(circle at top right, rgba(99,102,241,0.12), transparent)'
              }}
            >
              {/* Holographic Watermark Shield */}
              <div className="absolute right-6 -bottom-10 h-48 w-48 text-indigo-500/5 pointer-events-none select-none">
                <CreditCard className="h-full w-full" />
              </div>

              <div className="flex flex-col md:flex-row items-stretch justify-between gap-6">
                
                {/* Visual Smart Card layout */}
                <div className="flex-1 max-w-sm bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-400/30 rounded-2xl p-5 shadow-[0_10px_35px_-10px_rgba(99,102,241,0.5)] text-xs font-sans select-none relative overflow-hidden group hover:border-indigo-400/50 transition-colors duration-300">
                  {/* Holographic sweep lines */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
                  
                  {/* Card Header */}
                  <div className="flex items-start justify-between border-b border-indigo-900/50 pb-3 mb-4">
                    <div>
                      <h4 className="text-[10px] font-bold text-white uppercase tracking-wider leading-none">Republic of Rwanda</h4>
                      <p className="text-[8px] text-slate-400 mt-0.5 leading-none">Ministry of Health (MINISANTE)</p>
                    </div>
                    <span className="text-[8px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded uppercase tracking-widest">
                      MedBridge+
                    </span>
                  </div>

                  {/* Card Body with Grid */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="col-span-1 flex flex-col justify-between h-20">
                      {/* Simulated RFID / NFC Smart Chip graphic */}
                      <div className="h-6 w-8 bg-gradient-to-r from-amber-500/80 to-amber-400 rounded border border-amber-600/50 flex flex-col justify-around p-0.5 relative overflow-hidden">
                        <div className="h-px bg-slate-950/40 w-full" />
                        <div className="h-px bg-slate-950/40 w-full" />
                        <div className="h-px bg-slate-950/40 w-full" />
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-950/40" />
                        <div className="absolute right-1/4 top-0 bottom-0 w-px bg-slate-950/40" />
                      </div>

                      {/* Diagnostic Blood / Status */}
                      <div className="leading-tight">
                        <span className="text-[7px] text-slate-500 font-mono block">BLOOD TYPE</span>
                        <span className="text-sm font-bold text-indigo-400 font-mono">{selectedPatient.bloodGroup || 'O+'}</span>
                      </div>
                    </div>

                    <div className="col-span-2 flex flex-col justify-between h-20 text-slate-200">
                      <div>
                        <span className="text-[7px] text-indigo-400 font-mono block uppercase">Holder Name / Izina</span>
                        <strong className="text-xs uppercase text-white font-bold leading-none block mt-0.5 tracking-tight truncate">
                          {selectedPatient.firstName} {selectedPatient.lastName}
                        </strong>
                      </div>

                      <div className="grid grid-cols-2 gap-1 mt-1 leading-tight">
                        <div>
                          <span className="text-[7px] text-slate-500 font-mono block">SEX</span>
                          <span className="text-[9px] font-bold font-sans uppercase">{selectedPatient.gender === 'FEMALE' ? 'F' : 'M'}</span>
                        </div>
                        <div>
                          <span className="text-[7px] text-slate-500 font-mono block">BIRTH DATE</span>
                          <span className="text-[9px] font-mono font-bold">{selectedPatient.dateOfBirth}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Lifetime Identifiers bottom bar with spacing */}
                  <div className="border-t border-indigo-900/50 pt-3">
                    <div className="flex items-end justify-between gap-2">
                      <div className="flex-1">
                        <span className="text-[7px] text-indigo-300 font-mono block uppercase tracking-wide leading-none">BridgeID Sovereign Master Code</span>
                        <span className="text-sm font-black font-mono tracking-wider text-emerald-400 font-bold block mt-1">
                          {selectedPatient.bridgeId}
                        </span>
                      </div>
                      <div className="shrink-0 h-8 w-8 bg-white/5 rounded border border-white/10 p-0.5 flex items-center justify-center font-mono text-[6px] text-slate-400 hover:bg-white/10 transition-colors cursor-pointer" title="Holographic QR code">
                        QR CHIP
                      </div>
                    </div>
                  </div>
                </div>

                {/* Patient metadata list detail review */}
                <div className="flex-1 flex flex-col justify-between gap-4 text-xs">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[9px] font-mono font-bold text-indigo-300 bg-indigo-505/10 border border-indigo-800/40 px-2 py-0.5 rounded-full select-none">
                        Active National Profile Folder
                      </span>
                      {selectedPatient.status === 'SYNCED' ? (
                        <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1.5">
                          <CheckCircle className="h-3.5 w-3.5" /> Replicated to MPI
                        </span>
                      ) : selectedPatient.status === 'PENDING_REVIEW' ? (
                        <span className="text-[10px] text-amber-500 font-mono font-bold flex items-center gap-1.5 animate-pulse">
                          <AlertTriangle className="h-3.5 w-3.5" /> Suspected Duplicate
                        </span>
                      ) : (
                        <span className="text-[10px] text-amber-400 font-mono font-bold flex items-center gap-1.5 animate-pulse">
                          <WifiOff className="h-3.5 w-3.5" /> Sync Buffer Queue
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-base font-bold text-white">{selectedPatient.firstName} {selectedPatient.lastName}</h3>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-3 font-mono text-[11px] text-slate-400 border-t border-slate-800/60 pt-3">
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-sans font-bold">National ID Number:</span>
                        <strong className="text-slate-200">{selectedPatient.nationalId || 'No NID Registered'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-sans font-bold">Birth District:</span>
                        <strong className="text-slate-200">{selectedPatient.birthDistrict || selectedPatient.district}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-sans font-bold">Insurance ID Policy:</span>
                        <strong className="text-slate-200">{selectedPatient.insuranceNumber || 'Pending Mutuelle'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px] uppercase font-sans font-bold">Emergency Contacts:</span>
                        <strong className="text-slate-200 text-xs font-sans tracking-tight leading-tight block truncate" title={selectedPatient.emergencyContact}>
                          {selectedPatient.emergencyContact || 'None Listed'}
                        </strong>
                      </div>
                    </div>

                    {/* Hierarchy trace string */}
                    <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-900 font-mono text-[10px] text-slate-400 mt-4 leading-relaxed flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      <span>{selectedPatient.province} → {selectedPatient.district} → {selectedPatient.sector} → {selectedPatient.cell} → {selectedPatient.village}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={() => handleCopy(selectedPatient.bridgeId)}
                      className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-mono font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer text-[10px]"
                    >
                      {copiedId === selectedPatient.bridgeId ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" /> Copied Master Code
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copy BridgeID
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handlePrintCard(selectedPatient)}
                      disabled={printingCard}
                      className="bg-indigo-600 hover:bg-indigo-500 font-mono text-slate-100 font-bold py-1.5 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer text-[10px] disabled:opacity-50"
                    >
                      <Printer className={`h-3 w-3 ${printingCard ? 'animate-bounce' : ''}`} /> Print National Health Card
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BATCH DEDUPLICATION PANEL */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
          <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400 shrink-0">
                <Merge className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-none">MPI Deduplication & Merge Panel</h3>
                <p className="text-xs text-slate-400 mt-1.5 max-w-xl leading-relaxed">
                  Scans database for identical national numbers, names, or phonetic details under binary decision scoring, resolving duplicates safely into single files.
                </p>
              </div>
            </div>
            <button
              id="analyze-mpi-btn"
              onClick={triggerDuplicateSearch}
              className="bg-slate-800 hover:bg-slate-700 hover:text-white px-3.5 py-2 border border-slate-700/60 rounded-xl text-[11px] font-bold text-slate-300 font-mono cursor-pointer shrink-0"
            >
              Analyze Records
            </button>
          </div>

          {/* Merge match overlay block */}
          {duplicateCandidates && (
            <div className="mt-4 p-4 border border-amber-500/35 bg-amber-500/10 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in" id="dup-box">
              <div className="flex flex-col gap-1 text-slate-300 text-xs">
                <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 font-mono">
                  <AlertTriangle className="h-3 w-3" /> Potential Duplicate Records Flagged
                </span>
                <p className="mt-1 leading-relaxed">
                  Conflicting demographics found for: <strong className="text-white">{duplicateCandidates.p1.firstName} {duplicateCandidates.p1.lastName}</strong>.
                </p>
                <div className="flex gap-4 mt-1 font-mono text-[10px] text-slate-400">
                  <span>Priority Node: {duplicateCandidates.p1.bridgeId}</span>
                  <span>Duplicate Node: {duplicateCandidates.p2.bridgeId}</span>
                </div>
              </div>
              <button
                id="merge-now-btn"
                onClick={handleMerge}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-[0_4px_12px_rgba(245,158,11,0.2)] font-mono"
              >
                Resolve & Merge Pages
              </button>
            </div>
          )}
        </div>

        {/* 3. LOCAL DATABASE DISPLAY DIALOG / QUERY TABLE */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex-1 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                <Database className="h-4 w-4 text-indigo-400" /> Master Patient Index (MPI) Rows
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Sovereign census registry database cells held within local facility partitions.</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                id="search-patients"
                placeholder="Search by name, district, or health ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 w-full sm:w-80 font-sans"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 select-none">
              <thead>
                <tr className="border-b border-slate-800/80 text-slate-500 font-mono font-bold uppercase tracking-wider text-[10px] whitespace-nowrap">
                  <th className="py-3 px-3">Lifetime BridgeID (National Reference ID)</th>
                  <th className="py-3 px-3">Subject Name</th>
                  <th className="py-3 px-3">Blood & DOB</th>
                  <th className="py-3 px-3">Rwanda Administrative Hierarchy Address</th>
                  <th className="py-3 px-3 text-right">Service Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 font-mono text-xs">
                      No matching citizen indexes identified in active search cache queries.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => {
                    const isSelected = selectedPatient?.id === patient.id;
                    return (
                      <tr
                        key={patient.id}
                        id={`patient-row-${patient.id}`}
                        onClick={() => setSelectedPatient(patient)}
                        className={`border-b border-slate-800/40 hover:bg-slate-950/40 transition-colors cursor-pointer ${
                          isSelected ? 'bg-indigo-950/20 text-white font-medium border-l-2 border-l-indigo-500' : ''
                        }`}
                      >
                        <td className="py-4 px-3 font-mono">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-emerald-400 font-semibold flex items-center gap-1.5 uppercase">
                              {patient.bridgeId}
                            </span>
                            <span className="text-[10px] text-slate-500 font-normal">NID: {patient.nationalId || 'No NID Registered'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-3 font-semibold text-slate-100">
                          {patient.firstName} {patient.lastName}
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex flex-col gap-0.5 font-mono text-[10px] text-slate-400">
                            <span>{patient.dateOfBirth} ({patient.gender.toLowerCase()})</span>
                            <span className="text-indigo-400">Blood Group: {patient.bloodGroup || 'O+'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex flex-wrap items-center gap-1 text-[10px] font-mono">
                            <span className="px-1.5 py-0.5 bg-indigo-950/20 border border-indigo-900/20 rounded text-indigo-400">{patient.province}</span>
                            <span className="text-slate-700">→</span>
                            <span className="px-1.5 py-0.5 bg-slate-950/80 border border-slate-850 rounded text-slate-300">{patient.district}</span>
                            <span className="text-slate-700">→</span>
                            <span className="px-1.5 py-0.5 bg-slate-950/80 border border-slate-850 rounded text-slate-300">{patient.sector}</span>
                            <span className="text-slate-700">→</span>
                            <span className="px-1.5 py-0.5 bg-slate-950/80 border border-slate-850 rounded text-slate-350">{patient.cell}</span>
                            <span className="text-slate-700">→</span>
                            <span className="px-1.5 py-0.5 bg-slate-950/80 border border-slate-850 rounded text-slate-400">{patient.village}</span>
                            {patient.isibo && (
                              <>
                                <span className="text-slate-700">→</span>
                                <span className="px-1.5 py-0.5 bg-emerald-950/40 border border-emerald-950/25 rounded text-emerald-400 font-medium">{patient.isibo}</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          {patient.status === 'SYNCED' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold rounded-full">
                              <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full animate-pulse" /> Replicated
                            </span>
                          ) : patient.status === 'DUPLICATE' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/10 text-rose-450 text-[10px] font-mono font-bold rounded-full">
                              Duplicate Folder
                            </span>
                          ) : patient.status === 'PENDING_REVIEW' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-mono font-bold rounded-full animate-pulse">
                              Pending Review
                            </span>
                          ) : (
                            <button
                              id={`sync-btn-${patient.id}`}
                              onClick={() => syncPatient(patient.id)}
                              className="bg-indigo-650 hover:bg-indigo-500 hover:text-white font-bold text-[10px] text-slate-100 font-mono py-1 px-2.5 rounded-lg flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw className="h-2.5 w-2.5 animate-spin" /> Pending Sync
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
