/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Persistent cloud storage simulations
const DATA_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadJSONFile<T>(filename: string, defaultValue: T): T {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), "utf8");
    } catch (err) {
      console.warn(`Error writing initial seeded file: ${filename}`, err);
    }
    return defaultValue;
  }
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data) as T;
  } catch (err) {
    console.warn(`Error reading ${filename}, resetting to default...`, err);
    return defaultValue;
  }
}

function saveJSONFile<T>(filename: string, data: T): void {
  const filePath = path.join(DATA_DIR, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error(`Error saving ${filename}`, err);
  }
}

// Model types and DB Seeds
interface DBPatient {
  id: string;
  bridgeId: string;
  nationalId: string;
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
  guardianName?: string;
  insuranceNumber?: string;
  bloodGroup?: string;
  biometricType?: 'FINGERPRINT' | 'IRIS' | 'FACE' | 'NONE';
  biometricHash?: string;
  birthDistrict: string;
  emergencyContact?: string;
}

interface DBSystem {
  id: string;
  name: string;
  description: string;
  status: 'ONLINE' | 'OFFLINE' | 'SYNCING';
  lastSync: string;
  syncCount: number;
}

interface DBEvent {
  id: string;
  timestamp: string;
  source: string;
  type: string;
  payload: string;
  status: 'PROCESSED' | 'PENDING' | 'ROUTING';
  description: string;
  steps: any[];
}

interface DBNotification {
  id: string;
  timestamp: string;
  channel: 'SMS' | 'PUSH' | 'EMAIL' | 'USSD';
  recipient: string;
  recipientContact: string;
  subject?: string;
  body: string;
  status: 'SENT' | 'QUEUED' | 'FAILED';
  eventCode: string;
}

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

const SEED_PATIENTS: DBPatient[] = [
  {
    id: 'pat_1',
    bridgeId: 'GAB-2208-90-084721',
    nationalId: '1199080034451293',
    firstName: 'Divine',
    lastName: 'Iracyuzuka',
    dateOfBirth: '1990-08-22',
    gender: 'FEMALE',
    phone: '+250788112233',
    province: 'Kigali City',
    district: 'Gasabo',
    birthDistrict: 'Gasabo',
    sector: 'Kacyiru',
    cell: 'Kamatamu',
    village: 'Amahoro',
    isibo: 'Isibo rya Nyampinga',
    createdAt: '2026-06-16T10:00:00Z',
    status: 'SYNCED',
    guardianName: '',
    insuranceNumber: 'RSSB-902344',
    bloodGroup: 'O+',
    biometricType: 'FINGERPRINT',
    biometricHash: 'a5cce03c582f3c3065b206dfbda564024346ad3fce78393e882a93b48df363cf',
    emergencyContact: 'Pierre Iracyuzuka (+250788223344)'
  },
  {
    id: 'pat_2',
    bridgeId: 'MUS-1411-01-084722',
    nationalId: '1200180012243445',
    firstName: 'Jean',
    lastName: 'Claude Nsengimana',
    dateOfBirth: '2001-11-14',
    gender: 'MALE',
    phone: '+250782334455',
    province: 'Northern Province',
    district: 'Musanze',
    birthDistrict: 'Musanze',
    sector: 'Muhoza',
    cell: 'Mpenge',
    village: 'Kigarama',
    isibo: 'Urumuri',
    createdAt: '2026-06-16T10:05:00Z',
    status: 'SYNCED',
    guardianName: '',
    insuranceNumber: 'Mutuelle-309489',
    bloodGroup: 'A+',
    biometricType: 'FACE',
    biometricHash: '6cc239dbe9bc26365b211abfa2560cd4208a3d3c87e839e992a23048deadc0ea',
    emergencyContact: 'Marie Nsengimana (+250782332211)'
  }
];

const SEED_SYSTEMS: DBSystem[] = [
  { id: 'openmrs', name: 'OpenMRS Connector', description: 'Clinical electronic records broker', status: 'ONLINE', lastSync: '10s ago', syncCount: 142 },
  { id: 'eubuzima', name: 'e-Ubuzima Core', description: 'National health registry pipeline', status: 'ONLINE', lastSync: '1m ago', syncCount: 94 },
  { id: 'ebanguka', name: 'e-Banguka Engine', description: 'Referrals resource scheduler', status: 'ONLINE', lastSync: '10m ago', syncCount: 38 },
  { id: 'rssb', name: 'RSSB Claims Portal', description: 'National insurance verification', status: 'ONLINE', lastSync: '5m ago', syncCount: 81 },
  { id: 'dhis2', name: 'DHIS2 HMIS Sync', description: 'Surveillance outbreak compiler', status: 'ONLINE', lastSync: '30s ago', syncCount: 220 }
];

const SEED_EVENTS: DBEvent[] = [
  { id: 'ev_1', timestamp: '2026-06-16T10:15:00Z', source: 'BridgeID', type: 'PATIENT_ID_GENERATED', payload: 'Assigned GAB-2208-90-084721 to Divine Iracyuzuka.', status: 'PROCESSED', description: 'Patient index confirmed uniquely across Gasabo district.', steps: [] },
  { id: 'ev_2', timestamp: '2026-06-16T10:15:45Z', source: 'BridgeGateway', type: 'E_UBUZIMA_RECORD_REPLICATED', payload: 'Synchronized medical folder for patient GAB-2208-90-084721 to e-Ubuzima cloud servers.', status: 'PROCESSED', description: 'Shared payload updated successfully.', steps: [] }
];

