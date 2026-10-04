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
  AlertCircle,
  UserPlus,
  Phone,
  GraduationCap,
  Camera,
  Upload
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { 
    login, 
    students, 
    teachers, 
    schoolConfig, 
    registerParentAccount,
    parentAccounts 
  } = useAttendance();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<'admin' | 'parent'>('admin');
  
  // Login form state
  const [identifier, setIdentifier] = useState<string>('admin@sekolah.sch.id');
  const [password, setPassword] = useState<string>('admin123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Register form state (khusus orang tua baru)
  const [regParentName, setRegParentName] = useState<string>('');
  const [regStudentName, setRegStudentName] = useState<string>('');
  const [regStudentClass, setRegStudentClass] = useState<string>('Kelas 7A');
  const [regWhatsappPhone, setRegWhatsappPhone] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirmPassword, setRegConfirmPassword] = useState<string>('');
  const [regPhotoUrl, setRegPhotoUrl] = useState<string>('https://api.dicebear.com/7.x/adventurer/svg?seed=Ahmad');

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Ukuran file foto maksimal 5 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setRegPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (activeTab === 'parent') {
      const ok = login(identifier, password, 'PARENT');
      if (!ok) {
        setErrorMsg('Username (Nama Anak) atau Password tidak cocok. Silakan cek kembali atau hubungi Admin / Guru Piket jika lupa password.');
      }
    } else {
      const ok = login(identifier, password);
      if (!ok) {
        setErrorMsg('Kredensial login admin tidak valid. Silakan coba akun demo di bawah.');
      }
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!regParentName.trim() || !regStudentName.trim() || !regWhatsappPhone.trim() || !regPassword.trim()) {
      setErrorMsg('Semua kolom pendaftaran wajib diisi.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok dengan password yang dimasukkan.');
      return;
    }

    if (regPassword.length < 4) {
      setErrorMsg('Password minimal 4 karakter.');
      return;
    }

    const res = registerParentAccount({
      parentName: regParentName,
      studentName: regStudentName,
      studentClass: regStudentClass,
      whatsappPhone: regWhatsappPhone,
      password: regPassword,
      avatarUrl: regPhotoUrl
    });

    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    // Pendaftaran sukses
    setSuccessMsg(`Alhamdulillah, akun wali murid berhasil didaftarkan! Gunakan Nama Anak "${regStudentName}" sebagai Username untuk login.`);
    setIdentifier(regStudentName);
    setPassword(regPassword);
    setActiveTab('parent');
    setMode('login');

    // Reset form pendaftaran
    setRegParentName('');
    setRegStudentName('');
    setRegWhatsappPhone('');
    setRegPassword('');
    setRegConfirmPassword('');
    setRegPhotoUrl('https://api.dicebear.com/7.x/adventurer/svg?seed=Ahmad');
  };

  const handleQuickLogin = (role: UserRole, studentId?: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (role === 'SUPER_ADMIN') {
      login('superadmin@sekolah.sch.id', 'admin123', 'SUPER_ADMIN');
    } else if (role === 'ADMIN') {
      login('admin@sekolah.sch.id', 'admin123', 'ADMIN');
    } else {
      const sampleAcc = parentAccounts[0];
      if (sampleAcc) {
        login(sampleAcc.studentName, sampleAcc.password, 'PARENT');
      } else {
        login('', undefined, 'PARENT', studentId || students[0]?.id);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      
      {/* Decorative ambient lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md z-10 space-y-5">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-400/40 mx-auto flex items-center justify-center shadow-xl shadow-blue-500/25">
            <Fingerprint className="w-9 h-9 text-white animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            BIO Finger <span className="text-blue-400">AT-101</span>
          </h1>
          <p className="text-xs text-slate-300 font-medium">
            Sistem Presensi Biometrik Cloud • MTs Nurus Salam Gebog Kudus
          </p>
        </div>

        {/* Main Card (Login or Register) */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20 space-y-4">
          
          {/* Mode Switcher: Masuk vs Daftar Akun Baru */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {mode === 'login' ? 'Masuk ke Aplikasi' : 'Pendaftaran Akun Orang Tua'}
              </h2>
              <p className="text-[11px] text-slate-500">
                {mode === 'login' 
                  ? 'Gunakan akun yang telah terdaftar di sistem madrasah' 
                  : 'Nama anak Anda akan dijadikan sebagai Username login'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setSuccessMsg(null);
                setMode(mode === 'login' ? 'register' : 'login');
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shadow-xs"
              style={{
                backgroundColor: mode === 'login' ? '#ecfdf5' : '#f1f5f9',
                color: mode === 'login' ? '#047857' : '#475569',
                borderColor: mode === 'login' ? '#a7f3d0' : '#cbd5e1'
              }}
            >
              {mode === 'login' ? (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Daftar Baru</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Ke Login</span>
                </>
              )}
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODE 1: LOGIN */}
          {mode === 'login' && (
            <>
              {/* Role Tabs for Login: Admin Guru vs Orang Tua */}
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
                    const sample = parentAccounts[0];
                    setIdentifier(sample ? sample.studentName : 'Ahmad Fauzi');
                    setPassword(sample ? sample.password : 'wali1001');
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

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
                {activeTab === 'admin' ? (
                  <>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Email / NIP / Username Admin:
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
                      <label className="font-bold text-slate-700 block mb-1">
                        Password Admin:
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
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700">
                          Username (Nama Lengkap Anak):
                        </label>
                        <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          Nama Anak = Username
                        </span>
                      </div>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          placeholder="Contoh: Ahmad Fauzi atau nama anak Anda"
                          required
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-900 font-medium"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Masukkan nama lengkap anak Anda persis seperti saat pendaftaran.
                      </p>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Password:
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Masukkan password akun orang tua"
                          required
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Lupa password?</span>
                      <span className="text-emerald-700 font-semibold">
                        Hubungi Guru Piket / Admin untuk reset
                      </span>
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

              {/* Quick Demo Access Badges for Reviewers */}
              <div className="pt-3 border-t border-slate-100">
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
            </>
          )}

          {/* MODE 2: REGISTRATION FOR PARENTS */}
          {mode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] leading-relaxed">
                <strong>Ketentuan Akun Baru:</strong> Username Anda nantinya adalah <strong>Nama Lengkap Anak</strong>. Pastikan nomor WhatsApp aktif untuk menerima laporan notifikasi presensi real-time.
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nama Lengkap Orang Tua / Wali:
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={regParentName}
                    onChange={(e) => setRegParentName(e.target.value)}
                    placeholder="Contoh: Bapak Drs. Harahap / Ibu Sulastri"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-900"
                  />
                </div>
              </div>

              {/* Upload Foto Siswa (Photo Profil) */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    <span>Foto Siswa (Foto Profil Akun):</span>
                  </label>
                  <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">Foto Profil Resmi</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative group shrink-0">
                    <img
                      src={regPhotoUrl}
                      alt="Preview Profil Siswa"
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm bg-white"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <label className="flex items-center justify-center gap-1.5 w-full py-2 px-2.5 rounded-xl border border-dashed border-blue-400 bg-blue-50/70 hover:bg-blue-100 text-blue-800 text-[11px] font-bold cursor-pointer transition-all shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Pilih Foto dari Galeri / Kamera</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoFileChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-slate-400">
                      Foto ini akan menjadi foto profil siswa di aplikasi & sistem sekolah.
                    </p>
                  </div>
                </div>

                {/* Avatar presets quick buttons */}
                <div className="pt-1 border-t border-slate-200/60">
                  <span className="text-[10px] text-slate-500 font-medium block mb-1">Atau pilih karakter siswa:</span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { name: 'Putra 1', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Ahmad' },
                      { name: 'Putra 2', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zul' },
                      { name: 'Putri 1', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Fatimah' },
                      { name: 'Putri 2', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aisyah' }
                    ].map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setRegPhotoUrl(av.url)}
                        className={`p-1 rounded-xl border text-[10px] flex items-center justify-center gap-1 transition-all ${
                          regPhotoUrl === av.url ? 'border-emerald-500 bg-emerald-50 font-bold text-emerald-800 shadow-2xs' : 'border-slate-200 bg-white text-slate-600'
                        }`}
                      >
                        <img src={av.url} alt={av.name} className="w-4 h-4 rounded-full" />
                        <span>{av.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">
                    Nama Lengkap Anak (Siswa):
                  </label>
                  <span className="text-[10px] text-emerald-700 font-bold">
                    (Username Login)
                  </span>
                </div>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 absolute left-3 top-2.5 text-emerald-600" />
                  <input
                    type="text"
                    value={regStudentName}
                    onChange={(e) => setRegStudentName(e.target.value)}
                    placeholder="Contoh: Ilham Puspitasari"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-emerald-50/40 border border-emerald-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Kelas Siswa:
                  </label>
                  <select
                    value={regStudentClass}
                    onChange={(e) => setRegStudentClass(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-900 font-medium"
                  >
                    <option value="Kelas 7A">Kelas 7A</option>
                    <option value="Kelas 7B">Kelas 7B</option>
                    <option value="Kelas 7C">Kelas 7C</option>
                    <option value="Kelas 8A">Kelas 8A</option>
                    <option value="Kelas 8B">Kelas 8B</option>
                    <option value="Kelas 8C">Kelas 8C</option>
                    <option value="Kelas 9A">Kelas 9A</option>
                    <option value="Kelas 9B">Kelas 9B</option>
                    <option value="Kelas 9C">Kelas 9C</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    No. WhatsApp Aktif:
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="tel"
                      value={regWhatsappPhone}
                      onChange={(e) => setRegWhatsappPhone(e.target.value)}
                      placeholder="08123456789"
                      required
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-900 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Password Baru:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimal 4 karakter"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Konfirmasi Password:
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Ulangi password di atas"
                    required
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-xs text-slate-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Daftarkan Akun Wali Murid</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold inline-flex items-center gap-1"
                >
                  <span>Sudah punya akun? Kembali ke Halaman Login</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-slate-400">
          Tersinkronisasi dengan Mesin Presensi <strong>BIO Finger AT-101 Standalone</strong>
        </p>

      </div>
    </div>
  );
};
