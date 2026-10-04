import React, { useState, useEffect } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { 
  Tv, 
  Maximize2, 
  Minimize2, 
  Clock, 
  Fingerprint, 
  CheckCircle2, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  X, 
  User, 
  Sparkles,
  Wifi,
  Send,
  Zap,
  RotateCcw
} from 'lucide-react';

interface LobbyKioskDisplayProps {
  onClose: () => void;
}

export const LobbyKioskDisplay: React.FC<LobbyKioskDisplayProps> = ({ onClose }) => {
  const { students, recentScans, attendanceRecords, activeDate, processBioFingerScan, schoolConfig } = useAttendance();
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Update clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');
      setCurrentDate(new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Web Audio Beep & Speech Synthesis
  const triggerAudioAndVoice = (name: string, status: string) => {
    if (soundEnabled) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        }
      } catch (_) {}
    }

    if (voiceEnabled && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const text = status === 'TERLAMBAT'
          ? `Terima kasih ${name}, tercatat terlambat.`
          : `Terima kasih ${name}, hadir tepat waktu. Selamat belajar!`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      } catch (_) {}
    }
  };

  const handleSimulateTap = (pin: string, isLate = false) => {
    const timeOverride = isLate ? '07:08:24' : '06:42:10';
    const result = processBioFingerScan(pin, 0, timeOverride, 'FINGERPRINT');
    if (result.record) {
      const student = students.find(s => s.id === result.record?.studentId);
      if (student) {
        triggerAudioAndVoice(student.name, result.record.status);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  // Last scanned student
  const latestScan = recentScans[0];
  const latestStudent = latestScan ? students.find(s => s.pin === latestScan.pin) : null;
  const latestRecord = latestStudent ? attendanceRecords.find(r => r.studentId === latestStudent.id && r.date === activeDate) : null;

  // Real-time metrics
  const totalStudents = students.length || 480;
  const presentScans = attendanceRecords.filter(r => r.date === activeDate && r.status === 'HADIR_TEPAT');
  const lateScans = attendanceRecords.filter(r => r.date === activeDate && r.status === 'TERLAMBAT');
  const uniquePresentCount = new Set(attendanceRecords.filter(r => r.date === activeDate && r.checkInTime).map(r => r.studentId)).size;
  const absentCount = Math.max(0, totalStudents - uniquePresentCount);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-hidden select-none font-sans">
      
      {/* Kiosk Top Bar */}
      <header className="bg-slate-900/90 border-b border-slate-800 px-6 py-4 flex items-center justify-between backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Fingerprint className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Lobby Kiosk Display
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                BioFinger AT-101 Online
              </span>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">
              {schoolConfig.schoolName}
            </h1>
          </div>
        </div>

        {/* Big Live Clock */}
        <div className="text-right">
          <p className="text-2xl sm:text-3xl font-black text-amber-300 font-mono tracking-tight">
            {currentTime}
          </p>
          <p className="text-xs text-slate-400 font-medium">
            {currentDate}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
              voiceEnabled 
                ? 'bg-indigo-600/30 border-indigo-500 text-indigo-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="Suara Sambutan Siswa (Speech)"
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">Suara</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all"
            title="Layar Penuh (Fullscreen)"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white transition-all"
            title="Keluar dari Kiosk"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
        
        {/* Left 2 Columns: Centerpiece Highlight of Latest Scan */}
        <div className="lg:col-span-2 flex flex-col justify-between space-y-6 overflow-y-auto">
          
          {/* Top Quick Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Terdaftar</span>
              <p className="text-2xl font-black text-white mt-1">{totalStudents} <span className="text-xs text-slate-500 font-normal">Siswa</span></p>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
              <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Hadir Tepat</span>
              <p className="text-2xl font-black text-emerald-300 mt-1">{presentScans.length} <span className="text-xs text-emerald-500 font-normal">Siswa</span></p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30">
              <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Terlambat</span>
              <p className="text-2xl font-black text-amber-300 mt-1">{lateScans.length} <span className="text-xs text-amber-500 font-normal">Siswa</span></p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30">
              <span className="text-[10px] uppercase font-bold text-rose-400 tracking-wider">Belum Tap (Cut-off)</span>
              <p className="text-2xl font-black text-rose-300 mt-1">{absentCount} <span className="text-xs text-rose-500 font-normal">Siswa</span></p>
            </div>
          </div>

          {/* Large Hero Card: Latest Student Who Scanned */}
          <div className="flex-1 bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-2xl flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {latestStudent && latestScan ? (
              <div className="space-y-4 max-w-lg z-10 animate-fade-in">
                {/* Large Avatar */}
                <div className="relative inline-block">
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 p-1 shadow-2xl shadow-indigo-500/40 mx-auto">
                    <img 
                      src={latestStudent.avatarUrl} 
                      alt={latestStudent.name}
                      className="w-full h-full object-cover rounded-full bg-slate-800"
                    />
                  </div>
                  <div className={`absolute bottom-1 right-1 p-2 rounded-full shadow-lg ${
                    latestRecord?.status === 'HADIR_TEPAT' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-950'
                  }`}>
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>

                {/* Name & Class */}
                <div>
                  <span className="text-xs font-mono text-indigo-300 tracking-wider">
                    PIN: {latestStudent.pin} • NISN: {latestStudent.nisn}
                  </span>
                  <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1">
                    {latestStudent.name}
                  </h2>
                  <p className="text-base sm:text-lg font-bold text-indigo-200 mt-0.5">
                    {latestStudent.class}
                  </p>
                </div>

                {/* Status Pill */}
                <div className="flex items-center justify-center gap-3">
                  <span className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center gap-2 shadow-lg ${
                    latestRecord?.status === 'HADIR_TEPAT'
                      ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                      : 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                  }`}>
                    <Clock className="w-4 h-4" />
                    <span>{latestRecord?.status === 'HADIR_TEPAT' ? 'Hadir Tepat Waktu' : `Terlambat (${latestRecord?.lateMinutes || 8} Menit)`}</span>
                  </span>

                  <span className="px-4 py-2 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 font-mono text-xs sm:text-sm font-bold">
                    {latestRecord?.checkInTime || latestScan.timestamp.split(' ')[1] || '06:45:00'} WIB
                  </span>
                </div>

                {/* WhatsApp Status Badge */}
                <div className="pt-2 flex items-center justify-center gap-2 text-xs text-emerald-400">
                  <Send className="w-4 h-4 text-emerald-400 animate-bounce" />
                  <span>Notifikasi WhatsApp terkirim otomatis ke Wali Murid ({latestStudent.parentPhone})</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-md z-10 text-slate-400">
                <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mx-auto border border-slate-700">
                  <Fingerprint className="w-12 h-12 text-slate-500 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white">Menunggu Siswa Melakukan Tap Sidik Jari...</h3>
                <p className="text-xs text-slate-400">
                  Silakan tempelkan jari pada sensor BioFinger AT-101 di gerbang/lobby sekolah.
                </p>
              </div>
            )}
          </div>

          {/* Quick Simulation Bar for Consumers */}
          <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="font-bold">Uji Coba Cepat Scan Biometrik:</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleSimulateTap('1001', false)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow flex items-center gap-1.5"
              >
                <span>Tap Hadir Tepat (Ahmad)</span>
              </button>

              <button
                onClick={() => handleSimulateTap('1002', true)}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all shadow flex items-center gap-1.5"
              >
                <span>Tap Terlambat (Budi)</span>
              </button>

              <button
                onClick={() => handleSimulateTap('1003', false)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow flex items-center gap-1.5"
              >
                <span>Tap Hadir Tepat (Dimas)</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right 1 Column: Live Stream Ticker of Latest 10 Students */}
        <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white tracking-wide">
                Arus Masuk Presensi (Live Feed)
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500">
              {recentScans.length} Scan Hari Ini
            </span>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {recentScans.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Clock className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-xs">Belum ada aktivitas presensi masuk hari ini.</p>
              </div>
            ) : (
              recentScans.slice(0, 15).map((scan, idx) => {
                const st = students.find(s => s.pin === scan.pin);
                const rec = st ? attendanceRecords.find(r => r.studentId === st.id && r.date === activeDate) : null;
                const isLate = rec?.status === 'TERLAMBAT';
                const timeStr = scan.timestamp.split(' ')[1] || scan.timestamp;

                return (
                  <div 
                    key={scan.id || idx}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      idx === 0 
                        ? 'bg-indigo-950/70 border-indigo-500/50 shadow-md' 
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                        {st?.avatarUrl ? (
                          <img src={st.avatarUrl} alt={st.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-500">
                            <User className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">
                          {st ? st.name : `Siswa PIN ${scan.pin}`}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {st?.class || 'Kelas -'} • <span className="font-mono">{timeStr} WIB</span>
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isLate 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {isLate ? 'Terlambat' : 'Tepat Waktu'}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
