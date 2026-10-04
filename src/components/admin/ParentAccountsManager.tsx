import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { ParentAccount } from '../../types';
import { 
  Users, 
  Key, 
  MessageSquare, 
  Search, 
  Filter, 
  RefreshCw, 
  ExternalLink, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  UserPlus, 
  Phone, 
  Clock, 
  GraduationCap, 
  Copy,
  Check
} from 'lucide-react';
import { generateDirectWhatsAppUrl } from '../../utils/whatsappHelper';

export const ParentAccountsManager: React.FC = () => {
  const { 
    parentAccounts, 
    resetParentPassword, 
    sendMessageToParent, 
    students,
    registerParentAccount,
    currentRole,
    schoolParentMessages,
    markAllStudentMessagesAsRead
  } = useAttendance();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal: Reset Password
  const [resetModalAccount, setResetModalAccount] = useState<ParentAccount | null>(null);
  const [customNewPassword, setCustomNewPassword] = useState<string>('');
  const [resetSuccessNotice, setResetSuccessNotice] = useState<string | null>(null);

  // Modal: Hubungi / Kirim Pesan ke Orang Tua
  const [messageModalAccount, setMessageModalAccount] = useState<ParentAccount | null>(null);
  const [messageSubject, setMessageSubject] = useState<string>('');
  const [messageContent, setMessageContent] = useState<string>('');
  const [messageChannel, setMessageChannel] = useState<'APP' | 'WHATSAPP' | 'BOTH'>('BOTH');
  const [messageSuccessNotice, setMessageSuccessNotice] = useState<string | null>(null);

  // Modal: Pendaftaran Akun Manual oleh Admin
  const [addAccountModalOpen, setAddAccountModalOpen] = useState<boolean>(false);
  const [newParentName, setNewParentName] = useState<string>('');
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [newStudentClass, setNewStudentClass] = useState<string>('Kelas 7A');
  const [newPhone, setNewPhone] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('wali123');
  const [addAccountNotice, setAddAccountNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter accounts
  const filteredAccounts = parentAccounts.filter(acc => {
    const q = searchQuery.toLowerCase();
    const matchQuery = 
      acc.studentName.toLowerCase().includes(q) || 
      acc.parentName.toLowerCase().includes(q) || 
      acc.whatsappPhone.includes(q) ||
      acc.studentClass.toLowerCase().includes(q);

    const matchClass = selectedClass === 'ALL' || acc.studentClass === selectedClass;

    return matchQuery && matchClass;
  });

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Preset Template Pesan Resmi (Semua DIAWALI dengan Assalamualaikum Wr. Wb.)
  const applyMessageTemplate = (type: 'RESET' | 'ATTENDANCE' | 'PERMISSION' | 'INVITATION' | 'CUSTOM', acc: ParentAccount) => {
    switch (type) {
      case 'RESET':
        setMessageSubject('Informasi Reset Kredensial Akun Wali Murid');
        setMessageContent(
          `Assalamualaikum Wr. Wb.\n\nYth. Bapak/Ibu ${acc.parentName}, Wali dari ananda ${acc.studentName} (${acc.studentClass}).\n\nMenindaklanjuti permohonan Bapak/Ibu, berikut kami sampaikan kredensial akun aplikasi presensi ananda di MTs Nurus Salam Gebog Kudus:\n\n- Username: ${acc.studentName}\n- Password: ${acc.password}\n\nSilakan masuk kembali ke aplikasi dengan kredensial di atas. Jika membutuhkan bantuan lebih lanjut, silakan hubungi Guru Piket.\n\nWassalamualaikum Wr. Wb.\nMTs Nurus Salam Gebog Kudus`
        );
        break;

      case 'ATTENDANCE':
        setMessageSubject('Laporan Perkembangan Kehadiran Ananda');
        setMessageContent(
          `Assalamualaikum Wr. Wb.\n\nYth. Bapak/Ibu ${acc.parentName}, Wali dari ananda ${acc.studentName} (${acc.studentClass}).\n\nKami menginformasikan bahwa data pemindaian sidik jari BIO Finger AT-101 ananda hari ini telah tersinkronkan dengan baik ke sistem madrasah. Terima kasih atas kerja sama Bapak/Ibu dalam membimbing kedisiplinan ananda.\n\nWassalamualaikum Wr. Wb.\nMTs Nurus Salam Gebog Kudus`
        );
        break;

      case 'PERMISSION':
        setMessageSubject('Konfirmasi Pengajuan Surat Izin / Sakit');
        setMessageContent(
          `Assalamualaikum Wr. Wb.\n\nYth. Bapak/Ibu ${acc.parentName}, Wali dari ananda ${acc.studentName} (${acc.studentClass}).\n\nSurat permohonan izin/sakit yang Bapak/Ibu ajukan melalui aplikasi untuk ananda ${acc.studentName} telah kami terima dan divalidasi oleh pihak sekolah. Semoga ananda lekas sehat dan dapat kembali beraktivitas.\n\nWassalamualaikum Wr. Wb.\nMTs Nurus Salam Gebog Kudus`
        );
        break;

      case 'INVITATION':
        setMessageSubject('Undangan Pertemuan Wali Murid MTs Nurus Salam');
        setMessageContent(
          `Assalamualaikum Wr. Wb.\n\nYth. Bapak/Ibu ${acc.parentName}, Wali dari ananda ${acc.studentName} (${acc.studentClass}).\n\nDengan hormat, kami mengundang kehadiran Bapak/Ibu dalam agenda silaturahmi dan pemaparan perkembangan akademik ananda di MTs Nurus Salam Gebog Kudus. Kehadiran Bapak/Ibu sangat berarti bagi kesuksesan belajar ananda.\n\nWassalamualaikum Wr. Wb.\nMTs Nurus Salam Gebog Kudus`
        );
        break;

      case 'CUSTOM':
      default:
        setMessageSubject('Pemberitahuan Resmi Madrasah');
        setMessageContent(
          `Assalamualaikum Wr. Wb.\n\nYth. Bapak/Ibu ${acc.parentName}, Wali dari ananda ${acc.studentName} (${acc.studentClass}).\n\n[Tuliskan pesan Anda di sini...]\n\nWassalamualaikum Wr. Wb.\nMTs Nurus Salam Gebog Kudus`
        );
        break;
    }
  };

  const handleExecuteReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalAccount) return;

    const res = resetParentPassword(resetModalAccount.id, customNewPassword);
    setResetSuccessNotice(`Password untuk ${resetModalAccount.studentName} berhasil direset menjadi "${res.newPassword}". Notifikasi telah dikirimkan.`);
    setCustomNewPassword('');
    setTimeout(() => {
      setResetSuccessNotice(null);
      setResetModalAccount(null);
    }, 2500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageModalAccount) return;

    if (!messageSubject.trim() || !messageContent.trim()) return;

    // Pastikan selalu diawali Assalamualaikum
    let finalContent = messageContent.trim();
    if (!finalContent.toLowerCase().startsWith('assalamualaikum')) {
      finalContent = `Assalamualaikum Wr. Wb.\n\n${finalContent}`;
    }

    sendMessageToParent({
      studentId: messageModalAccount.studentId,
      subject: messageSubject,
      content: finalContent,
      channel: messageChannel
    });

    setMessageSuccessNotice('Pesan resmi berhasil dikirimkan!');
    setTimeout(() => {
      setMessageSuccessNotice(null);
      setMessageModalAccount(null);
    }, 2000);
  };

  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddAccountNotice(null);

    if (!newParentName.trim() || !newStudentName.trim() || !newPhone.trim() || !newPassword.trim()) {
      setAddAccountNotice({ type: 'error', text: 'Semua kolom wajib diisi.' });
      return;
    }

    const res = registerParentAccount({
      parentName: newParentName,
      studentName: newStudentName,
      studentClass: newStudentClass,
      whatsappPhone: newPhone,
      password: newPassword
    });

    if (!res.success) {
      setAddAccountNotice({ type: 'error', text: res.message });
      return;
    }

    setAddAccountNotice({ type: 'success', text: `Akun untuk wali dari ${newStudentName} berhasil didaftarkan!` });
    setNewParentName('');
    setNewStudentName('');
    setNewPhone('');
    setNewPassword('wali123');
    setTimeout(() => {
      setAddAccountNotice(null);
      setAddAccountModalOpen(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-2xl p-6 text-white border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              {currentRole === 'SUPER_ADMIN' ? 'Super Admin Control' : 'Admin Guru Piket'}
            </span>
            <span className="text-xs text-slate-400">• MTs Nurus Salam Gebog Kudus</span>
          </div>
          <h2 className="text-xl font-black tracking-tight">
            Pengaturan Akun Orang Tua & Komunikasi Madrasah
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Kelola kredensial login wali murid (Username = Nama Anak), reset password lupa sandi, serta kirim pesan santun resmi berawalan salam ke aplikasi maupun WhatsApp.
          </p>
        </div>

        <button
          onClick={() => setAddAccountModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Akun Orang Tua</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Akun Terdaftar
          </span>
          <div className="text-2xl font-black text-slate-900">
            {parentAccounts.length}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-0.5 block">
            Wali Murid Terhubung
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Siswa Terdaftar
          </span>
          <div className="text-2xl font-black text-blue-600">
            {students.length}
          </div>
          <span className="text-[11px] text-slate-500 font-medium mt-0.5 block">
            BIO Finger AT-101
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Format Username
          </span>
          <div className="text-sm font-black text-slate-800 mt-1">
            Nama Lengkap Anak
          </div>
          <span className="text-[10px] text-indigo-600 font-semibold mt-1 block">
            Case-Insensitive
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Protokol Pesan
          </span>
          <div className="text-sm font-black text-emerald-700 mt-1">
            Resmi & Santun
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Wajib "Assalamualaikum"
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama anak (username), nama orang tua, no WhatsApp, atau kelas..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="text-xs p-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            >
              <option value="ALL">Semua Kelas ({parentAccounts.length})</option>
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
        </div>

        <div className="text-[11px] text-slate-500 flex items-center justify-between">
          <span>Menampilkan <strong>{filteredAccounts.length}</strong> akun orang tua</span>
          <span className="text-blue-600 font-semibold">*Klik ikon mata untuk melihat password atau tombol Reset jika orang tua lupa password</span>
        </div>
      </div>

      {/* Table of Parent Accounts */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Username (Nama Anak)</th>
                <th className="py-3 px-4">Nama Orang Tua / Wali</th>
                <th className="py-3 px-4">Kelas</th>
                <th className="py-3 px-4">No. WhatsApp</th>
                <th className="py-3 px-4">Password Saat Ini</th>
                <th className="py-3 px-4 text-center">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Tidak ditemukan akun orang tua yang sesuai dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => {
                  const isVisible = showPasswords[acc.id] || false;
                  const unreadParentMessages = schoolParentMessages.filter(m => m.studentId === acc.studentId && m.senderRole === 'PARENT' && !m.read);
                  const hasUnreadParentMsg = unreadParentMessages.length > 0;
                  return (
                    <tr key={acc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                            <GraduationCap className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block leading-tight">{acc.studentName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">ID: {acc.studentId}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-slate-800 font-semibold block">{acc.parentName}</span>
                        <span className="text-[10px] text-emerald-600 font-semibold">Wali Murid Resmi</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {acc.studentClass}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-700 font-bold">+{acc.whatsappPhone}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 font-mono">
                          <span className="bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200 text-slate-800 font-semibold min-w-[70px] text-center">
                            {isVisible ? acc.password : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(acc.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded transition-colors"
                            title={isVisible ? 'Sembunyikan password' : 'Lihat password'}
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(acc.password, acc.id)}
                            className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                            title="Salin password"
                          >
                            {copiedId === acc.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        {acc.lastResetAt && (
                          <span className="text-[9px] text-amber-700 block mt-0.5">
                            Direset: {acc.lastResetAt.slice(0, 10)}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Tombol Reset Password */}
                          <button
                            onClick={() => {
                              setResetModalAccount(acc);
                              setCustomNewPassword(`mts${Math.floor(100000 + Math.random() * 900000)}`);
                              setResetSuccessNotice(null);
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-[11px] transition-all flex items-center gap-1 shadow-2xs"
                            title="Reset password jika orang tua lupa"
                          >
                            <Key className="w-3.5 h-3.5 text-amber-600" />
                            <span>Reset Sandi</span>
                          </button>

                          {/* Tombol Hubungi / Balas Chat Orang Tua */}
                          <button
                            onClick={() => {
                              setMessageModalAccount(acc);
                              applyMessageTemplate('ATTENDANCE', acc);
                              setMessageSuccessNotice(null);
                              // Setelah chat dibuka dan dibaca, tandai selesai dibaca agar tombol kembali ke sediakala
                              markAllStudentMessagesAsRead(acc.studentId);
                            }}
                            className={`px-2.5 py-1.5 rounded-xl border font-bold text-[11px] transition-all flex items-center gap-1.5 shadow-2xs ${
                              hasUnreadParentMsg 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 ring-2 ring-blue-300' 
                                : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border-blue-300'
                            }`}
                            title={hasUnreadParentMsg ? 'Ada pesan baru dari orang tua! Klik untuk membaca & membalas' : 'Hubungi melalui Aplikasi atau WhatsApp'}
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>{hasUnreadParentMsg ? `Balas Chat (${unreadParentMessages.length})` : 'Hubungi'}</span>
                          </button>

                          {/* Tombol Langsung WhatsApp */}
                          <a
                            href={generateDirectWhatsAppUrl(
                              acc.whatsappPhone,
                              `*MTs Nurus Salam Gebog Kudus*\nAssalamualaikum Wr. Wb.\n\nYth. Bapak/Ibu ${acc.parentName}, Wali dari ananda ${acc.studentName} (${acc.studentClass}).\n\nKami dari pihak sekolah ingin menyampaikan informasi terkait ananda...`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition-all"
                            title="Buka WhatsApp langsung"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: RESET PASSWORD */}
      {resetModalAccount && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Reset Password Orang Tua</h3>
                  <p className="text-[11px] text-slate-500">Layanan lupa password bagi wali murid</p>
                </div>
              </div>
              <button
                onClick={() => setResetModalAccount(null)}
                className="w-7 h-7 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {resetSuccessNotice ? (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{resetSuccessNotice}</span>
              </div>
            ) : (
              <form onSubmit={handleExecuteReset} className="space-y-3.5 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Nama Wali:</span>
                    <strong className="text-slate-800">{resetModalAccount.parentName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Username Login (Anak):</span>
                    <strong className="text-blue-700 font-bold">{resetModalAccount.studentName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">No. WhatsApp:</span>
                    <span className="font-mono text-emerald-700 font-bold">+{resetModalAccount.whatsappPhone}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Password Baru:</label>
                    <button
                      type="button"
                      onClick={() => setCustomNewPassword(`mts${Math.floor(100000 + Math.random() * 900000)}`)}
                      className="text-[10px] text-blue-600 hover:underline font-bold flex items-center gap-1"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Generate Acak
                    </button>
                  </div>
                  <input
                    type="text"
                    value={customNewPassword}
                    onChange={(e) => setCustomNewPassword(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                  Pemberitahuan otomatis berawalan santun <strong>"Assalamualaikum Wr. Wb."</strong> berisi password baru akan langsung dikirimkan ke kotak masuk aplikasi orang tua.
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetModalAccount(null)}
                    className="w-1/2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all shadow-md shadow-amber-600/20"
                  >
                    Simpan & Notifikasi
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: HUBUNGI ORANG TUA / KIRIM PESAN DENGAN TEMPLATE SANTUN */}
      {messageModalAccount && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Kirim Pesan Resmi ke Orang Tua</h3>
                  <p className="text-[11px] text-slate-500">Wali dari ananda {messageModalAccount.studentName}</p>
                </div>
              </div>
              <button
                onClick={() => setMessageModalAccount(null)}
                className="w-7 h-7 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {messageSuccessNotice ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{messageSuccessNotice}</span>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-3.5 text-xs">
                {/* Riwayat Percakapan Interaktif Real-Time */}
                {(() => {
                  const history = schoolParentMessages.filter(m => m.studentId === messageModalAccount.studentId);
                  if (history.length === 0) return null;
                  return (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 border-b border-slate-200 pb-1.5">
                        <span>Riwayat Percakapan Langsung ({history.length} pesan)</span>
                        <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                          Tersinkronisasi Real-Time
                        </span>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {history.map(m => {
                          const isParent = m.senderRole === 'PARENT';
                          return (
                            <div key={m.id} className={`flex flex-col ${isParent ? 'items-start' : 'items-end'}`}>
                              <div className={`max-w-[90%] p-2.5 rounded-xl text-xs space-y-1 ${
                                isParent 
                                  ? 'bg-blue-50 border border-blue-200 text-blue-950' 
                                  : 'bg-emerald-600 text-white shadow-xs'
                              }`}>
                                <div className="flex items-center justify-between gap-2 text-[10px] opacity-80 border-b border-black/10 pb-0.5">
                                  <span className="font-bold">{isParent ? 'Wali Murid' : m.senderName}</span>
                                  <span className="font-mono text-[9px]">{m.sentAt.slice(11, 16)} WIB</span>
                                </div>
                                <p className="whitespace-pre-line text-[11px] leading-relaxed">{m.content}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Pilihan Template Santun */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    Pilih Template Resmi (Semua Diawali Assalamualaikum):
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyMessageTemplate('ATTENDANCE', messageModalAccount)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-[11px] font-semibold border border-slate-200 transition-all"
                    >
                      Presensi Siswa
                    </button>
                    <button
                      type="button"
                      onClick={() => applyMessageTemplate('RESET', messageModalAccount)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-amber-50 hover:text-amber-700 text-slate-700 text-[11px] font-semibold border border-slate-200 transition-all"
                    >
                      Bantuan Password
                    </button>
                    <button
                      type="button"
                      onClick={() => applyMessageTemplate('PERMISSION', messageModalAccount)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 text-[11px] font-semibold border border-slate-200 transition-all"
                    >
                      Konfirmasi Izin
                    </button>
                    <button
                      type="button"
                      onClick={() => applyMessageTemplate('INVITATION', messageModalAccount)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-[11px] font-semibold border border-slate-200 transition-all"
                    >
                      Undangan Madrasah
                    </button>
                  </div>
                </div>

                {/* Saluran Pengiriman */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kirim Melalui Saluran:</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setMessageChannel('APP')}
                      className={`p-2 rounded-xl text-center font-bold text-xs border transition-all ${
                        messageChannel === 'APP' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      Aplikasi Saja
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessageChannel('WHATSAPP')}
                      className={`p-2 rounded-xl text-center font-bold text-xs border transition-all ${
                        messageChannel === 'WHATSAPP' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      WhatsApp Saja
                    </button>
                    <button
                      type="button"
                      onClick={() => setMessageChannel('BOTH')}
                      className={`p-2 rounded-xl text-center font-bold text-xs border transition-all ${
                        messageChannel === 'BOTH' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      Keduanya (Rekomendasi)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Subjek / Judul Pesan:</label>
                  <input
                    type="text"
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Isi Pesan Santun:</label>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      Awali "Assalamualaikum Wr. Wb."
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans leading-relaxed text-xs"
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  {/* Tombol Langsung Kirim ke WA Eksternal jika dipilih */}
                  {(messageChannel === 'WHATSAPP' || messageChannel === 'BOTH') && (
                    <a
                      href={generateDirectWhatsAppUrl(
                        messageModalAccount.whatsappPhone,
                        `*MTs Nurus Salam Gebog Kudus*\n*${messageSubject}*\n\n${messageContent}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Buka WhatsApp</span>
                    </a>
                  )}

                  <button
                    type="submit"
                    className={`${(messageChannel === 'WHATSAPP' || messageChannel === 'BOTH') ? 'w-1/2' : 'w-full'} py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim ke Aplikasi</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: PENDAFTARAN MANUAL OLEH ADMIN */}
      {addAccountModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Tambah Akun Wali Murid Baru</h3>
                  <p className="text-[11px] text-slate-500">Pendaftaran manual oleh pihak tata usaha</p>
                </div>
              </div>
              <button
                onClick={() => setAddAccountModalOpen(false)}
                className="w-7 h-7 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {addAccountNotice && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                addAccountNotice.type === 'success' 
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-800' 
                  : 'bg-rose-50 border border-rose-300 text-rose-800'
              }`}>
                {addAccountNotice.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{addAccountNotice.text}</span>
              </div>
            )}

            <form onSubmit={handleAddAccountSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Lengkap Orang Tua / Wali:</label>
                <input
                  type="text"
                  value={newParentName}
                  onChange={(e) => setNewParentName(e.target.value)}
                  placeholder="Contoh: Drs. Harahap"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Nama Lengkap Anak (Siswa):</label>
                  <span className="text-[10px] text-emerald-700 font-bold">Username Login</span>
                </div>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Contoh: Ilham Puspitasari"
                  required
                  className="w-full p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/20 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kelas:</label>
                  <select
                    value={newStudentClass}
                    onChange={(e) => setNewStudentClass(e.target.value)}
                    className="w-full p-2 rounded-xl border border-slate-300 bg-slate-50"
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
                  <label className="font-bold text-slate-700 block mb-1">No. WhatsApp:</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="08123456789"
                    required
                    className="w-full p-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Password Akun:</label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 4 karakter"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md shadow-emerald-500/25 mt-2"
              >
                Daftarkan Akun Sekarang
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
