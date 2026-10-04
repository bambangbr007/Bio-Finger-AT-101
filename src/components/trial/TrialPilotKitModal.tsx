import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { 
  Rocket, 
  CheckCircle2, 
  X, 
  Sparkles, 
  Building2, 
  Smartphone, 
  FileText, 
  Send, 
  ShieldCheck, 
  Clock, 
  Cpu, 
  Download, 
  Printer, 
  ExternalLink,
  Tv,
  Check,
  Award,
  ChevronRight
} from 'lucide-react';
import { generateDirectWhatsAppUrl } from '../../utils/whatsappHelper';

interface TrialPilotKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenKiosk: () => void;
}

export const TrialPilotKitModal: React.FC<TrialPilotKitModalProps> = ({ isOpen, onClose, onOpenKiosk }) => {
  const { schoolConfig, updateSchoolConfig, students, recentScans, setCurrentRole } = useAttendance();

  const [activeSubTab, setActiveSubTab] = useState<'checklist' | 'customize' | 'wa_test' | 'proposal'>('checklist');
  const [testPhoneNumber, setTestPhoneNumber] = useState<string>('');
  const [testStudentId, setTestStudentId] = useState<string>(students[0]?.id || 'STU-001');
  const [testStatus, setTestStatus] = useState<'HADIR_TEPAT' | 'TERLAMBAT' | 'TIDAK_HADIR'>('HADIR_TEPAT');
  const [waSentSuccess, setWaSentSuccess] = useState<boolean>(false);

  // Quick School Customizer Form
  const [customSchoolName, setCustomSchoolName] = useState<string>(schoolConfig.schoolName);
  const [customPrincipal, setCustomPrincipal] = useState<string>('Drs. H. Mulyadi, M.Pd');
  const [customNip, setCustomNip] = useState<string>('19720415 199802 1 002');
  const [customCity, setCustomCity] = useState<string>('Jakarta / Surabaya / Bandung');
  const [profileSaved, setProfileSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolConfig({
      ...schoolConfig,
      schoolName: customSchoolName
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleTestWhatsAppDirect = () => {
    const student = students.find(s => s.id === testStudentId) || students[0];
    const targetPhone = testPhoneNumber.trim() || student.parentPhone;
    const todayFormatted = new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date());

    let message = '';
    if (testStatus === 'HADIR_TEPAT') {
      message = `*NOTIFIKASI KEHADIRAN SISWA*\n*${customSchoolName}*\n\nYth. Bapak/Ibu Wali dari *${student.name}*,\n\nAlhamdulillah, ananda telah tiba di sekolah dan melakukan presensi sidik jari dengan *TEPAT WAKTU*:\n\n📅 *Hari/Tanggal:* ${todayFormatted}\n⏰ *Waktu Tiba:* 06:42:15 WIB\n🏫 *Kelas:* ${student.class} (NISN: ${student.nisn})\n✅ *Status:* Hadir Tepat Waktu\n\nTerima kasih atas kedisiplinan ananda dan bimbingan Ayah/Bunda di rumah.\n\n_Pesan otomatis Sistem Presensi Cloud BioFinger AT-101_`;
    } else if (testStatus === 'TERLAMBAT') {
      message = `*PEMBERITAHUAN KETERLAMBATAN SISWA*\n*${customSchoolName}*\n\nYth. Bapak/Ibu Wali dari *${student.name}*,\n\nKami menginformasikan bahwa ananda telah tiba di sekolah dengan rincian sbb:\n\n📅 *Hari/Tanggal:* ${todayFormatted}\n⏰ *Waktu Tiba:* 07:08:30 WIB\n🏫 *Kelas:* ${student.class} (NISN: ${student.nisn})\n⚠️ *Status:* *TERLAMBAT (8 Menit)*\n📌 *Batas Jam Masuk:* 07:00 WIB\n\nAnanda telah dipandu oleh Guru Piket untuk mengikuti kegiatan belajar. Mohon bantuan Ayah/Bunda untuk mendampingi ananda agar dapat berangkat lebih awal esok hari.\n\n_Salam hangat, Tim Kesiswaan & Guru Piket_`;
    } else {
      message = `*KONFIRMASI KETIDAKHADIRAN SISWA*\n*${customSchoolName}*\n\nYth. Bapak/Ibu Wali dari *${student.name}*,\n\nBerdasarkan data mesin sensor BioFinger AT-101 hingga batas cut-off (*pukul 07:15 WIB*), ananda tercatat *BELUM MELAKUKAN PRESENSI* di sekolah:\n\n📅 *Hari/Tanggal:* ${todayFormatted}\n🏫 *Kelas:* ${student.class} (NISN: ${student.nisn})\n❓ *Status:* *BELUM HADIR / TANPA KETERANGAN*\n\nApabila ananda berhalangan hadir dikarenakan *SAKIT* atau *IZIN*, mohon segera membalas pesan ini atau mengirimkan konfirmasi ke Guru Piket:\n📞 *Layanan Piket Sekolah:* 0812-3456-7890\n\n_Sistem Keamanan & Presensi Terpadu Sekolah_`;
    }

    const url = generateDirectWhatsAppUrl(targetPhone, message);
    window.open(url, '_blank');
    setWaSentSuccess(true);
    setTimeout(() => setWaSentSuccess(false), 3000);
  };

  const handlePrintProposal = () => {
    window.print();
  };

  const selectedStudentForTest = students.find(s => s.id === testStudentId) || students[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-400/30">
              <Rocket className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Consumer Pilot Kit • Siap Uji Coba
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                  Versi Siap Pakai 2026
                </span>
              </div>
              <h2 className="text-xl font-black mt-1">
                Pusat Uji Coba Konsumen (Trial & Showcase Center)
              </h2>
              <p className="text-xs text-indigo-200 mt-0.5">
                Panduan praktis bagi Tim Sekolah, Kepala Sekolah, dan Yayasan untuk menguji keandalan sistem sebelum implementasi penuh.
              </p>
            </div>
          </div>

          {/* Sub Navigation */}
          <div className="flex flex-wrap items-center gap-2 mt-5">
            <button
              onClick={() => setActiveSubTab('checklist')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'checklist' 
                  ? 'bg-white text-blue-950 shadow-md' 
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>5 Langkah Uji Coba Pilot</span>
            </button>

            <button
              onClick={() => setActiveSubTab('customize')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'customize' 
                  ? 'bg-white text-blue-950 shadow-md' 
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Building2 className="w-4 h-4 text-amber-300" />
              <span>Sesuaikan Identitas Sekolah</span>
            </button>

            <button
              onClick={() => setActiveSubTab('wa_test')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'wa_test' 
                  ? 'bg-white text-blue-950 shadow-md' 
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Smartphone className="w-4 h-4 text-emerald-300" />
              <span>Uji Kirim WA ke Nomor Sendiri</span>
            </button>

            <button
              onClick={() => setActiveSubTab('proposal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeSubTab === 'proposal' 
                  ? 'bg-white text-blue-950 shadow-md' 
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <FileText className="w-4 h-4 text-cyan-300" />
              <span>Brosur & Spesifikasi Resmi</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-6">

          {/* TAB 1: 5-STEP PILOT CHECKLIST */}
          {activeSubTab === 'checklist' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-900 leading-relaxed">
                  Gunakan daftar periksa (*checklist*) berikut saat mempresentasikan sistem ini kepada Kepala Sekolah, Dewan Guru, atau Komite Yayasan. Seluruh fitur dapat diuji coba seketika tanpa memerlukan instalasi tambahan.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Step 1 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      Langkah 01 • Penarikan Mandiri
                    </span>
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Uji Cron Job 07:15 WIB (Tanpa Manusia)</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Buka menu <strong>Super Admin &rarr; Backend Daemon</strong>, lalu tekan tombol <em>"Uji Simulasi Cut-off 07:15 WIB"</em>. Saksikan penarikan socket port 4370 dan pemilahan 480 siswa secara otomatis.
                  </p>
                  <button
                    onClick={() => {
                      setCurrentRole('SUPER_ADMIN');
                      onClose();
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 pt-1"
                  >
                    <span>Buka Panel Backend Daemon</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Step 2 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                      Langkah 02 • Lobby Display
                    </span>
                    <Tv className="w-4 h-4 text-indigo-600" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Buka Layar Kiosk Gerbang / TV Lobby</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Jalankan mode Kiosk Layar Penuh pada monitor/TV di gerbang sekolah. Siswa yang tap sidik jari akan disambut dengan audio suara dan kartu foto presensi besar.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenKiosk();
                    }}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 pt-1"
                  >
                    <span>Luncurkan Layar Kiosk Sekarang</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Step 3 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                      Langkah 03 • Pengujian Notifikasi
                    </span>
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Uji Kirim WhatsApp Riil ke Ponsel</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Gunakan tab <strong>"Uji Kirim WA ke Nomor Sendiri"</strong> di atas. Masukkan nomor WhatsApp penguji untuk menerima pesan format resmi kehadiran secara nyata.
                  </p>
                  <button
                    onClick={() => setActiveSubTab('wa_test')}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 pt-1"
                  >
                    <span>Tes Kirim WA Sekarang</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Step 4 */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      Langkah 04 • Pengalaman Wali Murid
                    </span>
                    <Smartphone className="w-4 h-4 text-purple-600" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">Beralih ke Portal HP Orang Tua</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Klik tombol <strong>"Orang Tua (Hp)"</strong> pada header atas untuk melihat tampilan mobile orang tua, kalender kehadiran anak, dan fitur pengajuan surat izin sakit online.
                  </p>
                  <button
                    onClick={() => {
                      setCurrentRole('PARENT');
                      onClose();
                    }}
                    className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1 pt-1"
                  >
                    <span>Buka Tampilan Orang Tua (Hp)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

              {/* Step 5 Banner */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-400">Langkah 05 • Laporan Resmi</span>
                  <h4 className="font-black text-sm text-white">Ekspor Laporan Excel & PDF Kemenag/Kemendikbud</h4>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    Buka tab <strong>Sinkronisasi Excel</strong> di menu Admin untuk mengunduh rekap kehadiran bulanan lengkap dengan kop resmi sekolah.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setCurrentRole('ADMIN');
                    onClose();
                  }}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl shadow shrink-0"
                >
                  Buka Rekap Excel
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: CUSTOMIZE SCHOOL IDENTITY */}
          {activeSubTab === 'customize' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Sesuaikan Identitas Sekolah untuk Uji Coba Konsumen
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ubah nama sekolah ini agar sesuai dengan instansi yang sedang menguji aplikasi. Perubahan akan langsung tampil di seluruh dashboard, kop surat, dan pesan WhatsApp.
                </p>
              </div>

              {profileSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Identitas sekolah berhasil diperbarui untuk uji coba!</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Resmi Sekolah / Yayasan
                  </label>
                  <input
                    type="text"
                    value={customSchoolName}
                    onChange={(e) => setCustomSchoolName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Contoh: SMP NEGERI 1 BINTANG BANGSA / SMA ISLAM AL-AZHAR"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Kepala Sekolah
                    </label>
                    <input
                      type="text"
                      value={customPrincipal}
                      onChange={(e) => setCustomPrincipal(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Drs. H. Mulyadi, M.Pd"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      NIP Kepala Sekolah
                    </label>
                    <input
                      type="text"
                      value={customNip}
                      onChange={(e) => setCustomNip(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="19720415 199802 1 002"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kota / Wilayah Sekolah
                  </label>
                  <input
                    type="text"
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Contoh: Kota Surabaya, Jawa Timur"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Terapkan Identitas Sekolah</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: WA TESTER DIRECT TO TESTER'S PHONE */}
          {activeSubTab === 'wa_test' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Uji Kirim WhatsApp Riil ke Nomor Ponsel Penguji
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Masukkan nomor WhatsApp pribadi Anda atau calon klien untuk melihat langsung bagaimana pesan notifikasi tiba di HP orang tua.
                </p>
              </div>

              {waSentSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Jendela WhatsApp Web/App telah terbuka untuk mengirimkan pesan contoh!</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nomor WhatsApp Penerima (HP Anda / Konsumen)
                    </label>
                    <input
                      type="tel"
                      value={testPhoneNumber}
                      onChange={(e) => setTestPhoneNumber(e.target.value)}
                      placeholder="Contoh: 081234567890 atau 6281234567890"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      Kosongkan jika ingin memakai nomor wali bawaan dari siswa terpilih.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pilih Siswa Contoh (Dari 480 Siswa)
                    </label>
                    <select
                      value={testStudentId}
                      onChange={(e) => setTestStudentId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                    >
                      {students.slice(0, 15).map(s => (
                        <option key={s.id} value={s.id}>
                          {s.pin} - {s.name} ({s.class})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Simulasikan Kategori Status
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setTestStatus('HADIR_TEPAT')}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          testStatus === 'HADIR_TEPAT' 
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-400/30' 
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        Hadir Tepat
                      </button>

                      <button
                        type="button"
                        onClick={() => setTestStatus('TERLAMBAT')}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          testStatus === 'TERLAMBAT' 
                            ? 'bg-amber-50 border-amber-400 text-amber-800 ring-2 ring-amber-400/30' 
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        Terlambat
                      </button>

                      <button
                        type="button"
                        onClick={() => setTestStatus('TIDAK_HADIR')}
                        className={`p-2 rounded-xl text-xs font-bold border transition-all text-center ${
                          testStatus === 'TIDAK_HADIR' 
                            ? 'bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-400/30' 
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        Tidak Hadir
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleTestWhatsAppDirect}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Buka & Kirim Pesan Contoh via WhatsApp</span>
                  </button>
                </div>

                {/* Preview Pesan */}
                <div className="bg-emerald-950/90 text-emerald-100 p-4 rounded-2xl border border-emerald-800 font-mono text-xs space-y-2 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-sans font-bold">
                      Pratinjau Pesan yang Diterima Orang Tua:
                    </span>
                    <div className="mt-2 p-3 bg-black/40 rounded-xl whitespace-pre-wrap leading-relaxed border border-emerald-900/60 text-[11px]">
                      {testStatus === 'HADIR_TEPAT' && (
                        `*NOTIFIKASI KEHADIRAN SISWA*\n*${customSchoolName}*\n\nYth. Bapak/Ibu Wali dari *${selectedStudentForTest.name}*,\n\nAlhamdulillah, ananda telah tiba di sekolah dan melakukan presensi sidik jari dengan *TEPAT WAKTU*:\n\n📅 Waktu: 06:42 WIB\n🏫 Kelas: ${selectedStudentForTest.class}\n✅ Status: Hadir Tepat Waktu\n\nTerima kasih atas disiplin Ayah/Bunda di rumah.`
                      )}
                      {testStatus === 'TERLAMBAT' && (
                        `*PEMBERITAHUAN KETERLAMBATAN SISWA*\n*${customSchoolName}*\n\nYth. Bapak/Ibu Wali dari *${selectedStudentForTest.name}*,\n\nKami menginformasikan bahwa ananda tiba di sekolah:\n\n📅 Waktu: 07:08 WIB\n⚠️ Status: *TERLAMBAT (8 Menit)*\n🏫 Kelas: ${selectedStudentForTest.class}\n\nMohon bantuannya mendampingi ananda agar berangkat lebih awal esok hari.`
                      )}
                      {testStatus === 'TIDAK_HADIR' && (
                        `*KONFIRMASI KETIDAKHADIRAN SISWA*\n*${customSchoolName}*\n\nYth. Bapak/Ibu Wali dari *${selectedStudentForTest.name}*,\n\nHingga batas masuk (07:15 WIB), ananda tercatat *BELUM MELAKUKAN PRESENSI* di sekolah.\n\nBila ananda sakit/izin, mohon konfirmasi ke Guru Piket.`
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-sans">
                    ✓ Otomatis terkirim tanpa klik manual pada jam 07:15 WIB.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EXECUTIVE PROPOSAL & TECHNICAL SPECIFICATIONS */}
          {activeSubTab === 'proposal' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Brosur Eksekutif & Ringkasan Spesifikasi Teknis
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dokumen resmi ringkas yang dapat dicetak (*print*) untuk diajukan ke Kepala Sekolah atau Dewan Yayasan.
                  </p>
                </div>
                <button
                  onClick={handlePrintProposal}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Dokumen</span>
                </button>
              </div>

              {/* Formal Letter Content */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-4 text-slate-800 leading-relaxed font-sans">
                <div className="text-center border-b border-slate-300 pb-3">
                  <h2 className="text-base font-black uppercase tracking-wide text-slate-900">
                    SISTEM PRESENSI BIOMETRIK CLOUD & NOTIFIKASI OTOMATIS
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    Integrasi Hardware BioFinger AT-101 (TCP/IP Port 4370) • Kapasitas 480 Siswa
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Target Siswa</span>
                    <p className="font-bold text-sm text-slate-900">480 Siswa (12 Rombel)</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Metode Kerja</span>
                    <p className="font-bold text-sm text-slate-900">100% Otomatis (Cron 07:15 WIB)</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Notifikasi</span>
                    <p className="font-bold text-sm text-slate-900">WhatsApp & Webhook Portal</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Nilai Manfaat Utama bagi Sekolah:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    <li><strong>Bebas Campur Tangan Manusia:</strong> Skrip latar belakang menarik log mesin presensi tepat pada jam cut-off tanpa perlu operator mengklik tombol apa pun.</li>
                    <li><strong>Pencegahan Duplikasi Scan:</strong> Algoritma deduplikasi cerdas otomatis memilih tap terawal siswa, mengeliminasi dobel scan karena iseng.</li>
                    <li><strong>Deteksi Alpa Cepat:</strong> Siswa yang tidak tap hingga jam 07:15 WIB langsung ditetapkan Tidak Hadir dan orang tua seketika dikabari agar tidak terjadi kasus siswa membolos.</li>
                    <li><strong>Anti Banned WhatsApp:</strong> Dilengkapi antrean pengiriman (*queue worker*) dengan jeda 1.5 detik per pesan agar nomor sekolah aman dari pemblokiran Meta/WhatsApp.</li>
                    <li><strong>Efisiensi Anggaran:</strong> Mengurangi 100% biaya kertas absen manual dan meningkatkan kepercayaan wali murid terhadap pengawasan sekolah.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sistem Telah Tervalidasi & Siap Dipakai untuk Uji Coba Lapangan</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition-all"
          >
            Tutup Panduan
          </button>
        </div>

      </div>
    </div>
  );
};
