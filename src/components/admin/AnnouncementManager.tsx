import React, { useState, useMemo } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { SchoolAnnouncement } from '../../types';
import { CLASSES } from '../../data/mockStudents';
import { 
  Bell, 
  Plus, 
  Edit3, 
  Trash2, 
  Pin, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Users, 
  ShieldAlert, 
  Sparkles, 
  Send, 
  FileText,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const AnnouncementManager: React.FC = () => {
  const { 
    announcements, 
    addAnnouncement, 
    updateAnnouncement, 
    deleteAnnouncement,
    currentUser,
    currentRole 
  } = useAttendance();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Modal State (Create & Edit)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<SchoolAnnouncement | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formCategory, setFormCategory] = useState<SchoolAnnouncement['category']>('UMUM');
  const [formPriority, setFormPriority] = useState<'NORMAL' | 'PENTING'>('NORMAL');
  const [formTargetClass, setFormTargetClass] = useState<string>('SEMUA');
  const [formAuthorName, setFormAuthorName] = useState<string>('');
  const [formAuthorRole, setFormAuthorRole] = useState<string>('');
  const [formContent, setFormContent] = useState<string>('');
  const [formPinned, setFormPinned] = useState<boolean>(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingAnnouncement(null);
    setFormTitle('');
    setFormCategory('UMUM');
    setFormPriority('NORMAL');
    setFormTargetClass('SEMUA');
    setFormAuthorName(currentUser?.name || (currentRole === 'SUPER_ADMIN' ? 'Ahmad Syarifuddin, M.Pd.' : 'Siti Rahmawati, S.Pd.'));
    setFormAuthorRole(currentRole === 'SUPER_ADMIN' ? 'Kepala MTs Nurus Salam' : 'Guru Piket / Kesiswaan');
    setFormContent('');
    setFormPinned(false);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (ann: SchoolAnnouncement) => {
    setEditingAnnouncement(ann);
    setFormTitle(ann.title);
    setFormCategory(ann.category);
    setFormPriority(ann.priority);
    setFormTargetClass(ann.targetClass);
    setFormAuthorName(ann.authorName);
    setFormAuthorRole(ann.authorRole);
    setFormContent(ann.content);
    setFormPinned(ann.pinned || false);
    setIsModalOpen(true);
  };

  // Quick Template Helpers
  const applyTemplate = (type: 'PTS' | 'LIBUR' | 'RAPAT' | 'PHBI') => {
    if (type === 'PTS') {
      setFormTitle('Pemberitahuan Penilaian Tengah Semester (PTS) Genap TA 2026/2027');
      setFormCategory('UJIAN');
      setFormPriority('PENTING');
      setFormContent(`Assalamualaikum Wr. Wb.

Yth. Bapak/Ibu Wali Murid MTs Nurus Salam Gebog Kudus,

Diberitahukan bahwa pelaksanaan Penilaian Tengah Semester (PTS) Genap akan berlangsung mulai tanggal [TANGGAL].

Mohon kerja sama Bapak/Ibu sekalian untuk:
1. Memastikan ananda hadir tepat waktu sebelum pukul 06.45 WIB dan melakukan scan sidik jari di mesin BIO Finger AT-101.
2. Memastikan ananda belajar dengan baik di rumah dan menjaga kesehatan.
3. Membawa perlengkapan alat tulis lengkap dan kartu tanda peserta ujian.

Wassalamualaikum Wr. Wb.`);
    } else if (type === 'LIBUR') {
      setFormTitle('Pemberitahuan Libur Resmi Pembelajaran & Hari Raya');
      setFormCategory('LIBUR');
      setFormPriority('NORMAL');
      setFormContent(`Assalamualaikum Wr. Wb.

Berdasarkan kalender akademik MTs Nurus Salam Gebog Kudus, disampaikan bahwa kegiatan belajar mengajar diliburkan pada:

Hari, Tanggal: [HARI, TANGGAL] s/d [HARI, TANGGAL]
Keterangan: Libur Resmi / Peringatan Hari Besar

Kegiatan pembelajaran aktif kembali pada [HARI, TANGGAL] dengan jam masuk normal pukul 06.45 WIB.

Wassalamualaikum Wr. Wb.`);
    } else if (type === 'RAPAT') {
      setFormTitle('Undangan Rapat Koordinasi Bersama Pengurus Komite & Wali Murid');
      setFormCategory('RAPAT');
      setFormPriority('PENTING');
      setFormContent(`Assalamualaikum Wr. Wb.

Mengharap kehadiran Bapak/Ibu Wali Murid MTs Nurus Salam pada pertemuan koordinasi:

Hari / Tanggal: [HARI, TANGGAL]
Waktu: Pukul 08.30 WIB - Selesai
Tempat: Aula Utama MTs Nurus Salam Gebog Kudus
Agenda: Evaluasi Pembelajaran & Sosialisasi Program Madrasah

Kehadiran Bapak/Ibu sangat kami harapkan demi kemajuan putra-putri kita.

Wassalamualaikum Wr. Wb.`);
    } else if (type === 'PHBI') {
      setFormTitle('Peringatan Hari Besar Islam (PHBI) & Pengajian Akbar Madrasah');
      setFormCategory('PHBI');
      setFormPriority('NORMAL');
      setFormContent(`Assalamualaikum Wr. Wb.

Dalam rangka memperingati Hari Besar Islam, keluarga besar MTs Nurus Salam Gebog Kudus mengundang Bapak/Ibu Wali Murid dan seluruh santri untuk hadir pada acara:

Hari, Tanggal: [HARI, TANGGAL]
Waktu: Pukul 07.30 WIB - 11.00 WIB
Tempat: Halaman & Masjid MTs Nurus Salam
Penceramah: [NAMA PENCERAMAH]

Seluruh santri/siswa tetap melakukan presensi sidik jari pada mesin BIO Finger AT-101.

Wassalamualaikum Wr. Wb.`);
    }
  };

  // Submit Form (Create or Edit)
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) return;

    let finalContent = formContent.trim();
    if (!finalContent.toLowerCase().startsWith('assalamualaikum')) {
      finalContent = `Assalamualaikum Wr. Wb.\n\n${finalContent}`;
    }

    if (editingAnnouncement) {
      updateAnnouncement(editingAnnouncement.id, {
        title: formTitle.trim(),
        category: formCategory,
        priority: formPriority,
        targetClass: formTargetClass,
        authorName: formAuthorName.trim() || 'Pihak MTs Nurus Salam',
        authorRole: formAuthorRole.trim() || 'Admin Madrasah',
        content: finalContent,
        pinned: formPinned
      });
      setNoticeMessage(`Pengumuman "${formTitle}" berhasil diperbarui!`);
    } else {
      addAnnouncement({
        title: formTitle.trim(),
        category: formCategory,
        priority: formPriority,
        targetClass: formTargetClass,
        authorName: formAuthorName.trim() || 'Pihak MTs Nurus Salam',
        authorRole: formAuthorRole.trim() || 'Admin Madrasah',
        content: finalContent,
        pinned: formPinned
      });
      setNoticeMessage(`Pengumuman "${formTitle}" berhasil diterbitkan ke semua akun!`);
    }

    setIsModalOpen(false);
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  // Delete Handler
  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Yakin ingin menghapus pengumuman "${title}"? Tindakan ini tidak dapat dibatalkan.`)) {
      deleteAnnouncement(id);
      setNoticeMessage(`Pengumuman berhasil dihapus.`);
      setTimeout(() => setNoticeMessage(null), 3000);
    }
  };

  // Filtered Announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements
      .filter(ann => {
        const matchSearch = searchQuery.trim() === '' || 
          ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ann.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ann.authorName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCategory = categoryFilter === 'ALL' || ann.category === categoryFilter;
        const matchPriority = priorityFilter === 'ALL' || ann.priority === priorityFilter;
        return matchSearch && matchCategory && matchPriority;
      })
      .sort((a, b) => {
        // Pinned first, then date descending
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      });
  }, [announcements, searchQuery, categoryFilter, priorityFilter]);

  const getCategoryBadge = (cat: SchoolAnnouncement['category']) => {
    switch (cat) {
      case 'UJIAN':
        return { label: 'Ujian / Asesmen', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'LIBUR':
        return { label: 'Libur Madrasah', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'RAPAT':
        return { label: 'Rapat Wali Murid', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'PHBI':
        return { label: 'Peringatan Hari Besar', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'KEGIATAN':
        return { label: 'Kegiatan Siswa', bg: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
      default:
        return { label: 'Informasi Umum', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Banner & Action */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
              Pusat Informasi Madrasah
            </span>
            <span className="text-xs text-blue-200 font-semibold">• MTs Nurus Salam Gebog Kudus</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black mt-1">Manajemen Pengumuman Resmi Madrasah</h2>
          <p className="text-xs text-blue-200 mt-1 max-w-xl leading-relaxed">
            Admin dan Super Admin dapat membuat, mengedit, dan menghapus pengumuman. Pengumuman otomatis disiarkan langsung ke seluruh akun aplikasi wali murid secara real-time.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Buat Pengumuman Baru</span>
        </button>
      </div>

      {noticeMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-2xl text-xs flex items-center gap-2 animate-fade-in shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{noticeMessage}</span>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Pengumuman</span>
          <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{announcements.length}</p>
          <span className="text-[11px] text-slate-500 font-medium">Tersimpan di Sistem</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">Prioritas Penting</span>
          <p className="text-2xl font-black text-rose-600 mt-1 font-mono">
            {announcements.filter(a => a.priority === 'PENTING').length}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Wajib Diketahui Ortu</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Target Semua Kelas</span>
          <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">
            {announcements.filter(a => a.targetClass === 'SEMUA').length}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">480 Santri / Siswa</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">Disematkan (Pin)</span>
          <p className="text-2xl font-black text-blue-700 mt-1 font-mono">
            {announcements.filter(a => a.pinned).length}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">Muncul di Paling Atas</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari pengumuman berdasarkan judul, isi pesan, atau pembuat..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-xs p-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Kategori</option>
              <option value="UJIAN">Ujian / Asesmen</option>
              <option value="LIBUR">Libur Madrasah</option>
              <option value="RAPAT">Rapat Wali Murid</option>
              <option value="PHBI">Hari Besar Islam</option>
              <option value="KEGIATAN">Kegiatan Ekstra</option>
              <option value="UMUM">Informasi Umum</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs p-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Prioritas</option>
              <option value="PENTING">Sangat Penting</option>
              <option value="NORMAL">Normal</option>
            </select>
          </div>
        </div>
      </div>

      {/* List of Announcements */}
      <div className="space-y-3">
        {filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-200 space-y-2">
            <Bell className="w-10 h-10 mx-auto text-slate-300 stroke-[1.5]" />
            <p className="text-sm font-bold text-slate-700">Tidak ada pengumuman yang sesuai.</p>
            <p className="text-xs text-slate-400">Silakan sesuaikan filter pencarian atau buat pengumuman baru.</p>
          </div>
        ) : (
          filteredAnnouncements.map((ann) => {
            const catBadge = getCategoryBadge(ann.category);
            const isExpanded = expandedId === ann.id;
            return (
              <div
                key={ann.id}
                className={`bg-white rounded-2xl border p-4 transition-all shadow-xs space-y-3 ${
                  ann.pinned ? 'border-amber-300 bg-amber-50/20' : 'border-slate-200'
                }`}
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {ann.pinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full shadow-2xs">
                        <Pin className="w-3 h-3 fill-slate-950" />
                        Disematkan
                      </span>
                    )}

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${catBadge.bg}`}>
                      {catBadge.label}
                    </span>

                    {ann.priority === 'PENTING' && (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                        PENTING
                      </span>
                    )}

                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                      Target: {ann.targetClass === 'SEMUA' ? 'Semua Kelas' : ann.targetClass}
                    </span>
                  </div>

                  {/* Actions: Edit & Delete (Admin Only) */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(ann)}
                      className="px-2.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
                      title="Edit isi pengumuman ini"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(ann.id, ann.title)}
                      className="px-2.5 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1 shadow-2xs"
                      title="Hapus pengumuman ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>

                {/* Title & Metadata */}
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {ann.title}
                  </h3>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {ann.publishedAt}
                    </span>
                    <span>•</span>
                    <span className="text-slate-700 font-semibold">
                      Oleh: {ann.authorName} ({ann.authorRole})
                    </span>
                  </div>
                </div>

                {/* Content text */}
                <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-700 border border-slate-100 leading-relaxed font-sans">
                  <p className={`whitespace-pre-line ${!isExpanded ? 'line-clamp-3' : ''}`}>
                    {ann.content}
                  </p>
                  {ann.content.length > 200 && (
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : ann.id)}
                      className="text-blue-600 hover:text-blue-800 font-bold text-[11px] mt-2 inline-flex items-center gap-1"
                    >
                      <span>{isExpanded ? 'Tampilkan Lebih Sedikit' : 'Baca Selengkapnya...'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL BUAT / EDIT PENGUMUMAN */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl w-full max-w-2xl p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Bell className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingAnnouncement ? 'Edit Pengumuman Madrasah' : 'Buat & Siarkan Pengumuman Baru'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Otomatis diterima oleh akun aplikasi orang tua dan siswa MTs Nurus Salam.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Quick Templates */}
            {!editingAnnouncement && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2 text-xs">
                <span className="font-bold text-blue-900 flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>Gunakan Format Cepat (Template Resmi):</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyTemplate('PTS')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-100 text-blue-900 font-semibold border border-blue-200 text-[11px] transition-all"
                  >
                    Ujian / PTS
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('RAPAT')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-purple-100 text-purple-900 font-semibold border border-purple-200 text-[11px] transition-all"
                  >
                    Rapat Wali Murid
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('PHBI')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-100 text-emerald-900 font-semibold border border-emerald-200 text-[11px] transition-all"
                  >
                    Hari Besar Islam
                  </button>
                  <button
                    type="button"
                    onClick={() => applyTemplate('LIBUR')}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 text-amber-900 font-semibold border border-amber-200 text-[11px] transition-all"
                  >
                    Libur Madrasah
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Judul Pengumuman:
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Contoh: Jadwal Penilaian Tengah Semester (PTS) Genap 2026/2027"
                  required
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kategori:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white text-xs"
                  >
                    <option value="UMUM">Informasi Umum</option>
                    <option value="UJIAN">Ujian / Asesmen</option>
                    <option value="LIBUR">Libur Madrasah</option>
                    <option value="RAPAT">Rapat Wali Murid</option>
                    <option value="PHBI">Hari Besar Islam</option>
                    <option value="KEGIATAN">Kegiatan Ekstra</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Prioritas:</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as any)}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white text-xs"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="PENTING">Sangat Penting (PENTING)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Target Kelas:</label>
                  <select
                    value={formTargetClass}
                    onChange={(e) => setFormTargetClass(e.target.value)}
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white text-xs"
                  >
                    <option value="SEMUA">Semua Kelas (480 Siswa)</option>
                    {CLASSES.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nama Pembuat / Penanda Tangan:</label>
                  <input
                    type="text"
                    value={formAuthorName}
                    onChange={(e) => setFormAuthorName(e.target.value)}
                    placeholder="Nama Kepala / Guru"
                    required
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jabatan:</label>
                  <input
                    type="text"
                    value={formAuthorRole}
                    onChange={(e) => setFormAuthorRole(e.target.value)}
                    placeholder="Contoh: Kepala MTs Nurus Salam"
                    required
                    className="w-full p-2 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Isi Lengkap Pengumuman (Wajib diawali Assalamualaikum):
                </label>
                <textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  rows={7}
                  placeholder="Ketik isi pengumuman madrasah secara lengkap..."
                  required
                  className="w-full p-3 rounded-xl bg-slate-50 border border-slate-300 focus:bg-white text-xs font-sans leading-relaxed text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="pinCheckbox"
                  checked={formPinned}
                  onChange={(e) => setFormPinned(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="pinCheckbox" className="font-bold text-slate-800 cursor-pointer text-xs">
                  Sematkan Pengumuman ini di Baris Teratas (Pin Announcement)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all text-xs"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md flex items-center gap-1.5 text-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>{editingAnnouncement ? 'Simpan Perubahan' : 'Terbitkan Pengumuman'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
