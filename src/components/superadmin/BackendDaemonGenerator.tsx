import React, { useState, useEffect } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { 
  Terminal, 
  Cpu, 
  Clock, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Square, 
  Copy, 
  Check, 
  Download, 
  FileCode, 
  Layers, 
  Server, 
  Send, 
  Smartphone, 
  HelpCircle,
  Activity,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const BackendDaemonGenerator: React.FC = () => {
  const { schoolConfig, students } = useAttendance();
  const [selectedLanguage, setSelectedLanguage] = useState<'nodejs' | 'python' | 'systemd' | 'windows'>('nodejs');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Simulation State for 07:15 WIB Auto-Pipeline
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [simLogs, setSimLogs] = useState<string[]>([]);
  const [simStats, setSimStats] = useState<{ hadir: number; terlambat: number; tidakHadir: number } | null>(null);
  const [queueProgress, setQueueProgress] = useState<{ current: number; total: number } | null>(null);

  const handleCopyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Run real-time simulation of the 07:15 WIB Cron trigger
  const runSimulation = () => {
    setIsSimulating(true);
    setSimulationStep(1);
    setSimLogs([]);
    setSimStats(null);
    setQueueProgress(null);

    const addLog = (msg: string) => {
      const nowStr = new Date().toLocaleTimeString('id-ID');
      setSimLogs(prev => [...prev, `[${nowStr}] ${msg}`]);
    };

    addLog('⏰ [CRON TRIGGER] Pukul 07:15:00 WIB tercapai! Memulai daemon presensi otomatis.');
    
    setTimeout(() => {
      setSimulationStep(2);
      addLog(`🔌 Membuka socket TCP ke BioFinger AT-101 (IP: ${schoolConfig.deviceIp}, Port: ${schoolConfig.devicePort})...`);
      addLog('✓ Handshake ZKTeco protocol berhasil! Mengunduh log transaksi presensi hari ini...');
    }, 1000);

    setTimeout(() => {
      setSimulationStep(3);
      addLog('✓ Berhasil mengunduh 415 event scan sidik jari dari memori internal AT-101.');
      addLog('🔍 Melakukan deduplikasi scan (mengambil waktu tap pertama/terawal per siswa)...');
      addLog('📊 Mencocokkan dengan Master Data 480 Siswa terdaftar...');
    }, 2200);

    setTimeout(() => {
      setSimulationStep(4);
      const hadir = 380;
      const terlambat = 35;
      const tidakHadir = 65; // 480 - 415
      setSimStats({ hadir, terlambat, tidakHadir });

      addLog(`✅ Hasil Validasi 480 Siswa:`);
      addLog(`   • Hadir Tepat Waktu (<= 07:00 WIB) : ${hadir} siswa`);
      addLog(`   • Terlambat (> 07:00 WIB)          : ${terlambat} siswa`);
      addLog(`   • Tidak Hadir (Tanpa Keterangan)   : ${tidakHadir} siswa (Otomatis Alpa)`);
      addLog('🚀 Memulai antrean pengiriman WhatsApp otomatis (Rate Limit: 1.5 detik per pesan)...');
      
      setQueueProgress({ current: 0, total: 480 });
    }, 3500);

    setTimeout(() => {
      setSimulationStep(5);
      setQueueProgress({ current: 120, total: 480 });
      addLog('📤 [Queue Worker] 65 Pesan Peringatan Tidak Hadir telah dikirimkan ke orang tua.');
      addLog('📤 [Queue Worker] 35 Pesan Keterlambatan terkirim dengan rincian menit telat.');
      addLog('📤 [Queue Worker] Mengirimkan pesan konfirmasi Hadir Tepat Waktu...');
    }, 5000);

    setTimeout(() => {
      setSimulationStep(6);
      setQueueProgress({ current: 480, total: 480 });
      addLog('🎉 [SELESAI] Seluruh 480 pesan WhatsApp berhasil dikirimkan ke orang tua tanpa terblokir spam!');
      addLog('📁 Laporan rekap harian disimpan ke: /logs/recap-' + new Date().toISOString().split('T')[0] + '.json');
      setIsSimulating(false);
    }, 6500);
  };

  const nodeJsCode = `/**
 * ==============================================================================
 * BIOFINGER AT-101 BACKGROUND SERVICE & NOTIFICATION DAEMON (NODE.JS)
 * ==============================================================================
 * Menghubungkan ke Mesin BioFinger AT-101 (ZKTeco Protocol Port 4370)
 * Eksekusi 100% Otomatis Setiap Hari Pukul 07:15 WIB via Cron Job
 * Validasi 480 Siswa & Pengiriman Notifikasi WhatsApp Rate-Limited Queue
 * ==============================================================================
 */

require('dotenv').config();
const cron = require('node-cron');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

// Konfigurasi Logger Winston
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => \`[\${timestamp}] [\${level.toUpperCase()}] \${message}\`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: path.join(__dirname, 'logs/attendance.log') })
  ]
});

const CONFIG = {
  deviceIp: process.env.BIOFINGER_IP || '${schoolConfig.deviceIp}',
  devicePort: parseInt(process.env.BIOFINGER_PORT, 10) || ${schoolConfig.devicePort},
  cronSchedule: '15 7 * * 1-6', // Jam 07.15 WIB Senin-Sabtu
  timezone: 'Asia/Jakarta',
  onTimeLimit: '07:00',
  cutoffTime: '07:15',
  waGatewayUrl: process.env.WA_GATEWAY_URL || 'https://api.fonnte.com/send',
  waApiToken: process.env.WA_API_TOKEN || 'YOUR_FONNTE_TOKEN',
  queueDelayMs: 1500, // 1.5 detik per pesan agar anti-banned
  schoolName: '${schoolConfig.schoolName}',
  schoolPhone: '0812-3456-7890'
};

// 1. KONEKSI KE BIOFINGER AT-101 VIA PROTOKOL ZKTECO
async function fetchLogsFromBioFinger() {
  logger.info(\`Menghubungkan ke BioFinger AT-101 (\${CONFIG.deviceIp}:\${CONFIG.devicePort})...\`);
  const ZKLib = require('zklib-js');
  const zk = new ZKLib(CONFIG.deviceIp, CONFIG.devicePort, 10000, 4000);

  try {
    await zk.createSocket();
    logger.info('✓ Socket terhubung! Mengunduh log presensi dari memori AT-101...');
    const logs = await zk.getAttendances();
    await zk.disconnect();
    return logs ? logs.data : [];
  } catch (err) {
    logger.error(\`Gagal koneksi ke AT-101: \${err.message}\`);
    throw err;
  }
}

// 2. VALIDASI & DEDUPLIKASI KEHADIRAN (480 SISWA)
function processAttendance(rawLogs, masterStudents, targetDateStr) {
  logger.info(\`Memvalidasi presensi untuk tanggal: \${targetDateStr}\`);

  // Filter log tanggal hari ini
  const todayLogs = rawLogs.filter(log => String(log.recordTime).startsWith(targetDateStr));

  // Deduplikasi: Ambil scan pertama (earliest tap)
  const earliestScans = new Map();
  todayLogs.forEach(log => {
    const pin = String(log.deviceUserId).trim();
    const timeOnly = String(log.recordTime).split(' ')[1];
    if (!earliestScans.has(pin) || timeOnly < earliestScans.get(pin)) {
      earliestScans.set(pin, timeOnly);
    }
  });

  const categorized = { hadirTepat: [], terlambat: [], tidakHadir: [] };
  const [limitH, limitM] = CONFIG.onTimeLimit.split(':').map(Number);
  const limitMinutes = limitH * 60 + limitM;

  masterStudents.forEach(student => {
    const scanTime = earliestScans.get(student.pin);

    if (!scanTime) {
      // TIDAK HADIR (Tanpa Keterangan)
      categorized.tidakHadir.push({ student, status: 'TIDAK_HADIR', scanTime: null, lateMinutes: 0 });
    } else {
      const [h, m] = scanTime.split(':').map(Number);
      const scanMinutes = h * 60 + m;

      if (scanMinutes <= limitMinutes) {
        // HADIR TEPAT WAKTU (<= 07:00 WIB)
        categorized.hadirTepat.push({ student, status: 'HADIR_TEPAT', scanTime, lateMinutes: 0 });
      } else {
        // TERLAMBAT (> 07:00 WIB)
        categorized.terlambat.push({ student, status: 'TERLAMBAT', scanTime, lateMinutes: scanMinutes - limitMinutes });
      }
    }
  });

  return categorized;
}

// 3. GENERATOR PESAN PERSONAL WHATSAPP
function formatMessage(item) {
  const { student, status, scanTime, lateMinutes } = item;
  if (status === 'HADIR_TEPAT') {
    return \`*NOTIFIKASI PRESENSI*\n*\${CONFIG.schoolName}*\n\nYth. Wali dari *\${student.name}* (\${student.class}),\nAnanda telah tiba di sekolah dengan *TEPAT WAKTU* pukul \${scanTime} WIB. Terima kasih atas kedisiplinan ananda!\`;
  } else if (status === 'TERLAMBAT') {
    return \`*PEMBERITAHUAN TERLAMBAT*\n*\${CONFIG.schoolName}*\n\nYth. Wali dari *\${student.name}* (\${student.class}),\nAnanda tiba di sekolah pukul \${scanTime} WIB (*Terlambat \${lateMinutes} Menit*). Mohon bantuan Ayah/Bunda untuk mendampingi ananda agar berangkat lebih awal.\`;
  } else {
    return \`*KONFIRMASI KETIDAKHADIRAN*\n*\${CONFIG.schoolName}*\n\nYth. Wali dari *\${student.name}* (\${student.class}),\nHingga pukul \${CONFIG.cutoffTime} WIB, ananda tercatat *BELUM TAP SIDIK JARI*. Jika ananda sakit/izin, mohon segera hubungi Guru Piket: \${CONFIG.schoolPhone}.\`;
  }
}

// 4. RATE-LIMITED QUEUE WORKER
async function dispatchQueue(items) {
  logger.info(\`Memulai pengiriman \${items.length} pesan dengan jeda \${CONFIG.queueDelayMs}ms...\`);
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const msg = formatMessage(item);
    try {
      await axios.post(CONFIG.waGatewayUrl, {
        target: item.student.parentPhone,
        message: msg
      }, {
        headers: { Authorization: CONFIG.waApiToken },
        timeout: 8000
      });
      logger.info(\`[\${i+1}/\${items.length}] Sukses kirim ke \${item.student.name} (\${item.student.parentPhone})\`);
    } catch (e) {
      logger.error(\`Gagal kirim ke \${item.student.name}: \${e.message}\`);
    }
    // Rate limit delay
    await new Promise(r => setTimeout(r, CONFIG.queueDelayMs));
  }
}

// 5. ORCHESTRATOR UTAMA CUT-OFF 07:15 WIB
async function runCutoffPipeline() {
  logger.info('🚀 MEMULAI PIPELINE CUT-OFF 07:15 WIB...');
  const masterStudents = JSON.parse(fs.readFileSync('students_master.json', 'utf8'));
  const rawLogs = await fetchLogsFromBioFinger();
  const todayStr = new Date().toISOString().split('T')[0];
  const { hadirTepat, terlambat, tidakHadir } = processAttendance(rawLogs, masterStudents, todayStr);

  // Utamakan kirim notifikasi Alpa dan Terlambat terlebih dahulu
  const queue = [...tidakHadir, ...terlambat, ...hadirTepat];
  await dispatchQueue(queue);
  logger.info('🎉 Pipeline harian selesai 100%!');
}

// 6. PENJADWAL OTOMATIS (CRON JOB)
cron.schedule(CONFIG.cronSchedule, () => {
  logger.info('⏰ Pukul 07:15 WIB tercapai! Eksekusi otomatis...');
  runCutoffPipeline();
}, { timezone: CONFIG.timezone });

logger.info(\`Service BioFinger AT-101 aktif. Menunggu jadwal \${CONFIG.cronSchedule} WIB...\`);
`;

  const pythonCode = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BIOFINGER AT-101 PYTHON BACKEND SERVICE & DAEMON
Membaca Log Presensi BioFinger AT-101 (ZKTeco Protocol Port 4370)
Menjadwalkan Penarikan Otomatis Setiap 07:15 WIB Tanpa Klik Manual
"""

import time
import json
import logging
from datetime import datetime
import schedule
import requests
from zk import ZK

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("BioFingerDaemon")

DEVICE_IP = "${schoolConfig.deviceIp}"
DEVICE_PORT = ${schoolConfig.devicePort}
ON_TIME_LIMIT = "07:00"
CUTOFF_TIME = "07:15"
WA_GATEWAY_URL = "https://api.fonnte.com/send"
WA_API_TOKEN = "YOUR_FONNTE_TOKEN"
QUEUE_DELAY_SEC = 1.5

def fetch_logs():
    logger.info(f"Menghubungkan ke BioFinger AT-101 ({DEVICE_IP}:{DEVICE_PORT})...")
    zk = ZK(DEVICE_IP, port=DEVICE_PORT, timeout=10, password=0)
    conn = zk.connect()
    attendances = conn.get_attendance()
    conn.disconnect()
    return [{"pin": str(a.user_id), "time": a.timestamp.strftime("%Y-%m-%d %H:%M:%S")} for a in attendances]

def process_logic(logs, students, today):
    today_logs = [l for l in logs if l["time"].startswith(today)]
    earliest = {}
    for l in today_logs:
        pin = l["pin"]
        time_part = l["time"].split(" ")[1]
        if pin not in earliest or time_part < earliest[pin]:
            earliest[pin] = time_part

    hadir, terlambat, alpa = [], [], []
    limit_m = 7 * 60

    for st in students:
        pin = st["pin"]
        if pin not in earliest:
            alpa.append({"student": st, "status": "TIDAK_HADIR", "time": None, "late": 0})
        else:
            t = earliest[pin]
            h, m, _ = map(int, t.split(":"))
            cur_m = h * 60 + m
            if cur_m <= limit_m:
                hadir.append({"student": st, "status": "HADIR_TEPAT", "time": t, "late": 0})
            else:
                hadir.append({"student": st, "status": "TERLAMBAT", "time": t, "late": cur_m - limit_m})
    return hadir, terlambat, alpa

def send_wa(queue):
    for idx, item in enumerate(queue):
        st = item["student"]
        phone = st["parentPhone"]
        msg = f"*NOTIFIKASI PRESENSI {st['name']}*: Status {item['status']}"
        try:
            requests.post(WA_GATEWAY_URL, json={"target": phone, "message": msg}, headers={"Authorization": WA_API_TOKEN})
            logger.info(f"[{idx+1}/{len(queue)}] Terkirim ke {st['name']}")
        except Exception as e:
            logger.error(f"Gagal: {e}")
        time.sleep(QUEUE_DELAY_SEC)

def run_job():
    logger.info("⏰ Memulai Pipeline Otomatis 07:15 WIB...")
    with open("students_master.json") as f:
        students = json.load(f)
    logs = fetch_logs()
    today = datetime.now().strftime("%Y-%m-%d")
    h, t, a = process_logic(logs, students, today)
    send_wa(a + t + h)
    logger.info("✓ Selesai diproses.")

# Jadwalkan Setiap Hari Sekolah Jam 07:15 WIB
schedule.every().monday.at("07:15").do(run_job)
schedule.every().tuesday.at("07:15").do(run_job)
schedule.every().wednesday.at("07:15").do(run_job)
schedule.every().thursday.at("07:15").do(run_job)
schedule.every().friday.at("07:15").do(run_job)
schedule.every().saturday.at("07:15").do(run_job)

logger.info("Daemon Python BioFinger AT-101 aktif. Menunggu jadwal 07:15 WIB...")
while True:
    schedule.run_pending()
    time.sleep(5)
`;

  const systemdCode = `[Unit]
Description=BioFinger AT-101 Attendance & WhatsApp Daemon
After=network.target network-online.target
Wants=network-online.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/biofinger-daemon
ExecStart=/usr/bin/node /opt/biofinger-daemon/index.js
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=biofinger-daemon
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
`;

  const windowsCode = `@echo off
title BIOFINGER AT-101 AUTO ATTENDANCE SERVICE
color 0A
echo ==============================================================================
echo MENJALANKAN SERVICE PRESENSI OTOMATIS BIOFINGER AT-101 (PORT 4370)
echo ==============================================================================
cd /d "%~dp0"

if not exist node_modules (
    echo [INFO] Menginstal dependensi pertama kali...
    call npm install
)

echo [INFO] Service aktif di background.
node index.js
pause
`;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-indigo-500/20">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-950">
              <Cpu className="w-8 h-8 text-indigo-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-indigo-400/20 text-indigo-300 border border-indigo-400/30">
                  Backend Daemon & IoT Specialist
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  100% Otomatis Tanpa Manusia
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
                Background Service BioFinger AT-101 & WhatsApp Queue
              </h2>
              <p className="text-xs sm:text-sm text-indigo-100/80 mt-1 max-w-3xl">
                Menarik data log presensi dari BioFinger AT-101 via TCP socket port 4370 tepat pukul <strong>07:15 WIB</strong>, melakukan deduplikasi scan, mengklasifikasi 480 siswa, dan menembakkan pesan WhatsApp ke orang tua dengan proteksi <em>rate-limiting</em>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch lg:self-auto justify-end">
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className="px-5 py-2.5 rounded-2xl bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Menjalankan Simulasi...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Uji Simulasi Cut-off 07:15 WIB</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Simulation Dashboard */}
      {(isSimulating || simLogs.length > 0) && (
        <div className="bg-slate-950 text-white rounded-3xl p-6 shadow-2xl border border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <h4 className="text-sm font-bold tracking-wide uppercase text-slate-200">
                Live Console Monitor: Daemon Cut-off 07:15 WIB
              </h4>
            </div>
            {isSimulating && (
              <span className="text-xs text-amber-300 font-mono flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Tahap {simulationStep}/6: Sedang Diproses
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {queueProgress && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Pengiriman WhatsApp Queue (Jeda 1.5s/nomor)</span>
                <span className="text-emerald-400 font-bold">
                  {queueProgress.current} / {queueProgress.total} Orang Tua
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${(queueProgress.current / queueProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Stats Badges */}
          {simStats && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400">Hadir Tepat (06:00-07:00)</span>
                  <p className="text-xl font-black text-white">{simStats.hadir} Siswa</p>
                </div>
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>

              <div className="p-3 bg-amber-950/60 border border-amber-500/40 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400">Terlambat (&gt; 07:00)</span>
                  <p className="text-xl font-black text-white">{simStats.terlambat} Siswa</p>
                </div>
                <Clock className="w-7 h-7 text-amber-400" />
              </div>

              <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-400">Tidak Hadir (Alpa)</span>
                  <p className="text-xl font-black text-white">{simStats.tidakHadir} Siswa</p>
                </div>
                <AlertCircle className="w-7 h-7 text-rose-400" />
              </div>
            </div>
          )}

          {/* Terminal Output */}
          <div className="p-4 rounded-2xl bg-black/80 font-mono text-xs text-emerald-300 space-y-1.5 max-h-56 overflow-y-auto leading-relaxed border border-slate-800">
            {simLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-slate-600 select-none">&gt;</span>
                <span>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3-Step Human-Independent Pipeline Architecture */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Arsitektur Kerja Sistem 100% Otomatis Tanpa Manusia
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Komputer sekolah atau server mini-PC mengeksekusi siklus ini secara otomatis setiap pagi hari sekolah.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
              01
            </div>
            <h5 className="font-bold text-xs text-slate-900">Cron Job 07:15 WIB</h5>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Tepat pada jam cut-off masuk, scheduler latar belakang memicu skrip penarik data tanpa memerlukan tombol atau operator.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">
              02
            </div>
            <h5 className="font-bold text-xs text-slate-900">Tarik Log via Socket TCP 4370</h5>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Skrip menghubungi IP lokal BioFinger AT-101 (192.168.1.201) dan menyedot seluruh event presensi sidik jari hari ini.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-black text-xs">
              03
            </div>
            <h5 className="font-bold text-xs text-slate-900">Deduplikasi & Validasi 480 Siswa</h5>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Jika siswa tap berkali-kali, hanya scan terawal yang diambil. Siswa yang tidak ada log scan langsung ditetapkan <strong>TIDAK HADIR</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
              04
            </div>
            <h5 className="font-bold text-xs text-slate-900">Rate-Limited WhatsApp Queue</h5>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Mengirim pesan personal ke orang tua satu per satu dengan jeda 1.5 detik per pesan agar nomor WA tidak terblokir spam oleh Meta.
            </p>
          </div>
        </div>
      </div>

      {/* Code Repository & Downloader */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Kode Sumber Mandiri (Standalone Source Code)
            </h3>
            <p className="text-xs text-slate-500">
              Pilih bahasa pemrograman yang ingin Anda gunakan pada komputer sekolah.
            </p>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setSelectedLanguage('nodejs')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedLanguage === 'nodejs'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Node.js Daemon
            </button>

            <button
              onClick={() => setSelectedLanguage('python')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedLanguage === 'python'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Python (pyzk)
            </button>

            <button
              onClick={() => setSelectedLanguage('systemd')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedLanguage === 'systemd'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Linux Systemd
            </button>

            <button
              onClick={() => setSelectedLanguage('windows')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedLanguage === 'windows'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Windows Startup
            </button>
          </div>
        </div>

        {/* Action Buttons for Current Code */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            {selectedLanguage === 'nodejs' && 'backend-daemon/index.js'}
            {selectedLanguage === 'python' && 'backend-daemon/biofinger_daemon.py'}
            {selectedLanguage === 'systemd' && 'backend-daemon/biofinger.service'}
            {selectedLanguage === 'windows' && 'backend-daemon/start_windows.bat'}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const code = selectedLanguage === 'nodejs' ? nodeJsCode : selectedLanguage === 'python' ? pythonCode : selectedLanguage === 'systemd' ? systemdCode : windowsCode;
                handleCopyCode(code, selectedLanguage);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              {copiedKey === selectedLanguage ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin Kode</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                const code = selectedLanguage === 'nodejs' ? nodeJsCode : selectedLanguage === 'python' ? pythonCode : selectedLanguage === 'systemd' ? systemdCode : windowsCode;
                const fname = selectedLanguage === 'nodejs' ? 'index.js' : selectedLanguage === 'python' ? 'biofinger_daemon.py' : selectedLanguage === 'systemd' ? 'biofinger.service' : 'start_windows.bat';
                handleDownloadFile(fname, code);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download File</span>
            </button>
          </div>
        </div>

        {/* Code Box */}
        <div className="relative rounded-2xl bg-slate-950 p-4 border border-slate-800">
          <pre className="font-mono text-[11px] text-indigo-200/90 overflow-x-auto max-h-96 leading-relaxed">
            {selectedLanguage === 'nodejs' && nodeJsCode}
            {selectedLanguage === 'python' && pythonCode}
            {selectedLanguage === 'systemd' && systemdCode}
            {selectedLanguage === 'windows' && windowsCode}
          </pre>
        </div>
      </div>

      {/* Production Deployment Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-indigo-700">
            <Server className="w-5 h-5" />
            <h4 className="font-bold text-sm">Panduan Instalasi di Linux (Ubuntu / Raspberry Pi)</h4>
          </div>
          <ol className="space-y-2 text-xs text-slate-600 list-decimal list-inside leading-relaxed font-mono">
            <li>sudo mkdir -p /opt/biofinger-daemon</li>
            <li>Salin file index.js, package.json, dan .env ke folder tersebut</li>
            <li>cd /opt/biofinger-daemon && npm install</li>
            <li>sudo cp biofinger.service /etc/systemd/system/</li>
            <li>sudo systemctl enable biofinger.service</li>
            <li>sudo systemctl start biofinger.service</li>
          </ol>
          <p className="text-[11px] text-slate-400 pt-1">
            Daemon akan otomatis menyala setiap kali komputer sekolah dihidupkan (boot on startup).
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center gap-2 text-indigo-700">
            <Terminal className="w-5 h-5" />
            <h4 className="font-bold text-sm">Panduan Instalasi di Komputer Windows Sekolah</h4>
          </div>
          <ol className="space-y-2 text-xs text-slate-600 list-decimal list-inside leading-relaxed font-mono">
            <li>Pastikan Node.js LTS terinstal di Windows</li>
            <li>Ekstrak folder backend-daemon ke C:\biofinger-daemon</li>
            <li>Buka folder, klik 2x start_windows.bat</li>
            <li>Agar otomatis start saat PC nyala: Tekan Win+R &rarr; ketik shell:startup</li>
            <li>Buat Shortcut dari start_windows.bat ke dalam folder Startup tersebut</li>
          </ol>
          <p className="text-[11px] text-slate-400 pt-1">
            Atau gunakan PM2 dengan perintah: <code className="text-indigo-600">npm install -g pm2 pm2-windows-service</code>.
          </p>
        </div>
      </div>

    </div>
  );
};
