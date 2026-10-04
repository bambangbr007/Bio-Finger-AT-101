import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { UserRole } from '../../types';
import { 
  Fingerprint, 
  ShieldAlert, 
  UserCheck, 
  Smartphone, 
  LogIn, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles,
  School,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, students, teachers, schoolConfig } = useAttendance();

  const [activeTab, setActiveTab] = useState<'admin' | 'parent'>('admin');
  const [identifier, setIdentifier] = useState<string>('admin@sekolah.sch.id');
  const [password, setPassword] = useState<string>('admin123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // For parent login selector
  const [selectedParentStudentId, setSelectedParentStudentId] = useState<string>(students[0]?.id || 'STU-001');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (activeTab === 'parent') {
      const ok = login(identifier, undefined, 'PARENT', selectedParentStudentId);
      if (!ok) {
        setErrorMsg('Data siswa / PIN tidak ditemukan.');
      }
    } else {
      const ok = login(identifier, password);
      if (!ok) {
        setErrorMsg('Kredensial login tidak valid. Silakan coba akun demo di bawah.');
      }
    }
  };

  const handleQuickLogin = (role: UserRole, studentId?: string) => {
    setErrorMsg(null);
    if (role === 'SUPER_ADMIN') {
      login('superadmin@sekolah.sch.id', 'admin123', 'SUPER_ADMIN');
    } else if (role === 'ADMIN') {
      login('admin@sekolah.sch.id', 'admin123', 'ADMIN');
    } else {
      login('', undefined, 'PARENT', studentId || students[0]?.id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      
      {/* Decorative ambient lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-400/40 mx-auto flex items-center justify-center shadow-xl shadow-blue-500/25">
            <Fingerprint className="w-9 h-9 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            BIO Finger <span className="text-blue-400">AT-101</span>
          </h1>
          <p className="text-xs text-slate-300 font-medium">
            Sistem Presensi Siswa Biometrik Cloud • {schoolConfig.schoolName}
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20 space-y-5">
          
          {/* Tabs: Staf/Admin vs Orang Tua */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setIdentifier('admin@sekolah.sch.id');
                setPassword('admin123');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Admin / Guru</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('parent');
                setIdentifier(students[0]?.pin || '1001');
                setErrorMsg(null);
              }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'parent'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Orang Tua (Hp)</span>
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {activeTab === 'admin' ? (
              <>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Email / NIP / Username:
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="admin@sekolah.sch.id atau superadmin"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Password:
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-slate-900"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Pilih Akun Siswa (480 Siswa Terdaftar):
                  </label>
                  <select
                    value={selectedParentStudentId}
                    onChange={(e) => {
                      setSelectedParentStudentId(e.target.value);
                      const st = students.find(s => s.id === e.target.value);
                      if (st) setIdentifier(st.pin);
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-900"
                  >
                    {students.slice(0, 50).map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.class}) • PIN: {s.pin} • Wali: {s.parentName}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Menampilkan 50 siswa pertama untuk kemudahan simulasi
                  </span>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    PIN Mesin BioFinger AT-101 / No. WhatsApp:
                  </label>
                  <div className="relative">
                    <Fingerprint className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="Masukkan PIN siswa (misal: 1001)"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-900 font-mono"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className={`w-full py-2.5 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                activeTab === 'admin'
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/25 active:scale-[0.98]'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25 active:scale-[0.98]'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk ke Aplikasi</span>
            </button>
          </form>

          {/* Quick Demo Access Badges */}
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              ⚡ Akses Cepat 1-Klik (Pengujian Reviewer)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('SUPER_ADMIN')}
                className="p-2 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/80 text-amber-900 text-center transition-all group"
              >
                <ShieldAlert className="w-4 h-4 mx-auto text-amber-600 mb-0.5" />
                <span className="text-[10px] font-bold block leading-tight">Super Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ADMIN')}
                className="p-2 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100/80 text-blue-900 text-center transition-all group"
              >
                <UserCheck className="w-4 h-4 mx-auto text-blue-600 mb-0.5" />
                <span className="text-[10px] font-bold block leading-tight">Admin Guru</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('PARENT')}
                className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-900 text-center transition-all group"
              >
                <Smartphone className="w-4 h-4 mx-auto text-emerald-600 mb-0.5" />
                <span className="text-[10px] font-bold block leading-tight">Orang Tua (Hp)</span>
              </button>
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-400">
          Tersinkronisasi dengan Mesin Presensi <strong>BIO Finger AT-101 Standalone</strong>
        </p>

      </div>
    </div>
  );
};