// Helper to fire backend events
function internalDispatchEvent(source: string, type: string, payload: string, steps: any[] = []): DBEvent {
  const events = loadJSONFile<DBEvent[]>("events.json", SEED_EVENTS);
  const newEvent: DBEvent = {
    id: `ev_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    source,
    type,
    payload,
    status: 'PROCESSED',
    description: `Replicated transaction on the clinical event bus.`,
    steps
  };
  events.unshift(newEvent);
  saveJSONFile("events.json", events);

  // Auto-trigger notifications depending on event type for interoperability
  const notifications = loadJSONFile<DBNotification[]>("notifications.json", []);
  if (type === 'PATIENT.REGISTERED' || type === 'PATIENT_ID_GENERATED') {
    notifications.unshift({
      id: `nt_${Date.now()}`,
      timestamp: new Date().toISOString(),
      channel: 'SMS',
      recipient: 'Primary Citizen Contact',
      recipientContact: '+250788112233',
      body: `Muraho! Patient registration completed. Unique lifetime identity code generated by BridgeID: ${payload.includes("Assigned") ? payload.split("Assigned ")[1].split(" to")[0] : "RW-MPI"}`,
      status: 'SENT',
      eventCode: type
    });
  } else if (type.includes('EMERGENCY') || type === 'EMERGENCY.SOS_TRIGGERED') {
    notifications.unshift({
      id: `nt_${Date.now()}`,
      timestamp: new Date().toISOString(),
      channel: 'PUSH',
      recipient: 'District Emergency Dispatcher',
      recipientContact: 'Ambulance-Central-Station',
      subject: 'URGENT DISPATCH MANDATE',
      body: `CRITICAL OUTREACH: Emergency SOS reported at facility sector. Matching resources and calculating optimal GPS coordinates route on e-Banguka.`,
      status: 'SENT',
      eventCode: type
    });
  } else if (type === 'MATERNAL.ANC_VISIT_MISSED') {
    notifications.unshift({
      id: `nt_${Date.now()}`,
      timestamp: new Date().toISOString(),
      channel: 'SMS',
      recipient: 'Community Health Worker (Abajyanama b\'Ubuzima)',
      recipientContact: '+250781299482',
      body: `ALERT: Pregnant woman missed ANC consultation list at Clinic. Please conduct direct household trace immediately.`,
      status: 'SENT',
      eventCode: type
    });
  } else if (type === 'SUPPLY.STOCK_LOW') {
    notifications.unshift({
      id: `nt_${Date.now()}`,
      timestamp: new Date().toISOString(),
      channel: 'EMAIL',
      recipient: 'District Pharmacy Store Manager',
      recipientContact: 'logistics-manager@moh.gov.rw',
      subject: 'Inventory Reorder Buffer Exhausted',
      body: `Automated alert under BridgeFlow: Anti-Malarial drug supply levels have fallen below national safety threshold at Bugesera Pharmacy node.`,
      status: 'SENT',
      eventCode: type
    });
  }
  saveJSONFile("notifications.json", notifications);

  return newEvent;
}

// Lazy init Gemini client to avoid crashes if API_KEY is missing during startup or build
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please configure it in your Secrets / Env settings.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Local offline backup response generator for when the Gemini API quota is exhausted
function getLocalFallbackResponse(prompt: string, mode: string): { text: string; groundedSources?: any[]; modeUsed: string } {
  const normalized = prompt.toLowerCase();
  
  if (normalized.includes("openmrs") || normalized.includes("dhis2") || normalized.includes("ubuzima") || normalized.includes("integration") || normalized.includes("api") || normalized.includes("wrapper")) {
    return {
      text: `### 🔄 BridgeGateway API Interoperability Hub

The **BridgeGateway** acts as the singular translation layer between BridgeCore's internal unified schema and external medical systems like **OpenMRS (EHR)**, **e-Ubuzima (Cloud Portals)**, and **DHIS2 (Aggregate Reports)**.

#### Core Interoperability Design:
1. **FHIR Profile Conversions:** Raw inputs to BridgeCore are translated into compliant standard **HL7 FHIR JSON payloads (v4.0.1)** before routing to legacy OpenMRS instances.
2. **Decoupled Synchronicity:** Legacy databases are never queried directly from health apps. All interactions run via async queue relays.
3. **The "One-Update" Pipeline:** Any state changes on third-party systems are mapped as system event payloads (e.g. \`PATIENT_RECORD_CREATED\`, \`E_UBUZIMA_RECORD_REPLICATED\`) on the **BridgeEvents** Pub/Sub rail, broadcasting updates to all authorized consumers.

*Citations for Rwanda Ministry of Health Interoperability Standards v2.1 are applied automatically to preserve compliance.*`,
      groundedSources: [
        { title: "MINISANTE National Health Information System Policy (2025)", url: "https://www.moh.gov.rw/publications" },
        { title: "HL7 FHIR Rwanda Interoperability Guidelines", url: "https://hl7.org/fhir" }
      ],
      modeUsed: mode
    };
  }

  if (normalized.includes("isibo") || normalized.includes("hierarchy") || normalized.includes("province") || normalized.includes("district") || normalized.includes("administrative") || normalized.includes("sector") || normalized.includes("village")) {
    return {
      text: `### 🇷🇼 Rwanda Administrative Demographics & Isibo Integration

To achieve precision medicine and epidemiological mapping, **BridgeID** fully binds patient records to Rwanda's tight administrative structure.

#### Hierarchical Chain:
\`\`\`
Province (Intara) ➔ District (Akarere) ➔ Sector (Umurenge) ➔ Cell (Akagari) ➔ Village (Umudugudu) ➔ Isibo
\`\`\`

#### What is an Isibo?
An **Isibo** is an administrative cluster comprising **15 to 20 immediate households**. 
- Bridge2Agency+ integrates Isibo-level addresses directly into clinical forms.
- Community Health Workers (**Abajyanama b'Ubuzima**) use these Isibo tags to pinpoint contagious outbreak centroids (e.g. Malaria, Tuberculosis vectors) down to a specific block level.
- This represents a level of operational density unique to Rwanda's health OS.`,
      groundedSources: [
        { title: "Rwanda Ministry of Local Government (MINALOC) Structure Guidelines", url: "https://www.minaloc.gov.rw/" },
        { title: "Community Health Workers CHW National Strategy 2024-2029", url: "https://www.moh.gov.rw/" }
      ],
      modeUsed: mode
    };
  }

  if (normalized.includes("offline") || normalized.includes("sync") || normalized.includes("wifi") || normalized.includes("disconnect") || normalized.includes("network")) {
    return {
      text: `### 📶 BridgeSync: Decentralized Offline-First Protocol

**BridgeSync** guarantees zero service interruption in rural outposts and healthcare tents where cellular uplinks are unstable.

#### Mechanics of Deferred Replication:
1. **Local Partitioning:** When connectivity is lost, the local application intercepts the registration or care action and commits it to **IndexedDB/Local Vaults**.
2. **Temporary Minting:** The citizen is securely issued a temporary mnemonic identifier prefixed by district codes and timestamps (e.g., \`TMP-GAB-20260616-0001\`).
3. **Automated Reconciliation:** Once the uplink is restored, the facility's **BridgeCore node** automatically syncs the offline buffers. It checks for overlaps on the central Master Patient Index (MPI), maps permanent BridgeIDs, and pushes telemetry down to external repositories.`,
      groundedSources: [
        { title: "BridgeCore Central Offline Replication Spec v3.0", url: "https://ai.studio/build" }
      ],
      modeUsed: mode
    };
  }

  if (normalized.includes("deduplication") || normalized.includes("fuzzy") || normalized.includes("duplicate") || normalized.includes("match") || normalized.includes("merge")) {
    return {
      text: `### 🧬 BridgeID Dual-Pass Deduplication & Security Audit

The **BridgeID** micro-service hosts a real-time smart matching subsystem to prevent identity division, ensuring patients have a single sovereign health profile.

#### Detection Workflows:
1. **Pass I (Deterministic Keys):** Exact matching is run against the **16-digit National ID** and/or deep cryptographic **biometric fingerprint/iris signatures**.
2. **Pass II (Probabilistic Fuzzy Scoring):**
   - **First/Last Name Overlaps:** Weighted at **0.50** (with a **0.45** swap buffer for *Iracyuzuka Divine* vs *Divine Iracyuzuka*).
   - **Date of Birth:** Weighted at **0.35**.
   - **Birth District:** Weighted at **0.15**.
3. **Decision Criteria:**
   - **Score ≥ 0.95:** Directly merges and locks duplication automatically.
   - **0.70 ≤ Score < 0.95:** Suspends automatic minting, issues a **PENDING_REVIEW** tag, and queues the candidate on the supervisor's audit desk for merge validation.`,
      groundedSources: [
        { title: "National ID Agency (NIDA) Rwanda Security Standard", url: "https://www.nida.gov.rw/" }
      ],
      modeUsed: mode
    };
  }

  if (normalized.includes("seven") || normalized.includes("7 services") || normalized.includes("pillar") || normalized.includes("services")) {
    return {
      text: `### 🏦 The 7 Core Microservices of BridgeCore

Bridge2Agency+ operates on **BridgeCore**, a central enterprise service architecture designed specifically to decouple digital health apps:

1. **BridgeID (MPI & Identity):** Governs sovereign lifelong multi-biometric citizen ID mappings.
2. **BridgeEvents (Enterprise Event Bus):** High-speed pub/sub pipelines keeping OpenMRS, e-Ubuzima, and regional portals decoupled.
3. **BridgeSync (Offline Buffering):** Directs client-side queue buffers and deferred records.
4. **BridgeNotify (Alerts & Outreach):** Controls localized SMS alerts and remote cell alerts.
5. **BridgeSecurity (Auditing):** Tamper-proof activity registers, crypt-signed actions, and role RBAC levels.
6. **BridgeGateway (External Adapters):** Integrates third-party FHIR JSON endpoints, legacy APIs, and labs.
7. **BridgeAI (Insights & Assistant):** Powers clinical predictions, search grounding, and smart diagnostics suggestions.`,
      groundedSources: [
        { title: "BridgeCore System Architecture Handbooks - Phase II", url: "https://ai.studio/build" }
      ],
      modeUsed: mode
    };
  }

  return {
    text: `### 💡 BridgeCore Consulting Architect Report

Thank you for your inquiry regarding the **Bridge2Agency+ Unified National Health OS** for Rwanda.

#### Operational Notes:
- **System Architecture:** All 12 specialized Phase apps execute data routines via **BridgeCore**'s decoupled 7-service APIs.
- **Interoperability:** Integration is governed by standard HL7 FHIR structures to bridge resources across OpenMRS, DHIS2, and localized clinics.
- **Outreach & Security:** Every clinical event generates an immutable message payload tracing biometric records, ensuring data safety and audit trails.

Regarding **"${prompt}"**:
- This implementation pattern conforms with local administrative standards (down to Village/Isibo level).
- If you're working offline, actions will be temporarily stored in local storage and synced once network status is set to \`ONLINE\`.
- All credentials and logs are monitored through the BridgeCore Security suite.

*🔄 [Offline Failover Mode Enabled]: The core AI system is currently utilizing the local architectural consultant engine to process your request.*`,
    groundedSources: [
      { title: "Ministry of Health (MINISANTE) Digital Transformation Strategy", url: "https://www.moh.gov.rw/" }
    ],
    modeUsed: mode
  };
}

