/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Patient {
  id: string; // Internal client ID
  bridgeId: string; // DISTRICT_CODE-DDMM-YY-NATIONAL_SEQUENCE
  nationalId: string; // 16 digit NID
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'INTERSEX' | 'OTHER';
  phone: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  isibo: string;
  createdAt: string;
  status: 'PENDING' | 'SYNCED' | 'DUPLICATE' | 'OFFLINE_PENDING' | 'PENDING_REVIEW';
  
  // Tier 2 — Verification details from specs
  guardianName?: string;
  insuranceNumber?: string;
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'UNKNOWN';
  biometricType?: 'FINGERPRINT' | 'IRIS' | 'FACE' | 'NONE';
  biometricHash?: string;
  birthDistrict: string; // Birth District Name or Code
  emergencyContact?: string;
}

export interface AdminHierarchy {
  provinces: {
    [key: string]: string[]; // province name -> list of districts
  };
}

export interface HealthSystem {
  id: string;
  name: string;
  description: string;
  status: 'ONLINE' | 'OFFLINE' | 'SYNCING';
  lastSync: string;
  syncCount: number;
}

export interface BridgeApp {
  id: string;
  name: string;
  description: string;
  phase: 1 | 2 | 3 | 4;
  icon: string;
  users: string;
  purpose: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'DISPATCHING';
  eventCount: number;
}

export interface SystemEvent {
  id: string;
  timestamp: string;
  source: string; // e.g. BridgeLife, BridgeCare
  type: string; // e.g. PATIENT_REGISTERED, EMERGENCY_DISPATCH
  payload: string;
  status: 'PROCESSED' | 'PENDING' | 'ROUTING';
  description: string;
  steps: { service: string; status: 'SUCCESS' | 'PROCESS' | 'PENDING'; detail: string }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  thinking?: string; // High thinking process output if any
  groundedSources?: { title: string; url: string }[]; // Google Search sources
}

export interface ImageResult {
  id: string;
  prompt: string;
  url: string;
  size: '1K' | '2K' | '4K';
  timestamp: string;
}
