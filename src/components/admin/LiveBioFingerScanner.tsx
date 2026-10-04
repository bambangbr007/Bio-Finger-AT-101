import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { 
  Fingerprint, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Send, 
  Smartphone, 
  RotateCcw,
  Zap,
  Clock
} from 'lucide-react';
import { generateDirectWhatsAppUrl } from '../../utils/whatsappHelper';

export const LiveBioFingerScanner: React.FC = () => {
  const { 
    students, 
    processBioFingerScan, 
    schoolConfig,
    setSelectedParentStudentId,
    setCurrentRole
  } = useAttendance();

  const [inputPin, setInputPin] = useState<string>('1001');
  const [scanMode, setScanMode] = useState<0 | 1 | 'AUTO'>('AUTO');
  const [customTime, setCustomTime] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [scanning, setScanning] = useState<boolean>(false);
  const [lcdMessage, setLcdMessage] = useState<{
    status: 'IDLE' | 'SUCCESS' | 'ERROR';
    line1: string;
    line2: string;
    studentName?: string;
    studentClass?: string;
    parentPhone?: string;
    timestamp?: string;
    isLate?: boolean;
    studentId?: string;
  }>({
    status: 'IDLE',
    line1: 'BIO Finger AT-101 Standby',
    line2: 'Silakan Tempelkan Jari Anda...'
  });

  // Sound chime using Web Audio API (realistic biometric beep)
  const playBeep = (type: 'SUCCESS' | 'ERROR') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'SUCCESS') {
        // High double beep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.08); // D6
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        // Low error buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      // Audio might be blocked if user hasn't interacted yet
    }
  };

  const handleScan = (pinToScan?: string, timeOverride?: string) => {
    const targetPin = (pinToScan || inputPin).trim();
    if (!targetPin) return;

    setScanning(true);
    setLcdMessage({
      status: 'IDLE',
      line1: 'Memverifikasi Sidik Jari...',
      line2: `Pencocokan Pola Minutiae PIN: ${targetPin}`
    });

    setTimeout(() => {
      const modeParam = scanMode === 'AUTO' ? undefined : scanMode;
      const result = processBioFingerScan(targetPin, modeParam, timeOverride || (customTime || undefined), 'FINGERPRINT');

      setScanning(false);

      if (result.success && result.record) {
        playBeep('SUCCESS');
        const matched = students.find(s => s.id === result.record?.studentId);
        const isLate = result.record.status === 'TERLAMBAT';

        setLcdMessage({
          status: 'SUCCESS',
          line1: `✓ TERVERIFIKASI: ${matched?.name || 'Siswa'}`,
          line2: `${result.record.checkOutTime ? 'PULANG' : 'MASUK'}: ${result.record.checkInTime || result.record.checkOutTime} WIB (${isLate ? 'TERLAMBAT' : 'TEPAT WAKTU'})`,
          studentName: matched?.name,
          studentClass: matched?.class,
          parentPhone: matched?.parentPhone,
          timestamp: result.record.checkInTime || result.record.checkOutTime,
          isLate: isLate,
          studentId: matched?.id
        });
      } else {
        playBeep('ERROR');
        setLcdMessage({
          status: 'ERROR',
          line1: '✕ GAGAL VERIFIKASI',
          line2: result.message || 'Sidik Jari / PIN Tidak Dikenali'
        });
      }
    }, 400); // 400ms ultra-fast verification
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <Fingerprint className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base">Terminal Virtual BIO Finger AT-101</h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                LAN / Cloud Aktif
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Simulasi sensor optik 500 DPI & pengiriman instan notifikasi WhatsApp
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-colors"
            title="Buzzer Suara Mesin"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
            <span>Buzzer {soundEnabled ? 'Aktif' : 'Mati'}</span>
          </button>
        </div>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Physical BIO Finger AT-101 Chassis Simulation */}
        <div className="lg:col-span-6 bg-slate-900 rounded-3xl p-5 border-4 border-slate-800 shadow-2xl relative">
          
          {/* Machine Header Logo */}
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
              <span className="font-black text-xs tracking-wider text-slate-200 uppercase font-mono">
                BIO Finger <span className="text-blue-400">AT-101</span>
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">STANDALONE TIME ATTENDANCE</span>
          </div>

          {/* LCD Screen (Retro Matrix / Green Backlight Display) */}
          <div className="bg-emerald-950/70 border-2 border-emerald-700/60 rounded-xl p-3.5 font-mono text-xs shadow-inner mb-5 relative overflow-hidden">
            <div className="flex justify-between text-[10px] text-emerald-400/80 border-b border-emerald-800/40 pb-1 mb-2">
              <span>IP: {schoolConfig.deviceIp}</span>
              <span>{new Date().toLocaleTimeString('id-ID')}</span>
            </div>
            <div className="space-y-1">
              <p className={`font-bold text-sm tracking-wide ${
                lcdMessage.status === 'SUCCESS' ? 'text-emerald-300' :
                lcdMessage.status === 'ERROR' ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {lcdMessage.line1}
              </p>
              <p className="text-xs text-emerald-400/90 truncate">
                {lcdMessage.line2}
              </p>
            </div>
          </div>

          {/* Scanner Optical Prism Pad & Status LEDs */}
          <div className="grid grid-cols-2 gap-4 items-center">
            
            {/* The Glowing Biometric Optical Prism Sensor */}
            <div className="flex flex-col items-center">
              <button
                onClick={() => handleScan()}
                disabled={scanning}
                className={`w-28 h-36 rounded-2xl border-4 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer shadow-lg relative group ${
                  scanning 
                    ? 'bg-blue-600/40 border-blue-400 shadow-blue-500/50 scale-95' 
                    : 'bg-slate-800/90 border-slate-700 hover:border-blue-500 hover:shadow-blue-500/20 active:scale-95'
                }`}
              >
                {/* Scanner laser light animation */}
                <div className="w-16 h-20 rounded-xl bg-gradient-to-b from-blue-900/60 to-cyan-950/80 border border-cyan-500/30 flex items-center justify-center relative overflow-hidden">
                  <Fingerprint className={`w-12 h-12 transition-all ${
                    scanning ? 'text-cyan-300 scale-110 animate-pulse' : 'text-cyan-400/70 group-hover:text-cyan-300'
                  }`} />
                  <div className={`absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_8px_#22d3ee] transition-all ${
                    scanning ? 'top-1/2 animate-bounce' : 'top-1 group-hover:top-1/2'
                  }`}></div>
                </div>

                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                  {scanning ? 'Memindai...' : 'Tempel Jari'}
                </span>
              </button>
              <span className="text-[10px] text-slate-400 mt-2">Sensor Sidik Jari Optik</span>
            </div>

            {/* Keypad simulation */}
            <div className="space-y-2">
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Input PIN Siswa:</div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={inputPin}
                  onChange={(e) => setInputPin(e.target.value)}
                  placeholder="PIN: 1001"
                  className="w-full bg-slate-800 text-white font-mono text-sm px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Mode switch */}
              <div className="pt-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Mode Presensi:</label>
                <div className="grid grid-cols-3 gap-1 text-[11px] font-semibold">
                  <button
                    type="button"
                    onClick={() => setScanMode('AUTO')}
                    className={`py-1.5 rounded-lg transition-all ${
                      scanMode === 'AUTO' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Auto
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanMode(0)}
                    className={`py-1.5 rounded-lg transition-all ${
                      scanMode === 0 ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Masuk
                  </button>
                  <button
                    type="button"
                    onClick={() => setScanMode(1)}
                    className={`py-1.5 rounded-lg transition-all ${
                      scanMode === 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Pulang
                  </button>
                </div>
              </div>

              {/* Action Scan Button */}
              <button
                type="button"
                onClick={() => handleScan()}
                disabled={scanning}
                className="w-full mt-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-blue-500/30 flex items-center justify-center gap-1.5 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Pindai & Proses Otomatis</span>
              </button>
            </div>

          </div>

        </div>

        {/* Right Side: Instant Validation Pipeline & WhatsApp Dispatch Result */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          
          {/* Quick Presets for Instant Testing */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Simulasi Cepat (Pilih Skenario Presensi)</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => {
                  setInputPin('1001');
                  handleScan('1001', '06:45:10');
                }}
                className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900">Siswa 1 (Tepat Waktu)</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-emerald-200 text-emerald-800 rounded font-mono">06:45</span>
                </div>
                <p className="text-[11px] text-emerald-700 mt-0.5 truncate">
                  PIN 1001: {students[0]?.name || 'Ahmad Fauzi'}
                </p>
              </button>

              <button
                onClick={() => {
                  setInputPin('1002');
                  handleScan('1002', '07:32:00');
                }}
                className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">Siswa 2 (Terlambat)</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded font-mono">07:32</span>
                </div>
                <p className="text-[11px] text-amber-700 mt-0.5 truncate">
                  PIN 1002: {students[1]?.name || 'Siti Nurhaliza'} (Late 17m)
                </p>
              </button>

              <button
                onClick={() => {
                  setInputPin('1003');
                  handleScan('1003', '14:35:10');
                }}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/70 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900">Siswa 3 (Pulang Normal)</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-200 text-blue-800 rounded font-mono">14:35</span>
                </div>
                <p className="text-[11px] text-blue-700 mt-0.5 truncate">
                  PIN 1003: {students[2]?.name || 'Rizky Pratama'}
                </p>
              </button>

              <button
                onClick={() => {
                  setInputPin('9999');
                  handleScan('9999');
                }}
                className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100/70 text-left transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-900">PIN Tidak Dikenal</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-rose-200 text-rose-800 rounded font-mono">9999</span>
                </div>
                <p className="text-[11px] text-rose-700 mt-0.5">
                  Tes Validasi Penolakan & Error
                </p>
              </button>
            </div>
          </div>

          {/* Validation & WhatsApp Dispatch Result Box */}
          {lcdMessage.status === 'SUCCESS' ? (
            <div className="bg-emerald-50/90 border border-emerald-300 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    Presensi Tervalidasi & Notifikasi Terkirim
                  </span>
                </div>
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                  {lcdMessage.timestamp} WIB
                </span>
              </div>

              <div className="bg-white rounded-xl p-3 border border-emerald-200 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Nama Siswa:</span>
                  <span className="font-bold text-slate-900">{lcdMessage.studentName} ({lcdMessage.studentClass})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status Kedatangan:</span>
                  <span className={`font-bold ${lcdMessage.isLate ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {lcdMessage.isLate ? 'Terlambat Masuk' : 'Tepat Waktu'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tujuan WhatsApp:</span>
                  <span className="font-semibold text-emerald-800">+{lcdMessage.parentPhone} (Wali Murid)</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {lcdMessage.studentId && (
                  <button
                    onClick={() => {
                      setSelectedParentStudentId(lcdMessage.studentId!);
                      setCurrentRole('PARENT');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Lihat di HP Orang Tua</span>
                  </button>
                )}

                {lcdMessage.parentPhone && (
                  <a
                    href={generateDirectWhatsAppUrl(
                      lcdMessage.parentPhone,
                      `[BIO Finger AT-101] Presensi ${lcdMessage.studentName} (${lcdMessage.studentClass}) telah tercatat pada pukul ${lcdMessage.timestamp} WIB.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Tes Kirim WA</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center text-xs text-slate-500 flex flex-col items-center justify-center space-y-2">
              <Clock className="w-8 h-8 text-slate-300" />
              <p className="font-semibold text-slate-700">Menunggu Pemindaian dari Mesin AT-101</p>
              <p className="text-[11px] max-w-xs text-slate-400">
                Tekan tombol "Pindai & Proses Otomatis" atau pilih skenario di atas untuk melihat proses validasi kehadiran dan pengiriman WhatsApp seketika.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