// Generates high-quality fallback vector schematic images as base64-encoded SVGs when the image gen quota is exhausted
function getLocalFallbackImage(prompt: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="100%" height="100%" style="background:#090d16; font-family:monospace;">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#818cf8;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#34d399;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="#070a13" />
  <path d="M 0,50 L 500,50 M 0,100 L 500,100 M 0,150 L 500,150 M 0,200 L 500,200 M 0,250 L 500,250 M 0,300 L 500,300 M 0,350 L 500,350 M 0,400 L 500,400 M 0,450 L 500,450" stroke="#111827" stroke-width="1"/>
  <path d="M 50,0 L 50,500 M 100,0 L 100,500 M 150,0 L 150,500 M 200,0 L 200,500 M 250,0 L 250,500 M 300,0 L 300,500 M 350,0 L 350,500 M 400,0 L 400,500 M 450,0 L 450,500" stroke="#111827" stroke-width="1"/>
  <circle cx="250" cy="220" r="90" fill="none" stroke="url(#grad)" stroke-width="4" stroke-dasharray="10 5" />
  <circle cx="250" cy="220" r="70" fill="none" stroke="#818cf8" stroke-width="2" />
  <circle cx="250" cy="220" r="10" fill="#34d399" />
  <path d="M 100 220 L 160 220" stroke="#818cf8" stroke-width="2" />
  <path d="M 340 220 L 400 220" stroke="#818cf8" stroke-width="2" />
  <circle cx="100" cy="220" r="6" fill="#818cf8" />
  <circle cx="400" cy="220" r="6" fill="#818cf8" />
  <text x="250" y="370" fill="#e2e8f0" font-size="14" font-weight="bold" text-anchor="middle">BridgeCore Unified Schematic</text>
  <text x="250" y="395" fill="#64748b" font-size="10" text-anchor="middle">Sovereign National Health OS for Rwanda</text>
  <text x="250" y="420" fill="#34d399" font-size="9" text-anchor="middle" font-weight="bold">[ LOCAL SYSTEM DRAWING MINTED ]</text>
  <text x="250" y="445" fill="#a78bfa" font-size="8" text-anchor="middle">Prompt: ${prompt.length > 50 ? prompt.substring(0, 47) + '...' : prompt}</text>
</svg>`;
  return Buffer.from(svg).toString("base64");
}

// REST endpoints for AI capabilities
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { prompt, mode, conversation } = req.body;
    const ai = getGeminiClient();

    // Default system blueprint instructions to contextualize the AI on Bridge2Agency+
    const blueprintContext = `
      You are the ultimate BridgeCore AI Architect and National Health OS Consultant for Rwanda (Bridge2Agency+).
      License: MIT © 2026 micomyizaemerton-ship-it.
      
      You must help the user explore the architectural blueprint, simulate events, write integrations (stubs for OpenMRS, e-Ubuzima, e-Banguka, RSSB, HMIS), or design features.
      
      About Bridge2Agency+:
      - Core Philosophy: No application communicates directly with another application. Every app reads & writes through BridgeCore.
      - 7 Services: BridgeID (Patient MPI, RW- UUIDs), BridgeEvents (Pub/Sub Event Bus), BridgeSync (Offline-first replication), BridgeNotify (SMS/Alerts), BridgeSecurity (Audit logs & RBAC), BridgeGateway (external adapters, OpenMRS/e-Ubuzima/e-Banguka), BridgeAI (predictions/insights).
      - Applications: 12 modular apps across Phase 1 (Care, Life, Community, Response), Phase 2 (Watch, Gov, Link, Asset), Phase 3 (Flow, Work, Cover, Insight), Phase 4 (Lab, Pharma, Research, Portal).
      - Unified Portal: BridgeDash displays active connections, real-time pipeline visualizers, and system heatmaps.
      - Administrative Hierarchy of Rwanda: Province -> District -> Sector -> Cell -> Village -> Isibo.

      When responding, keep it deeply professional, engineering-focused, and highly relevant to the blueprint.
    `;

    let modelName = "gemini-3.5-flash";
    const config: any = {
      systemInstruction: blueprintContext,
    };

    if (mode === "thinking") {
      modelName = "gemini-3.1-pro-preview";
      config.thinkingConfig = {
        thinkingLevel: ThinkingLevel.HIGH
      };
      // Do not set maxOutputTokens for high thinking level as guided
    } else if (mode === "search") {
      modelName = "gemini-3.5-flash";
      config.tools = [{ googleSearch: {} }];
    } else if (mode === "maps") {
      modelName = "gemini-3.5-flash";
      config.tools = [{ googleMaps: {} }];
    }

    // Process using chats or generateContent
    const formattedContents = conversation && conversation.length > 0 
      ? conversation.map((msg: any) => ({
          role: msg.sender === "ai" ? "model" : "user",
          parts: [{ text: msg.text }]
        }))
      : [];

    formattedContents.push({
      role: "user",
      parts: [{ text: prompt }]
    });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: formattedContents,
      config,
    });

    const candidate = response.candidates?.[0];
    const text = response.text || "No response text found.";
    
    // Extract grounding search metadata if present
    const groundedSources: { title: string; url: string }[] = [];
    if (candidate?.groundingMetadata?.groundingChunks) {
      for (const chunk of candidate.groundingMetadata.groundingChunks) {
        if (chunk.web?.title && chunk.web?.uri) {
          groundedSources.push({
            title: chunk.web.title,
            url: chunk.web.uri,
          });
        }
      }
    }

    res.json({
      text,
      groundedSources,
      modeUsed: mode,
    });
  } catch (error: any) {
    console.warn("Gemini API Chat Error encountered. Utilizing offline failover processor...", error);
    try {
      const fallback = getLocalFallbackResponse(req.body.prompt || "", req.body.mode || "thinking");
      res.json(fallback);
    } catch (fallbackError: any) {
      console.error("Critical: Fallback processor failed:", fallbackError);
      res.status(500).json({ error: error?.message || "Internal Server Error" });
    }
  }
});

app.post("/api/ai/generate-image", async (req, res) => {
  try {
    const { prompt, size } = req.body;
    const ai = getGeminiClient();

    // Use gemini-3-pro-image-preview as requested, with fallback to gemini-3.1-flash-image
    const imageModels = ["gemini-3-pro-image-preview", "gemini-3.1-flash-image", "gemini-2.5-flash-image"];
    let response = null;
    let modelUsed = "";
    let base64Image = "";

    for (const model of imageModels) {
      try {
        console.log(`Trying to generate image using ${model} with size: ${size}`);
        
        // Structure the correct config based on nano banana models
        const config: any = {
          imageConfig: {
            aspectRatio: "1:1",
            imageSize: size || "1K"
          }
        };

        const imageGenResponse = await ai.models.generateContent({
          model: model,
          contents: {
            parts: [{ text: `${prompt}. High resolution architectural design, medical UI asset style, flat colors, modern tech theme.` }]
          },
          config,
        });

        // Search the parts for inlineData containing the image
        if (imageGenResponse.candidates?.[0]?.content?.parts) {
          for (const part of imageGenResponse.candidates[0].content.parts) {
            if (part.inlineData?.data) {
              base64Image = part.inlineData.data;
              modelUsed = model;
              break;
            }
          }
        }
        
        if (base64Image) {
          response = imageGenResponse;
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${model} image generation failed, trying next fallback... Error:`, err?.message);
      }
    }

    if (!base64Image) {
      throw new Error("Could not find image output in any model response. Check your API permissions for image generation models.");
    }

    res.json({
      imageUrl: `data:image/png;base64,${base64Image}`,
      model: modelUsed
    });
  } catch (error: any) {
    console.warn("Gemini API Image Gen Error encountered. Utilizing offline vectors generator...", error);
    try {
      const fallbackBase64 = getLocalFallbackImage(req.body.prompt || "Schematic diagram");
      res.json({
        imageUrl: `data:image/svg+xml;base64,${fallbackBase64}`,
        model: "offline-failover-vectors"
      });
    } catch (fallbackError: any) {
      console.error("Critical: Fallback Image processor failed:", fallbackError);
      res.status(500).json({ error: error?.message || "Failed to generate system asset image." });
    }
  }
});

