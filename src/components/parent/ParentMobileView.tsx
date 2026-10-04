import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { 
  Fingerprint, 
  Clock, 
  Calendar, 
  MessageSquare, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Send, 
  User, 
  ShieldCheck, 
  HelpCircle, 
  Phone, 
  FileText, 
  ExternalLink,
  School,
  Sparkles,
  Smartphone,
  LogOut,
  Paperclip,
  Upload
} from 'lucide-react';
import { generateDirectWhatsAppUrl } from '../../utils/whatsappHelper';

export const ParentMobileView: React.FC = () => {
  const { 
    students, 
    selectedParentStudentId, 
    attendanceRecords, 
    activeDate, 
    schoolConfig,
    notificationLogs,
    permissions,
    submitPermission,
    currentUser,
    logout
  } = useAttendance();

  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'permission' | 'profile'>('home');

  // Form state for leave/sick submission
  const [permType, setPermType] = useState<'SAKIT' | 'IZIN'>('SAKIT');
  const [permReason, setPermReason] = useState<string>('');
  const [permNote, setPermNote] = useState<string>('');
  const [attachmentFileName, setAttachmentFileName] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  // Kunci data secara ketat hanya untuk anak dari wali murid yang login
  const currentStudent = (currentUser?.studentId ? students.find(s => s.id === currentUser.studentId) : null)
    || students.find(s => s.id === selectedParentStudentId)
    || students[0];

  const todayRecord = attendanceRecords.find(r => r.studentId === currentStudent.id && r.date === activeDate);
  const studentPermissions = permissions.filter(p => p.studentId === currentStudent.id);
  const studentNotifs = notificationLogs.filter(n => n.studentId === currentStudent.id);

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!permReason.trim()) return;
    submitPermission(currentStudent.id, permType, permReason, activeDate, activeDate, permNote);
    setSubmitSuccess(true);
    setPermReason('');
    setPermNote('');
    setAttachmentFileName('');
    setTimeout(() => setSubmitSuccess(false), 4500);
  };

  const getStatusBadge = () => {
    if (!todayRecord) {
      return {
        label: 'Belum Melakukan Presensi',
        subtext: 'Menunggu scan sidik jari di gerbang sekolah',
        color: 'bg-slate-100 text-slate-700 border-slate-300',
        icon: Clock,
        textColor: 'text-slate-600'
      };
    }

    switch (todayRecord.status) {
      case 'HADIR_TEPAT':
        return {
          label: 'Hadir Tepat Waktu',
          subtext: `Tercatat di BIO Finger AT-101 pukul ${todayRecord.checkInTime} WIB`,
          color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          icon: CheckCircle2,
          textColor: 'text-emerald-700'
        };
      case 'TERLAMBAT':
        return {
          label: `Terlambat (${todayRecord.lateMinutes || 0} Menit)`,
          subtext: `Tercatat di BIO Finger AT-101 pukul ${todayRecord.checkInTime} WIB`,
          color: 'bg-amber-50 text-amber-900 border-amber-300',
          icon: AlertTriangle,
          textColor: 'text-amber-800'
        };
      case 'SAKIT':
        return {
          label: 'Sakit',
          subtext: todayRecord.notes || 'Keterangan sakit telah divalidasi sekolah',
          color: 'bg-blue-50 text-blue-800 border-blue-300',
          icon: HelpCircle,
          textColor: 'text-blue-700'
        };
      case 'IZIN':
        return {
          label: 'Izin',
          subtext: todayRecord.notes || 'Surat izin disetujui pihak sekolah',
          color: 'bg-purple-50 text-purple-800 border-purple-300',
          icon: FileText,
          textColor: 'text-purple-700'
        };
      case 'ALPHA':
        return {
          label: 'Tanpa Keterangan (Alpha)',
          subtext: 'Tidak ada data presensi sidik jari hingga batas akhir',
          color: 'bg-rose-50 text-rose-800 border-rose-300',
          icon: AlertTriangle,
          textColor: 'text-rose-700'
        };
      default:
        return {
          label: 'Belum Hadir',
          subtext: 'Menunggu pemindaian jari',
          color: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: Clock,
          textColor: 'text-slate-600'
        };
    }
  };

  const statusInfo = getStatusBadge();
  const StatusIcon = statusInfo.icon;

  const content = (
    <div className="w-full max-w-md mx-auto bg-slate-50 min-h-screen flex flex-col relative pb-20 shadow-xl border-x border-slate-200">
      
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white px-4 pt-4 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Fingerprint className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <p className="text-[10px] text-blue-200 font-semibold tracking-wider uppercase">Portal Resmi Wali Murid</p>
              <h2 className="text-sm font-bold truncate max-w-[200px]">MTs Nurus Salam Gebog Kudus</h2>
            </div>
          </div>

          {/* Tombol Keluar di bar bagian atas */}
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold border border-rose-400/40 shadow-sm transition-all"
            title="Keluar dari akun aplikasi orang tua"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>

        {/* Student Profile Card (Hero) */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3 min-w-0">
            <img 
              src={currentStudent.avatarUrl} 
              alt={currentStudent.name}
              className="w-14 h-14 rounded-2xl bg-white/90 p-0.5 border-2 border-white/60 object-cover shadow-sm shrink-0" 
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-white truncate">{currentStudent.name}</h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-400 text-slate-900">
                  {currentStudent.class}
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">NISN: {currentStudent.nisn} • Wali: {currentStudent.parentName}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] text-blue-200 bg-blue-950/40 px-2 py-0.5 rounded-full border border-blue-400/30">
                  <Fingerprint className="w-3 h-3 text-emerald-400" />
                  PIN BioFinger: <strong className="text-white">{currentStudent.pin}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Tombol Keluar di bar sebelah profil */}
          <button
            onClick={() => logout()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-rose-600 active:scale-95 text-white border border-white/25 hover:border-rose-400 text-xs font-bold transition-all shadow-sm shrink-0"
            title="Keluar dari akun aplikasi"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 px-3.5 -mt-3 space-y-3.5">

        {/* TAB 1: BERANDA */}
        {activeTab === 'home' && (
          <>
            {/* Live Attendance Status Today */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-800">Status Hari Ini</span>
                    <p className="text-[11px] text-slate-400">{activeDate}</p>
                  </div>
                </div>
                <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  BIO Finger AT-101
                </span>
              </div>

              {/* Status Banner */}
              <div className={`rounded-xl p-3 border ${statusInfo.color} mb-3.5 transition-all`}>
                <div className="flex items-start gap-2.5">
                  <StatusIcon className={`w-5 h-5 shrink-0 mt-0.5 ${statusInfo.textColor}`} />
                  <div>
                    <h4 className={`text-sm font-bold ${statusInfo.textColor}`}>{statusInfo.label}</h4>
                    <p className="text-xs opacity-90 mt-0.5">{statusInfo.subtext}</p>
                  </div>
                </div>
              </div>

              {/* In/Out Times Timeline */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center relative overflow-hidden">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Waktu Masuk
                  </span>
                  <div className="text-lg font-extrabold text-slate-800 font-mono">
                    {todayRecord?.checkInTime ? `${todayRecord.checkInTime} WIB` : '--:--:--'}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">
                    {todayRecord?.checkInTime ? '✓ Terverifikasi Jari' : 'Belum Scan'}
                  </span>
                  {todayRecord?.checkInTime && (
                    <div className="text-[9px] text-slate-400 mt-1 truncate">
                      {todayRecord.checkInDevice || 'Gate-1 AT-101'}
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 text-center relative overflow-hidden">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                    Waktu Pulang
                  </span>
                  <div className="text-lg font-extrabold text-slate-800 font-mono">
                    {todayRecord?.checkOutTime ? `${todayRecord.checkOutTime} WIB` : '--:--:--'}
                  </div>
                  <span className="text-[10px] text-blue-600 font-medium mt-0.5 block">
                    {todayRecord?.checkOutTime ? '✓ Terverifikasi Jari' : 'Batas 14:30 WIB'}
                  </span>
                  {todayRecord?.checkOutTime && (
                    <div className="text-[9px] text-slate-400 mt-1 truncate">
                      {todayRecord.checkOutDevice || 'Gate-2 AT-101'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Real-Time Notification Box: MTs Nurus Salam Gebog Kudus */}
            <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-emerald-50 rounded-2xl p-4 border border-emerald-300 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-emerald-950">Notifikasi Real-Time MTs Nurus Salam Gebog Kudus</h4>
                    <p className="text-[10px] text-emerald-700 font-medium">Terkirim ke WhatsApp Wali: +{currentStudent.parentPhone}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 bg-emerald-600 text-white rounded-full shadow-xs">
                  <CheckCircle2 className="w-3 h-3" />
                  Auto Sent
                </span>
              </div>

              {/* Chat Bubble Content */}
              <div className="bg-white rounded-xl p-3.5 shadow-xs border border-emerald-200/80 text-xs text-slate-700 leading-relaxed font-sans mb-3">
                <div className="text-[10px] text-emerald-800 font-mono mb-2 flex items-center justify-between border-b border-emerald-100 pb-1.5 font-bold">
                  <span>BIO Finger AT-101 • MTs Nurus Salam Gebog Kudus</span>
                  <span className="text-slate-500">{todayRecord?.checkInTime || '06:45:00'} WIB</span>
                </div>
                {todayRecord?.checkInTime ? (
                  <div>
                    <p className="font-bold text-slate-900">
                      Yth. {currentStudent.parentName},
                    </p>
                    <p className="mt-1 text-slate-700 leading-relaxed">
                      Siswa <strong className="text-slate-900">{currentStudent.name}</strong> (Kelas {currentStudent.class}) telah terdeteksi hadir pada mesin <strong>BIO Finger AT-101 MTs Nurus Salam Gebog Kudus</strong> pukul <strong className="text-emerald-700">{todayRecord.checkInTime} WIB</strong> ({todayRecord.status === 'TERLAMBAT' ? `Terlambat ${todayRecord.lateMinutes} menit` : 'Tepat Waktu'}).
                    </p>
                    <p className="text-[10px] text-slate-400 mt-2 italic">
                      Laporan resmi otomatis disinkronkan secara real-time ke akun aplikasi orang tua dan server madrasah.
                    </p>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">
                    Notifikasi kehadiran ananda akan otomatis terkirim secara real-time ke nomor WhatsApp Bapak/Ibu setelah ananda melakukan scan sidik jari pada mesin BIO Finger AT-101 MTs Nurus Salam Gebog Kudus.
                  </p>
                )}
              </div>

              {/* Action Buttons: Ajukan Izin Anaknya & Buka WhatsApp */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('permission')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all border border-blue-400/30"
                >
                  <FileText className="w-4 h-4" />
                  <span>Ajukan Surat Izin / Sakit Ananda</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </button>

                {todayRecord?.checkInTime && (
                  <a
                    href={generateDirectWhatsAppUrl(
                      currentStudent.parentPhone, 
                      `*MTs Nurus Salam Gebog Kudus*\nHalo Guru Piket, saya orang tua dari ${currentStudent.name} (${currentStudent.class}). Saya telah menerima notifikasi kehadiran ananda hari ini pukul ${todayRecord.checkInTime} WIB. Terima kasih.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Buka Pesan di WhatsApp Saya</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Action: Ajukan Izin / Sakit shortcut */}
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800">Siswa Berhalangan Hadir?</h5>
                  <p className="text-[11px] text-slate-500">Kirim surat izin atau keterangan sakit online</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('permission')}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shrink-0 transition-all"
              >
                Ajukan
              </button>
            </div>

            {/* Machine & Biometric Verification Info */}
            <div className="bg-slate-100/80 rounded-2xl p-3.5 border border-slate-200 text-xs text-slate-600">
              <div className="flex items-center gap-2 mb-2 font-semibold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Keamanan Presensi Terjamin</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Presensi menggunakan sensor optik biometrik <strong>BIO Finger AT-101</strong> anti-titip absen dengan verifikasi sidik jari aktif dan integrasi awan real-time.
              </p>
            </div>
          </>
        )}

        {/* TAB 2: RIWAYAT BULANAN */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Riwayat Presensi Ananda</h3>
                <p className="text-xs text-slate-400">Rekapitulasi Kehadiran Bulan Ini</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
                Semester Ganjil
              </span>
            </div>

            {/* Monthly Recap Stat Badges */}
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2">
                <span className="text-[10px] text-emerald-700 font-semibold block">Tepat</span>
                <span className="text-base font-bold text-emerald-800">21</span>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-2">
                <span className="text-[10px] text-amber-700 font-semibold block">Terlambat</span>
                <span className="text-base font-bold text-amber-800">1</span>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-2">
                <span className="text-[10px] text-blue-700 font-semibold block">Sakit</span>
                <span className="text-base font-bold text-blue-800">1</span>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-2">
                <span className="text-[10px] text-purple-700 font-semibold block">Izin</span>
                <span className="text-base font-bold text-purple-800">0</span>
              </div>
            </div>

            {/* List of recent attendance logs */}
            <div className="space-y-2.5 pt-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Log Pemindaian Terkini</h4>
              
              {/* Today's record */}
              <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>{activeDate} (Hari Ini)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Masuk: <strong>{todayRecord?.checkInTime || '-'}</strong> • Pulang: <strong>{todayRecord?.checkOutTime || '-'}</strong>
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  todayRecord?.status === 'HADIR_TEPAT' ? 'bg-emerald-100 text-emerald-800' :
                  todayRecord?.status === 'TERLAMBAT' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                }`}>
                  {todayRecord?.status || 'BELUM HADIR'}
                </span>
              </div>

              {/* Past mock logs */}
              {[
                { date: '2026-10-02', in: '06:42:10', out: '14:45:15', status: 'HADIR_TEPAT', late: 0 },
                { date: '2026-10-01', in: '06:38:44', out: '14:35:20', status: 'HADIR_TEPAT', late: 0 },
                { date: '2026-09-30', in: '07:22:18', out: '14:40:02', status: 'TERLAMBAT', late: 7 },
                { date: '2026-09-29', in: '06:45:00', out: '14:35:00', status: 'HADIR_TEPAT', late: 0 },
                { date: '2026-09-28', in: '06:50:11', out: '14:42:09', status: 'HADIR_TEPAT', late: 0 },
              ].map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50 flex items-center justify-between text-xs transition-colors">
                  <div>
                    <div className="font-semibold text-slate-800">{item.date}</div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Masuk: <strong>{item.in}</strong> • Pulang: <strong>{item.out}</strong>
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    item.status === 'HADIR_TEPAT' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {item.status === 'HADIR_TEPAT' ? 'Tepat Waktu' : `Terlambat ${item.late}m`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PENGAJUAN IZIN / SAKIT */}
        {activeTab === 'permission' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Layanan Izin Online MTs Nurus Salam Gebog Kudus
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1">Form Pengajuan Surat Izin / Sakit Ananda</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
                Wali murid dapat mengirimkan permohonan izin/sakit ananda secara resmi langsung ke Guru Piket & Wali Kelas melalui akun aplikasi ini.
              </p>
            </div>

            {submitSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2.5 animate-fade-in shadow-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <p className="font-bold">Surat Izin Berhasil Dikirimkan!</p>
                  <p className="text-[11px] text-emerald-700">Telah diteruskan ke meja Guru Piket MTs Nurus Salam Gebog Kudus untuk divalidasi.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleLeaveSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Jenis Permohonan Izin</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPermType('SAKIT')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      permType === 'SAKIT'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>🏥 Sakit (Surat Dokter)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPermType('IZIN')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                      permType === 'IZIN'
                        ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>📝 Izin Tertulis / Keperluan</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Alasan Berhalangan Hadir</label>
                <textarea
                  rows={3}
                  value={permReason}
                  onChange={(e) => setPermReason(e.target.value)}
                  placeholder="Contoh: Mengalami demam dan batuk pilek sejak semalam, sedang istirahat di rumah..."
                  required
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Catatan Tambahan untuk Guru Piket</label>
                <input
                  type="text"
                  value={permNote}
                  onChange={(e) => setPermNote(e.target.value)}
                  placeholder="Contoh: Mohon izin ananda istirahat selama 1 hari"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              {/* Lampiran Dokumen / Surat Dokter */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Lampiran Foto Surat Dokter / Surat Izin Wali (Opsional)
                </label>
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl p-3 text-center bg-slate-50/60 hover:bg-slate-50 transition-colors">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setAttachmentFileName(e.target.files[0].name);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-1 text-slate-500">
                    <Upload className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-medium text-slate-700">
                      {attachmentFileName ? `Terlampir: ${attachmentFileName}` : 'Klik untuk pilih foto surat keterangan dokter / resep'}
                    </span>
                    <span className="text-[10px] text-slate-400">Format JPG, PNG, atau PDF (Maks. 5MB)</span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Kirim Surat Izin ke MTs Nurus Salam Gebog Kudus</span>
              </button>
            </form>

            {/* Existing Submissions */}
            {studentPermissions.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-2">Riwayat Pengajuan Ananda</h4>
                <div className="space-y-2">
                  {studentPermissions.map(p => (
                    <div key={p.id} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-800">{p.type} • {p.startDate}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                          p.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.status === 'APPROVED' ? 'Disetujui' : p.status === 'REJECTED' ? 'Ditolak' : 'Menunggu'}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{p.reason}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PROFIL & MESIN AT-101 */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-4">
            <div className="text-center pb-3 border-b border-slate-100">
              <img 
                src={currentStudent.avatarUrl} 
                alt={currentStudent.name}
                className="w-16 h-16 rounded-full mx-auto border-2 border-blue-500 p-0.5 bg-slate-100 shadow-sm"
              />
              <h3 className="text-base font-bold text-slate-800 mt-2">{currentStudent.name}</h3>
              <p className="text-xs text-slate-500">{currentStudent.class} • NISN: {currentStudent.nisn}</p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Nama Wali / Orang Tua:</span>
                <span className="font-semibold text-slate-800">{currentStudent.parentName}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">No. WhatsApp Notifikasi:</span>
                <span className="font-semibold text-emerald-700">+{currentStudent.parentPhone}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Email Notifikasi:</span>
                <span className="font-semibold text-slate-800">{currentStudent.parentEmail}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">PIN Mesin AT-101:</span>
                <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {currentStudent.pin}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Status Sidik Jari:</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Terdaftar di AT-101
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Kartu RFID Cadangan:</span>
                <span className="font-mono text-slate-700">{currentStudent.rfidCard}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
              <p className="font-bold mb-1">Butuh Bantuan Presensi?</p>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                Hubungi Tata Usaha / Guru Piket {schoolConfig.schoolName} bila ada pergantian nomor WhatsApp wali murid atau kendala pemindaian sidik jari.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Sticky Native-Like Bottom Navigation Bar for Smartphone */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-3 flex items-center justify-around z-40 shadow-lg">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'home' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Fingerprint className="w-5 h-5" />
          <span className="text-[10px]">Beranda</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'history' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Riwayat</span>
        </button>

        <button
          onClick={() => setActiveTab('permission')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'permission' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <FileText className="w-5 h-5" />
          <span className="text-[10px]">Izin / Sakit</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            activeTab === 'profile' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px]">Profil</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center py-0 sm:py-6">
      {content}
    </div>
  );
};
