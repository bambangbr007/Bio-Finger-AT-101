import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { Student, Teacher } from '../../types';
import { 
  Fingerprint, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RotateCcw, 
  Search, 
  Cpu, 
  Volume2, 
  VolumeX, 
  Layers, 
  Check, 
  ArrowRight,
  ShieldCheck,
  User,
  Clock,
  Radio
} from 'lucide-react';

interface FingerprintEnrollmentManagerProps {
  preselectedPerson?: { id: string; type: 'STUDENT' | 'TEACHER' } | null;
}

export const FingerprintEnrollmentManager: React.FC<FingerprintEnrollmentManagerProps> = ({
  preselectedPerson
}) => {
  const { students, teachers, enrollFingerprint, enrollmentLogs, schoolConfig } = useAttendance();

  const [personType, setPersonType] = useState<'STUDENT' | 'TEACHER'>(
    preselectedPerson?.type || 'STUDENT'
  );
  const [selectedPersonId, setSelectedPersonId] = useState<string>(
    preselectedPerson?.id || students.find(s => !s.fingerprintRegistered)?.id || students[0]?.id || 'STU-001'
  );
  const [fingerIndex, setFingerIndex] = useState<'TELUNJUK_KANAN' | 'JEMPOL_KANAN' | 'TELUNJUK_KIRI' | 'JEMPOL_KIRI'>('TELUNJUK_KANAN');
  const [searchPerson, setSearchPerson] = useState<string>('');
  const [filterUnregisteredOnly, setFilterUnregisteredOnly] = useState<boolean>(false);

  // 3-Step Enrollment Wizard State (0: Not started, 1: Tap 1/3, 2: Tap 2/3, 3: Completed)
  const [enrollStep, setEnrollStep] = useState<0 | 1 | 2 | 3>(0);
  const [scanning, setScanning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [enrollSuccessMessage, setEnrollSuccessMessage] = useState<string | null>(null);

  // Audio chime feedback
  const playBeep = (freq: number, duration: number) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  };

  const selectedStudent = students.find(s => s.id === selectedPersonId);
  const selectedTeacher = teachers.find(t => t.id === selectedPersonId);
  const selectedName = personType === 'STUDENT' ? selectedStudent?.name : selectedTeacher?.name;
  const selectedPin = personType === 'STUDENT' ? selectedStudent?.pin : selectedTeacher?.pin;
  const isAlreadyRegistered = personType === 'STUDENT' 
    ? selectedStudent?.fingerprintRegistered 
    : selectedTeacher?.fingerprintRegistered;

  // Filter candidates
  const candidateList = personType === 'STUDENT'
    ? students.filter(s => {
        if (filterUnregisteredOnly && s.fingerprintRegistered) return false;
        if (!searchPerson.trim()) return true;
        const q = searchPerson.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.pin.includes(q) || s.class.toLowerCase().includes(q);
      })
    : teachers.filter(t => {
        if (filterUnregisteredOnly && t.fingerprintRegistered) return false;
        if (!searchPerson.trim()) return true;
        const q = searchPerson.toLowerCase();
        return t.name.toLowerCase().includes(q) || t.pin.includes(q) || t.roleTitle.toLowerCase().includes(q);
      });

  // Handle sensor tap during enrollment
  const handleSensorTap = () => {
    if (scanning || enrollStep === 3) return;

    setScanning(true);

    if (enrollStep === 0) {
      // First tap (1 of 3)
      playBeep(880, 0.15); // A5
      setTimeout(() => {
        setEnrollStep(1);
        setScanning(false);
      }, 500);
    } else if (enrollStep === 1) {
      // Second tap (2 of 3)
      playBeep(987, 0.15); // B5
      setTimeout(() => {
        setEnrollStep(2);
        setScanning(false);
      }, 500);
    } else if (enrollStep === 2) {
      // Final tap (3 of 3)
      playBeep(1174, 0.25); // D6
      setTimeout(() => {
        const qualityScore = Math.floor(95 + Math.random() * 5); // 95 - 99%
        const res = enrollFingerprint(selectedPersonId, personType, fingerIndex, qualityScore);
        setEnrollStep(3);
        setScanning(false);
        setEnrollSuccessMessage(res.message);
      }, 600);
    }
  };

  const resetEnrollment = () => {
    setEnrollStep(0);
    setScanning(false);
    setEnrollSuccessMessage(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden space-y-6 p-5">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-lg">
            <Fingerprint className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-wider uppercase text-blue-400">
                Fitur Registrasi Biometrik Perangkat
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Sensor Optik 500 DPI
              </span>
            </div>
            <h2 className="text-lg font-black">Perekaman Sidik Jari Pertama Kali (Enrollment Wizard)</h2>
            <p className="text-xs text-slate-300">
              Perekaman 3-tahap template minutiae sidik jari siswa & guru ke memori BIO Finger AT-101
            </p>
          </div>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-rose-400" />}
          <span>Buzzer Sensor {soundEnabled ? 'Aktif' : 'Mute'}</span>
        </button>
      </div>

      {/* Main Grid: Left Selection & Right Interactive AT-101 Enrollment Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Person Selection (Siswa / Guru) */}
        <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-4">
          
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" />
              <span>1. Pilih Siswa atau Guru</span>
            </h3>
            
            <div className="flex items-center gap-1 p-0.5 bg-slate-200 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setPersonType('STUDENT');
                  resetEnrollment();
                }}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  personType === 'STUDENT' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Siswa (480)
              </button>
              <button
                type="button"
                onClick={() => {
                  setPersonType('TEACHER');
                  resetEnrollment();
                }}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  personType === 'TEACHER' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                Guru ({teachers.length})
              </button>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="space-y-2 text-xs">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={personType === 'STUDENT' ? 'Cari nama siswa, PIN, atau kelas...' : 'Cari nama guru atau NIP...'}
                value={searchPerson}
                onChange={(e) => setSearchPerson(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <label className="flex items-center gap-2 text-[11px] text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={filterUnregisteredOnly}
                onChange={(e) => setFilterUnregisteredOnly(e.target.checked)}
                className="w-3.5 h-3.5 accent-blue-600 rounded"
              />
              <span>Tampilkan hanya yang <strong>Belum Rekam Sidik Jari</strong></span>
            </label>
          </div>

          {/* Candidates Scroll List */}
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-200/80 bg-white rounded-xl border border-slate-200">
            {candidateList.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Tidak ada data yang sesuai filter.
              </div>
            ) : (
              candidateList.slice(0, 40).map(person => {
                const isSelected = person.id === selectedPersonId;
                const isEnrolled = person.fingerprintRegistered;

                return (
                  <button
                    key={person.id}
                    type="button"
                    onClick={() => {
                      setSelectedPersonId(person.id);
                      resetEnrollment();
                    }}
                    className={`w-full text-left p-2.5 flex items-center justify-between text-xs transition-colors ${
                      isSelected ? 'bg-blue-50/80 text-blue-900 font-semibold' : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <img src={person.avatarUrl} alt={person.name} className="w-7 h-7 rounded-full bg-slate-100" />
                      <div className="min-w-0">
                        <p className="font-bold truncate text-xs">{person.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          PIN: {person.pin} • {'class' in person ? (person as Student).class : (person as Teacher).roleTitle}
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      {isEnrolled ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                          ✓ Terdaftar
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                          Belum Rekam
                        </span>
                      )}
                      {isSelected && <span className="text-blue-600 font-black">●</span>}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Finger Choice */}
          <div className="pt-2 border-t border-slate-200">
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              2. Pilih Jari yang Direkam:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setFingerIndex('TELUNJUK_KANAN')}
                className={`py-2 px-2.5 rounded-xl border text-left transition-all ${
                  fingerIndex === 'TELUNJUK_KANAN'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                👉 Telunjuk Kanan <span className="text-[10px] opacity-80">(Utama)</span>
              </button>

              <button
                type="button"
                onClick={() => setFingerIndex('JEMPOL_KANAN')}
                className={`py-2 px-2.5 rounded-xl border text-left transition-all ${
                  fingerIndex === 'JEMPOL_KANAN'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                👍 Jempol Kanan
              </button>

              <button
                type="button"
                onClick={() => setFingerIndex('TELUNJUK_KIRI')}
                className={`py-2 px-2.5 rounded-xl border text-left transition-all ${
                  fingerIndex === 'TELUNJUK_KIRI'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                👈 Telunjuk Kiri <span className="text-[10px] opacity-80">(Cadangan)</span>
              </button>

              <button
                type="button"
                onClick={() => setFingerIndex('JEMPOL_KIRI')}
                className={`py-2 px-2.5 rounded-xl border text-left transition-all ${
                  fingerIndex === 'JEMPOL_KIRI'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                👍 Jempol Kiri
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Physical BIO Finger AT-101 Optical Sensor Enrollment Chassis */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl p-6 border-4 border-slate-800 shadow-2xl relative text-white space-y-5">
          
          {/* Machine Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="font-mono font-bold text-xs tracking-wider text-slate-200">
                BIO FINGER <span className="text-blue-400">AT-101 ENROLLMENT MODE</span>
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">MODEL STANDALONE</span>
          </div>

          {/* LCD Screen Display */}
          <div className="bg-emerald-950/80 border-2 border-emerald-700/60 rounded-2xl p-4 font-mono shadow-inner text-xs space-y-2">
            <div className="flex justify-between text-[10px] text-emerald-400/80 border-b border-emerald-800/50 pb-1">
              <span>TARGET PIN: {selectedPin || '----'}</span>
              <span>MODE: ENROLL (3 TAPS)</span>
            </div>

            <div className="space-y-0.5">
              <p className="text-emerald-300 font-bold text-sm">
                {enrollStep === 0 && `Tempelkan Jari (${fingerIndex.replace(/_/g, ' ')})`}
                {enrollStep === 1 && '✓ Tap 1/3 OK! Angkat lalu Tempelkan Jari Lagi (2/3)...'}
                {enrollStep === 2 && '✓ Tap 2/3 OK! Tempelkan Sekali Lagi untuk Verifikasi (3/3)...'}
                {enrollStep === 3 && '🎉 ENROLLMENT SUKSES! MINUTIAE STORED'}
              </p>
              <p className="text-emerald-400 text-xs truncate">
                Subjek: {selectedName || 'Pilih Siswa/Guru'} ({personType})
              </p>
            </div>
          </div>

          {/* Optical Prism Scanner & Progress Dots */}
          <div className="flex flex-col items-center justify-center space-y-4 py-2">
            
            {/* 3 Progress Dots */}
            <div className="flex items-center gap-3">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center gap-1.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    enrollStep >= stepNum
                      ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20 shadow-lg'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {enrollStep >= stepNum ? <Check className="w-4 h-4 stroke-[3]" /> : stepNum}
                  </div>
                  {stepNum < 3 && <div className={`w-6 h-0.5 ${enrollStep > stepNum ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>}
                </div>
              ))}
            </div>

            {/* Glowing Biometric Optical Prism Sensor Button */}
            <div className="relative group">
              <button
                type="button"
                onClick={handleSensorTap}
                disabled={scanning || enrollStep === 3}
                className={`w-36 h-44 rounded-3xl border-4 transition-all flex flex-col items-center justify-center gap-3 cursor-pointer shadow-2xl relative ${
                  enrollStep === 3
                    ? 'bg-emerald-950/60 border-emerald-400 shadow-emerald-500/30'
                    : scanning
                    ? 'bg-blue-600/40 border-cyan-400 scale-95 shadow-cyan-500/50'
                    : 'bg-slate-800/90 border-slate-700 hover:border-cyan-400 hover:shadow-cyan-500/30 active:scale-95'
                }`}
              >
                {/* Visual Glass Optics */}
                <div className="w-20 h-24 rounded-2xl bg-gradient-to-b from-blue-900/60 to-cyan-950/80 border border-cyan-400/40 flex items-center justify-center relative overflow-hidden">
                  <Fingerprint className={`w-14 h-14 transition-all ${
                    enrollStep === 3
                      ? 'text-emerald-300 scale-105'
                      : scanning
                      ? 'text-cyan-200 scale-110 animate-pulse'
                      : 'text-cyan-400/80 group-hover:text-cyan-300'
                  }`} />

                  {/* Laser Scan line */}
                  <div className={`absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_10px_#22d3ee] transition-all ${
                    scanning ? 'top-1/2 animate-bounce' : 'top-1 group-hover:top-1/2'
                  }`}></div>
                </div>

                <div className="text-center">
                  <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider block">
                    {enrollStep === 0 && 'Sentuh Jari (1/3)'}
                    {enrollStep === 1 && 'Sentuh Jari (2/3)'}
                    {enrollStep === 2 && 'Sentuh Jari (3/3)'}
                    {enrollStep === 3 && '✓ Selesai'}
                  </span>
                  <span className="text-[10px] text-cyan-400">
                    {enrollStep === 3 ? 'Kualitas 98%' : 'Prisma Optik 500 DPI'}
                  </span>
                </div>
              </button>
            </div>

            {/* Success Message Banner */}
            {enrollSuccessMessage && (
              <div className="w-full p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 space-y-1 text-center">
                <p className="font-bold flex items-center justify-center gap-1.5 text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Sidik Jari Berhasil Terdaftar!</span>
                </p>
                <p className="text-[11px] text-slate-300">
                  {enrollSuccessMessage}
                </p>
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={resetEnrollment}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Ulangi Perekaman</span>
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Historical Biometric Enrollments Table */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Riwayat Perekaman Biometrik Mesin BIO Finger AT-101
            </h4>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {enrollmentLogs.length} Registrasi Tersimpan
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold text-[11px] border-b border-slate-200">
                <th className="py-2.5 px-3">PIN & Subjek</th>
                <th className="py-2.5 px-3">Tipe</th>
                <th className="py-2.5 px-3">Jari yang Direkam</th>
                <th className="py-2.5 px-3">Skor Kualitas Optik</th>
                <th className="py-2.5 px-3">Waktu Registrasi</th>
                <th className="py-2.5 px-3">Perangkat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrollmentLogs.slice(0, 10).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono">
                    <span className="font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded mr-1">
                      {log.pin}
                    </span>
                    <span className="font-sans font-semibold text-slate-800">{log.personName}</span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.personType === 'STUDENT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {log.personType === 'STUDENT' ? 'Siswa' : 'Guru'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-slate-700 font-medium">
                    {log.fingerIndex.replace(/_/g, ' ')}
                  </td>
                  <td className="py-2 px-3 font-mono font-bold text-emerald-700">
                    {log.qualityScore}% (High Match)
                  </td>
                  <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                    {log.enrolledAt}
                  </td>
                  <td className="py-2 px-3 text-slate-600 text-[11px]">
                    {log.enrolledDevice}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