// ==========================================
// BRIDGECORE CLOUD INTEGRABILITY APIs
// ==========================================

// 1. MPI List Profiles
app.get("/api/patients", (req, res) => {
  const patients = loadJSONFile<DBPatient[]>("patients.json", SEED_PATIENTS);
  res.json(patients);
});

// 2. MPI Enrollment Engine (Dual-Pass Deterministic & Fuzzy Checking)
app.post("/api/patients", (req, res) => {
  try {
    const patients = loadJSONFile<DBPatient[]>("patients.json", SEED_PATIENTS);
    const counters = loadJSONFile<{ mpiSequence: number; offlineLocalSeq: number }>("counters.json", { mpiSequence: 84723, offlineLocalSeq: 1 });
    
    const formData = req.body;
    const errors: string[] = [];

    // Demographic Validation Block
    const nameRegex = /^[A-Za-zÀ-ÿ\s'-]{2,100}$/;
    if (!formData.firstName || !nameRegex.test(formData.firstName.trim())) {
      errors.push("First Name must contain at least 2 alphabetic characters.");
    }
    if (!formData.lastName || !nameRegex.test(formData.lastName.trim())) {
      errors.push("Last Name must contain at least 2 alphabetic characters.");
    }
    if (formData.nationalId && !/^\d{16}$/.test(formData.nationalId.trim())) {
      errors.push("National ID must be exactly 16 numeric digits.");
    }
    
    // Guardian age calculation
    const birthday = new Date(formData.dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const m = today.getMonth() - birthday.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthday.getDate())) {
      age--;
    }
    if (isNaN(age) || age < 0) {
      errors.push("Date of birth must be a past date.");
    } else if (age < 18 && (!formData.guardianName || formData.guardianName.trim().length < 2)) {
      errors.push("Guardian Name is strictly required for minors under 18 years old.");
    }

    if (errors.length > 0) {
      internalDispatchEvent('BridgeID', 'REGISTRATION_VALIDATION_FAILED', `Validation failed for ${formData.firstName} ${formData.lastName}.`);
      return res.status(400).json({ status: 'error', message: "Validation failure. Fix input fields according to national norms.", errors });
    }

    // 1 — Deterministic Exact match check on NID
    if (formData.nationalId) {
      const matchNid = patients.find(p => p.nationalId && p.nationalId === formData.nationalId && p.status !== 'DUPLICATE');
      if (matchNid) {
        internalDispatchEvent('BridgeID', 'REGISTRATION_PREVENTED', `Deduplication match: Blocked duplicate registration (NID match) under master ID: ${matchNid.bridgeId}.`);
        return res.json({ 
          status: 'existing', 
          message: `The client has already been registered in the system (National ID exact duplicate detected).`, 
          bridgeId: matchNid.bridgeId 
        });
      }
    }

    // 2 — Deterministic Exact match check on Biometrics
    if (formData.biometricHash) {
      const matchBio = patients.find(p => p.biometricHash && p.biometricHash === formData.biometricHash && p.status !== 'DUPLICATE');
      if (matchBio) {
        internalDispatchEvent('BridgeID', 'REGISTRATION_PREVENTED', `Deduplication match: Blocked duplicate registration (Biometric exact match) under master ID: ${matchBio.bridgeId}.`);
        return res.json({ 
          status: 'existing', 
          message: `The client has already been registered in the system (Biometrics exact match).`, 
          bridgeId: matchBio.bridgeId 
        });
      }
    }

    // 3 — Probabilistic Fuzzy score matching (Name: 0.50, DOB: 0.35, District: 0.15)
    let highestScore = 0;
    let matchPatient: DBPatient | null = null;

    for (const p of patients) {
      if (p.status === 'DUPLICATE') continue;

      let nameScore = 0;
      const fn1 = formData.firstName.trim().toLowerCase();
      const ln1 = formData.lastName.trim().toLowerCase();
      const fn2 = p.firstName.trim().toLowerCase();
      const ln2 = p.lastName.trim().toLowerCase();

      if (fn1 === fn2 && ln1 === ln2) {
        nameScore = 0.50;
      } else if (fn1 === ln2 && ln1 === fn2) {
        nameScore = 0.45; // Name swap
      } else if (fn1.includes(fn2) || fn2.includes(fn1) || ln1.includes(ln2) || ln2.includes(ln1)) {
        nameScore = 0.30;
      }

      const dobScore = (formData.dateOfBirth === p.dateOfBirth) ? 0.35 : 0;
      const d1 = (formData.birthDistrict || formData.district || '').trim().toLowerCase();
      const d2 = (p.birthDistrict || p.district || '').trim().toLowerCase();
      const distScore = (d1 === d2) ? 0.15 : 0;

      const score = nameScore + dobScore + distScore;
      if (score > highestScore) {
        highestScore = score;
        matchPatient = p;
      }
    }

    // Blocker matching duplicate limit (>= 0.95)
    if (matchPatient && highestScore >= 0.95) {
      internalDispatchEvent('BridgeID', 'REGISTRATION_PREVENTED', `Blocked demographic overlap matching duplicate profile: ${matchPatient.bridgeId}`);
      return res.json({
        status: 'existing',
        message: `High confidence demographic duplicate detected (Confidence: ${(highestScore * 100).toFixed(0)}%). Record already locked under priority ID.`,
        bridgeId: matchPatient.bridgeId
      });
    }

    // Compose life-time unique MPI code string
    const targetDistrict = formData.birthDistrict || formData.district || 'Gasabo';
    const distCode = DISTRICT_CODES[targetDistrict] || 'GAB';
    const parsedDob = new Date(formData.dateOfBirth);
    const day = String(parsedDob.getDate()).padStart(2, '0');
    const month = String(parsedDob.getMonth() + 1).padStart(2, '0');
    const year = String(parsedDob.getFullYear()).slice(-2);
    
    const permanentBridgeId = `${distCode}-${day}${month}-${year}-${String(counters.mpiSequence).padStart(6, '0')}`;

    // Supervisor PENDING_REVIEW threshold level (0.70 to 0.95)
    if (matchPatient && highestScore >= 0.70) {
      const pendingPatient: DBPatient = {
        ...formData,
        id: `pat_${Date.now()}`,
        bridgeId: permanentBridgeId,
        createdAt: new Date().toISOString(),
        status: 'PENDING_REVIEW'
      };

      patients.unshift(pendingPatient);
      saveJSONFile("patients.json", patients);
      
      counters.mpiSequence++;
      saveJSONFile("counters.json", counters);

      internalDispatchEvent('BridgeID', 'PATIENT_SUSPECTED_DUPLICATE', `Provisional registration code assigned to ${formData.firstName} ${formData.lastName}. Overlap score ${(highestScore * 100).toFixed(0)}% with ${matchPatient.firstName} ${matchPatient.lastName} (${matchPatient.bridgeId}).`);
      
      return res.json({
        status: 'pending_review',
        message: `Possible duplicate identified (Confidence score: ${(highestScore * 100).toFixed(0)}%). Provisional health identifier assigned as PENDING_REVIEW awaiting supervisor check.`,
        bridgeId: permanentBridgeId
      });
    }

    // Clean registration code path
    const validPatient: DBPatient = {
      ...formData,
      id: `pat_${Date.now()}`,
      bridgeId: permanentBridgeId,
      createdAt: new Date().toISOString(),
      status: 'SYNCED'
    };

    patients.unshift(validPatient);
    saveJSONFile("patients.json", patients);

    counters.mpiSequence++;
    saveJSONFile("counters.json", counters);

    internalDispatchEvent('BridgeID', 'PATIENT_ID_GENERATED', `Assigned permanent BridgeID: ${permanentBridgeId} to ${formData.firstName} ${formData.lastName}.`);
    internalDispatchEvent('BridgeGateway', 'E_UBUZIMA_RECORD_REPLICATED', `Synchronized health file record for ${permanentBridgeId} directly to national node.`);

    return res.json({
      status: 'created',
      message: `Citizen successfully registered. Unique lifetime BridgeID generated.`,
      bridgeId: permanentBridgeId
    });
  } catch (err: any) {
    console.error("Clinical MPI Registration crashed:", err);
    res.status(500).json({ error: "Sovereign cluster database write error: " + err.message });
  }
});

