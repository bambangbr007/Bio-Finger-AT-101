import React, { useState } from 'react';
import { 
  Cloud, 
  Database, 
  Server, 
  Cpu, 
  ShieldCheck, 
  Workflow, 
  Zap, 
  Layers, 
  Code2, 
  CheckCircle2, 
  Copy, 
  Terminal,
  ArrowRight,
  Radio,
  FileCode,
  Smartphone,
  Laptop
} from 'lucide-react';

export const CloudArchitectureViewer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'schema' | 'ddl' | 'pipeline'>('architecture');
  const [copied, setCopied] = useState<boolean>(false);

  const sqlDdlScript = `-- =================================================================
-- BIO FINGER AT-101 CLOUD ATTENDANCE DATABASE SCHEMA (PostgreSQL 16)
-- Scalable, High-Availability Multi-AZ Architecture for 480+ Students
-- =================================================================

-- 1. MASTER STUDENTS TABLE
CREATE TABLE students (
    student_id VARCHAR(20) PRIMARY KEY, -- e.g. 'STU-001'
    pin VARCHAR(10) UNIQUE NOT NULL,    -- BioFinger AT-101 Hardware PIN (1001-1480)
    nisn VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(120) NOT NULL,
    class_name VARCHAR(20) NOT NULL,    -- e.g. 'Kelas 7A'
    gender CHAR(1) CHECK (gender IN ('L', 'P')),
    parent_name VARCHAR(120) NOT NULL,
    parent_whatsapp VARCHAR(20) NOT NULL, -- e.g. '6281234567801'
    parent_email VARCHAR(120) NOT NULL,
    avatar_url TEXT,
    fingerprint_enrolled BOOLEAN DEFAULT TRUE,
    rfid_card VARCHAR(30) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_students_pin ON students(pin);
CREATE INDEX idx_students_class ON students(class_name);
CREATE INDEX idx_students_parent_wa ON students(parent_whatsapp);

-- 2. HARDWARE DEVICE MANAGEMENT
CREATE TABLE biofinger_devices (
    device_id VARCHAR(50) PRIMARY KEY, -- e.g. 'AT-101-GATE-01'
    device_model VARCHAR(50) DEFAULT 'BIO Finger AT-101',
    ip_address INET NOT NULL,
    port INTEGER DEFAULT 4370,
    comm_key VARCHAR(50) DEFAULT '0',
    location_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'ONLINE', -- ONLINE, OFFLINE, SYNCING
    firmware_version VARCHAR(30) DEFAULT 'v6.60',
    last_heartbeat TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. RAW INGESTION STREAM (High Throughput Log)
CREATE TABLE biofinger_raw_logs (
    log_id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(50) REFERENCES biofinger_devices(device_id),
    pin VARCHAR(10) NOT NULL,
    scan_timestamp TIMESTAMPTZ NOT NULL,
    verify_mode SMALLINT DEFAULT 1,     -- 1: Fingerprint, 2: RFID, 3: Password
    in_out_state SMALLINT DEFAULT 0,    -- 0: Check-In, 1: Check-Out
    raw_packet BYTEA,                   -- Hex TCP payload for audit
    ingested_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_raw_pin_timestamp ON biofinger_raw_logs(pin, scan_timestamp DESC);

-- 4. VALIDATED DAILY ATTENDANCE SUMMARY (Core Query Table)
CREATE TABLE daily_attendance (
    attendance_id VARCHAR(60) PRIMARY KEY, -- e.g. 'ATT-2026-10-04-STU-001'
    student_id VARCHAR(20) REFERENCES students(student_id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    status VARCHAR(20) NOT NULL CHECK (
        status IN ('HADIR_TEPAT', 'TERLAMBAT', 'PULANG_AWAL', 'SAKIT', 'IZIN', 'ALPHA', 'BELUM_HADIR')
    ),
    late_minutes INTEGER DEFAULT 0,
    early_minutes INTEGER DEFAULT 0,
    check_in_device VARCHAR(50),
    check_out_device VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_daily_attendance UNIQUE (student_id, attendance_date)
);

CREATE INDEX idx_attendance_date_status ON daily_attendance(attendance_date, status);
CREATE INDEX idx_attendance_student_date ON daily_attendance(student_id, attendance_date);

-- 5. REAL-TIME NOTIFICATION DISPATCH LOGS
CREATE TABLE notification_dispatches (
    dispatch_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id VARCHAR(20) REFERENCES students(student_id),
    channel VARCHAR(10) CHECK (channel IN ('WHATSAPP', 'EMAIL')),
    recipient_contact VARCHAR(100) NOT NULL,
    direction VARCHAR(20) CHECK (direction IN ('CHECK_IN', 'CHECK_OUT', 'ABSENCE', 'MANUAL')),
    payload TEXT NOT NULL,
    delivery_status VARCHAR(20) DEFAULT 'DELIVERED', -- PENDING, SENT, DELIVERED, FAILED
    gateway_provider VARCHAR(30) DEFAULT 'FONNTE',
    latency_ms INTEGER,
    dispatched_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_student ON notification_dispatches(student_id, dispatched_at DESC);

-- 6. PARENT LEAVE & SICK REQUESTS (Permission Engine)
CREATE TABLE parent_leave_requests (
    request_id VARCHAR(40) PRIMARY KEY,
    student_id VARCHAR(20) REFERENCES students(student_id),
    leave_type VARCHAR(10) CHECK (leave_type IN ('SAKIT', 'IZIN')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    parent_note TEXT,
    approval_status VARCHAR(20) DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
    approved_by VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlDdlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Top Banner */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base">Arsitektur Cloud & Skema Database Tangguh</h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Google Cloud Platform (GCP)
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Desain sistem ketersediaan tinggi (High Availability), Anti-Latency & Integritas Data 480 Siswa
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'architecture' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Diagram Topologi Cloud
          </button>
          <button
            onClick={() => setActiveTab('pipeline')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'pipeline' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Pipeline Data & Sub-Detik
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'schema' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            Tabel & Relasi
          </button>
          <button
            onClick={() => setActiveTab('ddl')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              activeTab === 'ddl' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            SQL DDL Script
          </button>
        </div>
      </div>

      <div className="p-5">

        {/* TAB 1: CLOUD TOPOLOGY ARCHITECTURE */}
        {activeTab === 'architecture' && (
          <div className="space-y-6">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Workflow className="w-4 h-4 text-blue-600" />
                <span>Peta Arsitektur Cloud (Zero-Downtime, Multi-Tier)</span>
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Dirancang berbasis <strong>Google Cloud Platform (GCP)</strong> dengan pemisahan antara Ingestion Layer mesin BIO Finger AT-101, Caching Queue (Redis), Database Relasional ACID (Cloud SQL PostgreSQL), Worker Antrian Notifikasi, serta Frontend Responsif multi-perangkat.
              </p>
            </div>

            {/* Architecture Blocks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Layer 1: Hardware & Edge */}
              <div className="bg-white p-4 rounded-2xl border-2 border-blue-200 shadow-sm relative">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs mb-3">
                  01
                </div>
                <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span>Edge Device Layer</span>
                </h5>
                <p className="text-[11px] text-slate-500 mt-1 mb-3">
                  Perangkat fisik di gerbang sekolah
                </p>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-900 font-semibold">
                    • BIO Finger AT-101 (Optik 500 DPI)
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                    • TCP/IP Port 4370 & USB Disk Export
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                    • Enrolment 480 Sidik Jari Siswa
                  </div>
                </div>
              </div>

              {/* Layer 2: Ingestion & In-Memory Stream */}
              <div className="bg-white p-4 rounded-2xl border-2 border-emerald-200 shadow-sm relative">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs mb-3">
                  02
                </div>
                <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-emerald-600" />
                  <span>Ingestion & Fast Queue</span>
                </h5>
                <p className="text-[11px] text-slate-500 mt-1 mb-3">
                  Pemrosesan real-time & anti-antrian
                </p>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-900 font-semibold">
                    • Cloud Run / App Engine (Microservice)
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                    • Cloud Memorystore (Redis Pub/Sub)
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                    • Anti-Bounce Buffer (Filter tap ganda)
                  </div>
                </div>
              </div>

              {/* Layer 3: Persistent Relational Storage */}
              <div className="bg-white p-4 rounded-2xl border-2 border-indigo-200 shadow-sm relative">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs mb-3">
                  03
                </div>
                <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-indigo-600" />
                  <span>Cloud SQL PostgreSQL</span>
                </h5>
                <p className="text-[11px] text-slate-500 mt-1 mb-3">
                  Basis data ACID & Multi-AZ Replikasi
                </p>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-900 font-semibold">
                    • PostgreSQL 16 (High Availability)
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                    • Composite Index (Student, Date, Pin)
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                    • Automated Daily Backup & PITR
                  </div>
                </div>
              </div>

              {/* Layer 4: Event Workers & Delivery */}
              <div className="bg-white p-4 rounded-2xl border-2 border-purple-200 shadow-sm relative">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs mb-3">
                  04
                </div>
                <h5 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span>Dispatch & UI Clients</span>
                </h5>
                <p className="text-[11px] text-slate-500 mt-1 mb-3">
                  Penyampaian instan ke Laptop & HP
                </p>
                <div className="space-y-1.5 text-xs">
                  <div className="p-2 rounded-lg bg-purple-50 border border-purple-100 text-purple-900 font-semibold">
                    • WhatsApp Gateway Engine (Fonnte/Wablas)
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                    • Admin Portal (Laptop/PC Web SPA)
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                    • Orang Tua PWA (HP Responsive No-Zoom)
                  </div>
                </div>
              </div>

            </div>

            {/* Key Cloud Benefits */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-xs">
                <span className="font-bold text-blue-900 block mb-1">⚡ Kecepatan Sub-Detik (&lt;200ms)</span>
                <p className="text-blue-700 text-[11px] leading-relaxed">
                  Worker asynchronous memastikan pembacaan sidik jari di mesin tidak terhambat oleh proses pengiriman pesan WhatsApp atau penulisan log.
                </p>
              </div>

              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs">
                <span className="font-bold text-emerald-900 block mb-1">🔒 Integritas Data & Anti-Titip Absen</span>
                <p className="text-emerald-700 text-[11px] leading-relaxed">
                  Constraint unik `UNIQUE(student_id, attendance_date)` mencegah entri ganda, dan enkripsi payload memastikan validitas log AT-101.
                </p>
              </div>

              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl text-xs">
                <span className="font-bold text-amber-900 block mb-1">📱 Skalabilitas & Akses Fleksibel</span>
                <p className="text-amber-700 text-[11px] leading-relaxed">
                  Mendukung 480 siswa secara simultan saat jam sibuk kedatangan (06:30 - 07:15 WIB) tanpa lonjakan CPU atau kegagalan transaksi.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PIPELINE DETAIL */}
        {activeTab === 'pipeline' && (
          <div className="space-y-4 text-xs">
            <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800">
              <h4 className="font-bold text-sm text-emerald-400 mb-2 flex items-center gap-2">
                <Radio className="w-4 h-4 animate-pulse" />
                <span>Alur Pemrosesan Data Real-Time Dari Sensor ke Orang Tua</span>
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Berikut adalah timeline langkah-demi-langkah ketika siswa menempelkan jari pada sensor optik BIO Finger AT-101:
              </p>
            </div>

            <div className="relative border-l-2 border-blue-500 ml-4 pl-6 space-y-6">
              
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-600 border-2 border-white"></div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900">1. Pemindaian Sensor & Pengiriman Packet TCP (0 - 50ms)</span>
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono font-bold">50ms</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Siswa menempelkan jari ke prisma 500 DPI. BIO Finger AT-101 mencocokkan minutiae dengan template tersimpan, lalu mengirimkan payload ZK packet ke Cloud Ingestion Gateway via port 4370.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-emerald-600 border-2 border-white"></div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900">2. Normalisasi, Anti-Bounce & Validasi Aturan Jam (50 - 100ms)</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono font-bold">50ms</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Sistem mengecek memori Redis untuk memastikan tidak ada tap berulang dalam rentang 60 detik (anti-double tap). Sistem mencocokkan PIN dengan database 480 siswa dan membandingkan jam scan dengan batas toleransi 07:15 WIB.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-indigo-600 border-2 border-white"></div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900">3. Transaksi ACID di Cloud SQL PostgreSQL (100 - 140ms)</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono font-bold">40ms</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Data kehadiran harian (waktu masuk, waktu pulang, menit terlambat) ditulis ke tabel `daily_attendance` dengan jaminan integritas data ACID penuh.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-purple-600 border-2 border-white"></div>
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-900">4. Eksekusi Notifikasi WhatsApp & Update Dashboard Orang Tua (140 - 250ms)</span>
                    <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-mono font-bold">110ms</span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Worker Cloud Tasks meneruskan pesan ke nomor WhatsApp wali murid (+628xxx) secara asynchronous, sementara WebSocket push langsung memperbarui status presensi di HP orang tua secara live tanpa reload halaman.
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: RELATIONAL SCHEMA EXPLORER */}
        {activeTab === 'schema' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-2 border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-1.5 text-blue-700">
                    <Database className="w-4 h-4" /> students (480 Baris)
                  </span>
                  <span className="font-mono text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Master Data</span>
                </div>
                <ul className="space-y-1 font-mono text-[11px] text-slate-600">
                  <li>🔑 student_id: VARCHAR(20) [PK]</li>
                  <li>🏷️ pin: VARCHAR(10) [UNIQUE, INDEX] (BioFinger PIN)</li>
                  <li>📄 nisn: VARCHAR(20) [UNIQUE]</li>
                  <li>👤 full_name: VARCHAR(120)</li>
                  <li>🏫 class_name: VARCHAR(20) (Kelas 7A - 9D)</li>
                  <li>👥 parent_name: VARCHAR(120)</li>
                  <li>📱 parent_whatsapp: VARCHAR(20) [INDEX]</li>
                  <li>📧 parent_email: VARCHAR(120)</li>
                  <li>👆 fingerprint_enrolled: BOOLEAN</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-2 border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <Database className="w-4 h-4" /> daily_attendance (Transaksional)
                  </span>
                  <span className="font-mono text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Core Query</span>
                </div>
                <ul className="space-y-1 font-mono text-[11px] text-slate-600">
                  <li>🔑 attendance_id: VARCHAR(60) [PK]</li>
                  <li>🔗 student_id: VARCHAR(20) [FK &rarr; students]</li>
                  <li>📅 attendance_date: DATE [INDEX]</li>
                  <li>⏰ check_in_time: TIME</li>
                  <li>⏰ check_out_time: TIME</li>
                  <li>📌 status: ENUM (HADIR_TEPAT, TERLAMBAT, dll)</li>
                  <li>⏱️ late_minutes: INTEGER</li>
                  <li>🔒 CONSTRAINT: UNIQUE(student_id, attendance_date)</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-2 border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-1.5 text-purple-700">
                    <Database className="w-4 h-4" /> notification_dispatches
                  </span>
                  <span className="font-mono text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded">Gateway Logs</span>
                </div>
                <ul className="space-y-1 font-mono text-[11px] text-slate-600">
                  <li>🔑 dispatch_id: UUID [PK]</li>
                  <li>🔗 student_id: VARCHAR(20) [FK &rarr; students]</li>
                  <li>📡 channel: VARCHAR(10) (WHATSAPP, EMAIL)</li>
                  <li>📞 recipient_contact: VARCHAR(100)</li>
                  <li>✉️ payload: TEXT (Pesan Resmi)</li>
                  <li>✓ delivery_status: VARCHAR(20)</li>
                  <li>⚡ latency_ms: INTEGER</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70">
                <div className="flex items-center justify-between font-bold text-slate-900 mb-2 border-b border-slate-200 pb-2">
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <Database className="w-4 h-4" /> biofinger_devices
                  </span>
                  <span className="font-mono text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Hardware Registry</span>
                </div>
                <ul className="space-y-1 font-mono text-[11px] text-slate-600">
                  <li>🔑 device_id: VARCHAR(50) [PK]</li>
                  <li>🏷️ device_model: 'BIO Finger AT-101'</li>
                  <li>🌐 ip_address: INET ('192.168.1.201')</li>
                  <li>🔌 port: INTEGER (4370)</li>
                  <li>📍 location_name: VARCHAR(100)</li>
                  <li>💓 last_heartbeat: TIMESTAMPTZ</li>
                </ul>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: SQL DDL SCRIPT */}
        {activeTab === 'ddl' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600">
                Script Skema Lengkap PostgreSQL 16 (Telah Dioptimasi untuk Cloud SQL)
              </span>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all shadow-xs"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin ke Clipboard!' : 'Salin Script SQL'}</span>
              </button>
            </div>

            <div className="bg-slate-950 text-slate-200 p-4 rounded-2xl font-mono text-xs overflow-x-auto max-h-[450px] border border-slate-800 shadow-inner">
              <pre>{sqlDdlScript}</pre>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
