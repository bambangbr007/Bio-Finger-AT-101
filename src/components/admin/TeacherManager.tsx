import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { Teacher } from '../../types';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Fingerprint, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Briefcase,
  X
} from 'lucide-react';

interface TeacherManagerProps {
  onTriggerEnrollment?: (teacher: Teacher) => void;
}

export const TeacherManager: React.FC<TeacherManagerProps> = ({ onTriggerEnrollment }) => {
  const { teachers, addTeacher, deleteTeacher } = useAttendance();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);

  // Form state
  const [name, setName] = useState<string>('');
  const [nip, setNip] = useState<string>('');
  const [roleTitle, setRoleTitle] = useState<string>('');
  const [classAssigned, setClassAssigned] = useState<string>('-');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [formMsg, setFormMsg] = useState<{ type: 'SUCCESS' | 'ERROR'; text: string } | null>(null);

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.nip.includes(searchQuery) ||
    t.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.pin.includes(searchQuery)
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    const res = addTeacher({
      name: name.trim(),
      nip: nip.trim() || `199${Math.floor(100000000000000 + Math.random() * 900000000000000)}`,
      roleTitle: roleTitle.trim() || 'Guru Mata Pelajaran',
      classAssigned: classAssigned.trim() || '-',
      phone: phone.replace(/\D/g, ''),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@sekolah.sch.id`,
      pin: pin.trim() || String(2000 + teachers.length + 1),
      fingerprintRegistered: false,
      avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}&backgroundColor=b6e3f4,c0aede`
    });

    if (res.success) {
      setFormMsg({ type: 'SUCCESS', text: res.message });
      // Reset form
      setName('');
      setNip('');
      setRoleTitle('');
      setClassAssigned('-');
      setPhone('');
      setEmail('');
      setPin('');
      setTimeout(() => {
        setFormMsg(null);
        setModalOpen(false);
      }, 1500);
    } else {
      setFormMsg({ type: 'ERROR', text: res.message });
    }
  };

  const confirmDelete = () => {
    if (!deletingTeacher) return;
    deleteTeacher(deletingTeacher.id);
    setDeletingTeacher(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden space-y-4">
      
      {/* Top Header */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base">Manajemen Dewan Guru & Staff Sekolah</h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {teachers.length} Guru Terdaftar
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Pengelolaan akun pendidik, wali kelas, piket, dan PIN presensi mesin BIO Finger AT-101
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Tambah Guru Baru</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama guru, NIP, PIN mesin, atau mata pelajaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Teachers Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px] border-y border-slate-200">
              <th className="py-3 px-4">Nama & NIP</th>
              <th className="py-3 px-3">Jabatan & Kelas Binaan</th>
              <th className="py-3 px-3">PIN Mesin AT-101</th>
              <th className="py-3 px-3">Kontak WhatsApp & Email</th>
              <th className="py-3 px-3">Status Biometrik</th>
              <th className="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                  Tidak ada guru yang cocok dengan pencarian.
                </td>
              </tr>
            ) : (
              filteredTeachers.map(teacher => (
                <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Name & Avatar */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={teacher.avatarUrl} 
                        alt={teacher.name}
                        className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 shrink-0"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{teacher.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">NIP: {teacher.nip}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role & Class */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1 font-semibold text-slate-800">
                      <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                      <span>{teacher.roleTitle}</span>
                    </div>
                    {teacher.classAssigned && teacher.classAssigned !== '-' && (
                      <span className="text-[10px] text-blue-600 font-medium">
                        Binaan: {teacher.classAssigned}
                      </span>
                    )}
                  </td>

                  {/* PIN Mesin */}
                  <td className="py-3 px-3 font-mono">
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      PIN: {teacher.pin}
                    </span>
                  </td>

                  {/* Contacts */}
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      <span>+{teacher.phone}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                      <Mail className="w-3 h-3" />
                      <span className="truncate max-w-[150px]">{teacher.email}</span>
                    </div>
                  </td>

                  {/* Biometric Status */}
                  <td className="py-3 px-3">
                    {teacher.fingerprintRegistered ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Terdaftar di AT-101
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        Belum Rekam Jari
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {onTriggerEnrollment && !teacher.fingerprintRegistered && (
                        <button
                          onClick={() => onTriggerEnrollment(teacher)}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-300 transition-colors flex items-center gap-1"
                          title="Rekam Sidik Jari Guru"
                        >
                          <Fingerprint className="w-3.5 h-3.5" />
                          <span>Rekam</span>
                        </button>
                      )}

                      <button
                        onClick={() => setDeletingTeacher(teacher)}
                        className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                        title="Hapus Guru"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Tambah Guru Baru */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl w-full max-w-lg p-5 shadow-2xl border border-slate-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-800">Tambah Data Guru / Staff Baru</h4>
              </div>
              <button 
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                formMsg.type === 'SUCCESS' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-rose-50 text-rose-800 border border-rose-300'
              }`}>
                {formMsg.type === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{formMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap Guru (beserta gelar):</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Dra. Hj. Ratna Sari, M.Pd."
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">NIP (Nomor Induk Pegawai):</label>
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="198501012010011001"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">PIN Mesin AT-101:</label>
                  <input
                    type="text"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder={`Otomatis: ${2000 + teachers.length + 1}`}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jabatan / Mata Pelajaran:</label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    placeholder="Guru Matematika / Piket"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kelas Binaan / Tugas:</label>
                  <input
                    type="text"
                    value={classAssigned}
                    onChange={(e) => setClassAssigned(e.target.value)}
                    placeholder="Kelas 7A / Piket Pagi"
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">No. WhatsApp Resmi:</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="628123456789"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email:</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="guru@sekolah.sch.id"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20"
                >
                  Simpan Data Guru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Hapus Guru Confirmation */}
      {deletingTeacher && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-sm text-slate-800 flex items-center gap-2 text-rose-700">
              <Trash2 className="w-5 h-5 text-rose-600" />
              <span>Konfirmasi Hapus Guru</span>
            </h4>
            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus data pendidik <strong>{deletingTeacher.name}</strong> (PIN: {deletingTeacher.pin})?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingTeacher(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={confirmDelete}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20"
              >
                Ya, Hapus Guru
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