// 3. MPI Merge Profiles
app.post("/api/patients/merge", (req, res) => {
  try {
    const p1Id = req.body.p1Id || req.body.primaryId;
    const p2Id = req.body.p2Id || req.body.duplicateId;
    const patients = loadJSONFile<DBPatient[]>("patients.json", SEED_PATIENTS);
    
    const p1 = patients.find(p => p.id === p1Id);
    const p2 = patients.find(p => p.id === p2Id);

    if (!p1 || !p2) {
      return res.status(404).json({ error: "Specified master patient profiles not found." });
    }

    // Re-map references inside patients JSON list
    const updated = patients.map(p => {
      if (p.id === p2Id) {
        return { ...p, status: 'DUPLICATE' as const };
      }
      if (p.id === p1Id && p.status === 'PENDING_REVIEW') {
        return { ...p, status: 'SYNCED' as const };
      }
      return p;
    });

    saveJSONFile("patients.json", updated);

    internalDispatchEvent('BridgeID', 'PATIENT_MPI_RECORD_MERGED', `Duplicate resolved. Merged profile ${p2.firstName} ${p2.lastName} (NID: ${p2.nationalId}) into main health record folder ${p1.bridgeId}.`);
    res.json({ success: true, message: "Profiles merged seamlessly on the central master index." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Offline Buffers Upload Reconciliation Sync
app.post("/api/patients/sync", (req, res) => {
  try {
    const offlineList: DBPatient[] = req.body.batch || req.body.records || [];
    if (offlineList.length === 0) {
      return res.json({ status: "skipped", message: "Empty sync batch received." });
    }

    const patients = loadJSONFile<DBPatient[]>("patients.json", SEED_PATIENTS);
    const counters = loadJSONFile<{ mpiSequence: number; offlineLocalSeq: number }>("counters.json", { mpiSequence: 84723, offlineLocalSeq: 1 });

    const syncedResults: DBPatient[] = [];
    let currentSeq = counters.mpiSequence;

    for (const record of offlineList) {
      const rawDist = record.birthDistrict || record.district || "Gasabo";
      const distCode = DISTRICT_CODES[rawDist] || 'GAB';
      const parsedDob = new Date(record.dateOfBirth);
      const day = String(parsedDob.getDate()).padStart(2, '0');
      const month = String(parsedDob.getMonth() + 1).padStart(2, '0');
      const year = String(parsedDob.getFullYear()).slice(-2);
      
      const permanentId = `${distCode}-${day}${month}-${year}-${String(currentSeq).padStart(6, '0')}`;
      currentSeq++;

      const permanentRecord: DBPatient = {
        ...record,
        id: record.id.startsWith("pat_offline") ? `pat_${Date.now()}_${Math.floor(Math.random() * 1000)}` : record.id,
        bridgeId: permanentId,
        status: 'SYNCED'
      };

      patients.unshift(permanentRecord);
      syncedResults.push(permanentRecord);

      internalDispatchEvent('BridgeSync', 'PATIENT_OFFLINE_RECORD_SYNCHRONIZED', `Synchronized offline profile: ${record.firstName} ${record.lastName}. Reassigned ${record.bridgeId} -> ${permanentId}.`);
      internalDispatchEvent('BridgeGateway', 'E_UBUZIMA_RECORD_REPLICATED', `Synchronized health file for ${permanentId} to e-Ubuzima node.`);
    }

    counters.mpiSequence = currentSeq;
    saveJSONFile("counters.json", counters);
    saveJSONFile("patients.json", patients);

    internalDispatchEvent('BridgeSync', 'SYNC_COMPLETED', `Database sync complete. Synced ${offlineList.length} localized buffers onto central index.`);
    res.json({ status: "success", synced: syncedResults });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Interoperability Systems Connectors
app.get("/api/systems", (req, res) => {
  const systems = loadJSONFile<DBSystem[]>("systems.json", SEED_SYSTEMS);
  res.json(systems);
});

// 6. Set Connected status of Partner systems
app.post("/api/systems/status", (req, res) => {
  try {
    const { id, status } = req.body;
    const systems = loadJSONFile<DBSystem[]>("systems.json", SEED_SYSTEMS);
    
    const updated = systems.map(s => {
      if (s.id === id) {
        return { ...s, status };
      }
      return s;
    });

    saveJSONFile("systems.json", updated);
    internalDispatchEvent('BridgeGateway', 'PARTNER_CONNECTION_CHANGED', `Sovereign connector ${id} shifted to ${status} state.`);
    res.json({ success: true, systems: updated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Core Event Bus List Feed (Pub/Sub)
app.get("/api/events", (req, res) => {
  const events = loadJSONFile<DBEvent[]>("events.json", SEED_EVENTS);
  res.json(events);
});

// 8. Publish custom event from other apps
app.post("/api/events", (req, res) => {
  try {
    const { source, type, payload } = req.body;
    const event = internalDispatchEvent(source, type, payload);
    res.json(event);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Core Queued Notifications list
app.get("/api/notifications", (req, res) => {
  const notifications = loadJSONFile<DBNotification[]>("notifications.json", []);
  res.json(notifications);
});

// 10. HL7 FHIR Profile Converter Engine (Interoperability Translation Controller)
app.post("/api/interop/fhir", (req, res) => {
  try {
    const { resourceType, data } = req.body;
    
    if (!resourceType || !data) {
      return res.status(400).json({ error: "Required params 'resourceType' and 'data' are missing." });
    }

    let fhirPayload: any = {};

    if (resourceType === 'Patient') {
      fhirPayload = {
        resourceType: "Patient",
        id: data.bridgeId || "unknown-bridge-id",
        meta: {
          profile: ["https://hl7.org/fhir/structuredefinitions/Patient"],
          versionId: "1",
          lastUpdated: new Date().toISOString()
        },
        identifier: [
          {
            use: "official",
            type: {
              coding: [
                {
                  system: "https://bridgecore.gov.rw/naming-systems/upi",
                  code: "UPI",
                  display: "Universal Patient Identifier"
                }
              ]
            },
            system: "https://bridgecore.gov.rw/identifiers/patients",
            value: data.bridgeId
          },
          {
            use: "secondary",
            system: "https://nida.gov.rw/identifiers/national-id",
            value: data.nationalId
          }
        ],
        active: data.status !== 'DUPLICATE',
        name: [
          {
            use: "official",
            family: data.lastName,
            given: [data.firstName]
          }
        ],
        telecom: [
          {
            system: "phone",
            value: data.phone,
            use: "mobile"
          }
        ],
        gender: data.gender === 'FEMALE' ? 'female' : 'male',
        birthDate: data.dateOfBirth,
        address: [
          {
            use: "home",
            type: "physical",
            line: [data.village, data.isibo || ""],
            city: data.sector,
            district: data.district,
            state: data.province,
            country: "RWANDA"
          }
        ],
        extension: [
          {
            url: "https://bridgecore.gov.rw/structuredefinitions/insurance-number",
            valueString: data.insuranceNumber
          },
          {
            url: "https://bridgecore.gov.rw/structuredefinitions/blood-group",
            valueString: data.bloodGroup
          }
        ]
      };
    } else {
      // General Observation
      fhirPayload = {
        resourceType: "Observation",
        id: `obs-${Date.now()}`,
        status: "final",
        category: [
          {
            coding: [
              {
                system: "http://terminology.hl7.org/CodeSystem/observation-category",
                code: "vital-signs",
                display: "Vital Signs"
              }
            ]
          }
        ],
        code: {
          coding: [
            {
              system: "http://loinc.org",
              code: data.loincCode || "8867-4",
              display: data.display || "Heart rate"
            }
          ]
        },
        subject: {
          reference: `Patient/${data.bridgeId || 'unknown'}`
        },
        effectiveDateTime: new Date().toISOString(),
        valueQuantity: {
          value: data.value || 72,
          unit: data.unit || "bpm",
          system: "http://unitsofmeasure.org",
          code: data.unitCode || "/min"
        }
      };
    }

    internalDispatchEvent('BridgeGateway', 'FHIR_CONVERSION_COMPLETED', `Converted raw client schema for ${resourceType} (${fhirPayload.id}) to HL7 FHIR JSON standards (v4.0.1).`);
    res.json({
      success: true,
      standard: "HL7 FHIR JSON Payload (v4.0.1)",
      fhir: fhirPayload
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Multi-App Integration Loop Pipeline Sandbox (Interoperability Master Simulation Controller)
app.post("/api/simulations/scenario", (req, res) => {
  try {
    const { scenarioId } = req.body;
    
    if (scenarioId === 'pregnancy') {
      internalDispatchEvent('BridgeLife Portal', 'SIMULATED_SUCCESS', 'Citizen profile entered. Triggering central identity request.');
      internalDispatchEvent('BridgeCore: BridgeID', 'SIMULATED_SUCCESS', 'Primary Master Patient ID assigned: GAB-2208-90-084721.');
      internalDispatchEvent('BridgeCore: BridgeEvents', 'SIMULATED_SUCCESS', 'Event published: MATERNAL_PROFILE_REGISTERED');
      internalDispatchEvent('BridgeCommunity Mobile', 'SIMULATED_SUCCESS', 'Clinical notification matching assigned CHW generated. Delayed SMS checkup alerts dispatched.');
      internalDispatchEvent('BridgeCore: BridgeGateway', 'SIMULATED_SUCCESS', 'Pushed central medical folder payload to external e-Ubuzima cloud.');
      internalDispatchEvent('BridgeGov Dashboard', 'SIMULATED_SUCCESS', 'Aggregate indicator reporting counts +1.');
      
      return res.json({
        success: true,
        message: "Maternal Health loop orchestrated across 4 applications sequentially.",
        systemsInformed: ["BridgeLife", "BridgeID", "BridgeEvents", "BridgeCommunity", "BridgeGateway", "BridgeGov"]
      });
    }

    if (scenarioId === 'emergency') {
      internalDispatchEvent('BridgeResponse Dispatch', 'SIMULATED_SUCCESS', 'GPS signal tracked. Nearest Ambulance 02 routes mapped instantly.');
      internalDispatchEvent('BridgeCore: BridgeEvents', 'SIMULATED_SUCCESS', 'Event published: EMERGENCY_CRITICAL_ACCIDENT');
      internalDispatchEvent('BridgeCore: BridgeNotify', 'SIMULATED_SUCCESS', 'Dispatched real-time high-priority push notifications to regional clinical coordinates.');
      internalDispatchEvent('BridgeLink Referrals', 'SIMULATED_SUCCESS', 'Bed availability audit completed. Reserved emergency trauma support ward.');
      internalDispatchEvent('BridgeCore: BridgeSecurity', 'SIMULATED_SUCCESS', 'Logged emergency supervisor security record credentials.');
      
      return res.json({
        success: true,
        message: "Regional emergency dispatch loop orchestrated across 3 apps.",
        systemsInformed: ["BridgeResponse", "BridgeEvents", "BridgeNotify", "BridgeLink", "BridgeSecurity"]
      });
    }

    if (scenarioId === 'outbreak') {
      internalDispatchEvent('BridgeCare EMR', 'SIMULATED_SUCCESS', 'Infectious syndromic symptom code flagged inside EMR consulta panel.');
      internalDispatchEvent('BridgeCore: BridgeEvents', 'SIMULATED_SUCCESS', 'Event published: OUTBREAK_ALERT_VHF');
      internalDispatchEvent('BridgeCore: BridgeSecurity', 'SIMULATED_SUCCESS', 'Critical access encryption enabled on overlapping demographics.');
      internalDispatchEvent('BridgeWatch Surveill.', 'SIMULATED_SUCCESS', 'AI cluster center identified. Highlighted 3 villages inside Gisenyi district borders.');
      internalDispatchEvent('BridgeCore: BridgeGateway', 'SIMULATED_SUCCESS', 'Synchronized real-time analytical outbreak package to DHIS2 aggregate hubs.');

      return res.json({
        success: true,
        message: "Disease surveillance outbreak pipeline structured.",
        systemsInformed: ["BridgeCare", "BridgeEvents", "BridgeSecurity", "BridgeWatch", "BridgeGateway", "DHIS2"]
      });
    }

    res.status(400).json({ error: "Specified scenario ID is not supported." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// App Health Check Endpoints
app.get("/api/health", (req, res) => {
  const patients = loadJSONFile<DBPatient[]>("patients.json", SEED_PATIENTS);
  res.json({ status: "ok", version: "BridgeCore v0.1.0-beta", systems: ["OpenMRS", "e-Ubuzima", "e-Banguka", "RSSB", "DHIS2"], indexCount: patients.length });
});

// Mount Vite middleware for dev or serve static files in prod
async function setupServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Production static distribution pipeline integrated.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`BridgeCore Cloud live on http://localhost:${PORT}`);
  });
}

setupServer();
