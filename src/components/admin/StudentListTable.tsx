import React, { useState, useMemo } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { CLASSES } from '../../data/mockStudents';
import { AttendanceStatus, Student } from '../../types';
import { 
  Search, 
  Filter, 
  Fingerprint, 
  Send, 
  Smartphone, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Clock, 
  MoreVertical,
  Edit,
  ExternalLink,
  Phone,
  Mail,
  UserPlus,
  Trash2,
  X
} from 'lucide-react';
import { generateDirectWhatsAppUrl } from '../../utils/whatsappHelper';

export const StudentListTable: React.FC = () => {
  const { 
    students, 
    attendanceRecords, 
    activeDate, 
    processBioFingerScan,
    updateAttendanceManual,
    setSelectedParentStudentId,
    setCurrentRole,
    schoolConfig,
    addStudent,
    deleteStudent
  } = useAttendance();

  const [search, setSearch] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  // Manual status modal state
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>('SAKIT');
  const [manualNote, setManualNote] = useState<string>('');

  // Add student modal state
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [newStudentClass, setNewStudentClass] = useState<string>('Kelas 7A');
  const [newStudentNisn, setNewStudentNisn] = useState<string>('');
  const [newStudentPin, setNewStudentPin] = useState<string>('');
  const [newStudentGender, setNewStudentGender] = useState<'L' | 'P'>('L');
  const [newStudentParent, setNewStudentParent] = useState<string>('');
  const [newStudentPhone, setNewStudentPhone] = useState<string>('');
  const [newStudentEmail, setNewStudentEmail] = useState<string>('');
  const [addMsg, setAddMsg] = useState<{ type: 'SUCCESS' | 'ERROR'; text: string } | null>(null);

  // Delete student confirmation
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);

  // Map attendance for quick lookup
  const attendanceMap = useMemo(() => {
    const map = new Map<string, any>();
    attendanceRecords
      .filter(r => r.date === activeDate)
      .forEach(r => map.set(r.studentId, r));
    return map;
  }, [attendanceRecords, activeDate]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // Class filter
      if (selectedClass !== 'ALL' && student.class !== selectedClass) return false;

      // Status filter
      const record = attendanceMap.get(student.id);
      const studentStatus = record ? record.status : 'BELUM_HADIR';
      if (selectedStatus !== 'ALL' && studentStatus !== selectedStatus) return false;

      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        return (
          student.name.toLowerCase().includes(query) ||
          student.pin.includes(query) ||
          student.nisn.includes(query) ||
          student.parentName.toLowerCase().includes(query) ||
          student.class.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [students, selectedClass, selectedStatus, search, attendanceMap]);

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / pageSize) || 1;
  const paginatedStudents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStudents.slice(start, start + pageSize);
  }, [filteredStudents, currentPage, pageSize]);

  const handleQuickScan = (pin: string) => {
    processBioFingerScan(pin);
  };

  const handleSaveManual = () => {
    if (!editingStudentId) return;
    updateAttendanceManual(editingStudentId, manualStatus, manualNote);
    setEditingStudentId(null);
    setManualNote('');
  };

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newStudentParent.trim() || !newStudentPhone.trim()) return;

    const res = addStudent({
      name: newStudentName.trim(),
      class: newStudentClass,
      nisn: newStudentNisn.trim() || `00${Math.floor(78000000 + Math.random() * 999999)}`,
      pin: newStudentPin.trim() || String(1000 + students.length + 1),
      gender: newStudentGender,
      parentName: newStudentParent.trim(),
      parentPhone: newStudentPhone.replace(/\D/g, ''),
      parentEmail: newStudentEmail.trim() || `wali.${newStudentName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      fingerprintRegistered: false,
      avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(newStudentName)}&backgroundColor=e2e8f0,b6e3f4,ffd5dc`
    });

    if (res.success) {
      setAddMsg({ type: 'SUCCESS', text: res.message });
      setNewStudentName('');
      setNewStudentNisn('');
      setNewStudentPin('');
      setNewStudentParent('');
      setNewStudentPhone('');
      setNewStudentEmail('');
      setTimeout(() => {
        setAddMsg(null);
        setAddModalOpen(false);
      }, 1500);
    } else {
      setAddMsg({ type: 'ERROR', text: res.message });
    }
  };

  const confirmDeleteStudent = () => {
    if (!deletingStudent) return;
    deleteStudent(deletingStudent.id);
    setDeletingStudent(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Table Header & Controls */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-800">
                Database Siswa & Monitoring Presensi
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {students.length} Siswa Terdaftar
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Menampilkan {filteredStudents.length} siswa sesuai filter aktif tanggal {activeDate}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setNewStudentPin(String(1000 + students.length + 1));
                setAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Tambah Siswa Baru</span>
            </button>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          {/* Search Box */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama siswa, PIN BioFinger, NISN, atau wali..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-white border border-slate-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Class Filter */}
          <div className="sm:col-span-4">
            <select
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-3 text-xs rounded-xl bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Semua Kelas (12 Rombel)</option>
              {CLASSES.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-3 text-xs rounded-xl bg-white border border-slate-300 text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Semua Status Presensi</option>
              <option value="HADIR_TEPAT">Hadir Tepat Waktu</option>
              <option value="TERLAMBAT">Terlambat</option>
              <option value="SAKIT">Sakit</option>
              <option value="IZIN">Izin</option>
              <option value="ALPHA">Alpha</option>
              <option value="BELUM_HADIR">Belum Hadir</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
              <th className="py-3 px-3.5">PIN & NISN</th>
              <th className="py-3 px-3">Nama Siswa & Kelas</th>
              <th className="py-3 px-3">Status Hari Ini</th>
              <th className="py-3 px-3">Jam Masuk / Pulang</th>
              <th className="py-3 px-3">Orang Tua & WhatsApp</th>
              <th className="py-3 px-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedStudents.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400">
                  Tidak ada data siswa yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              paginatedStudents.map(student => {
                const rec = attendanceMap.get(student.id);
                const status: AttendanceStatus = rec ? rec.status : 'BELUM_HADIR';

                return (
                  <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* PIN & NISN */}
                    <td className="py-2.5 px-3.5 font-mono">
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        PIN: {student.pin}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">NISN: {student.nisn}</p>
                    </td>

                    {/* Name & Class */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <img 
                          src={student.avatarUrl} 
                          alt={student.name} 
                          className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 shrink-0" 
                        />
                        <div>
                          <p className="font-bold text-slate-800">{student.name}</p>
                          <span className="text-[10px] text-slate-500 font-medium">
                            {student.class} • {student.gender === 'L' ? 'L' : 'P'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-2.5 px-3">
                      {status === 'HADIR_TEPAT' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" /> Tepat Waktu
                        </span>
                      )}
                      {status === 'TERLAMBAT' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                          <AlertTriangle className="w-3 h-3" /> Late {rec.lateMinutes || 0}m
                        </span>
                      )}
                      {status === 'SAKIT' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                          <HelpCircle className="w-3 h-3" /> Sakit
                        </span>
                      )}
                      {status === 'IZIN' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-800">
                          Izin
                        </span>
                      )}
                      {status === 'ALPHA' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800">
                          Alpha
                        </span>
                      )}
                      {status === 'BELUM_HADIR' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
                          <Clock className="w-3 h-3 text-slate-400" /> Belum Hadir
                        </span>
                      )}
                    </td>

                    {/* Check In / Out Time */}
                    <td className="py-2.5 px-3 font-mono">
                      <p className="text-slate-800 font-semibold">
                        In: {rec?.checkInTime || '--:--'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Out: {rec?.checkOutTime || '--:--'}
                      </p>
                    </td>

                    {/* Parent Contact */}
                    <td className="py-2.5 px-3">
                      <p className="font-semibold text-slate-700 truncate max-w-[140px]">{student.parentName}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>+{student.parentPhone}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center justify-center gap-1">
                        {/* Instant Scan Button */}
                        <button
                          onClick={() => handleQuickScan(student.pin)}
                          title="Simulasi Scan Mesin BioFinger AT-101"
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                        >
                          <Fingerprint className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Status Modal Trigger */}
                        <button
                          onClick={() => {
                            setEditingStudentId(student.id);
                            setManualStatus(rec?.status || 'SAKIT');
                            setManualNote(rec?.notes || '');
                          }}
                          title="Ubah Status Manual (Sakit / Izin)"
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* View in Parent Mobile View */}
                        <button
                          onClick={() => {
                            setSelectedParentStudentId(student.id);
                            setCurrentRole('PARENT');
                          }}
                          title="Lihat Tampilan HP Orang Tua"
                          className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                        </button>

                        {/* Direct WhatsApp Trigger */}
                        <a
                          href={generateDirectWhatsAppUrl(
                            student.parentPhone,
                            `Halo Bapak/Ibu ${student.parentName}, ini laporan presensi dari pihak sekolah terkait ananda ${student.name}.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Kirim Pesan WhatsApp Langsung"
                          className="p-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-600 hover:text-white transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </a>

                        {/* Delete Student Button */}
                        <button
                          onClick={() => setDeletingStudent(student)}
                          title="Hapus Siswa dari Database"
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div>
          Halaman {currentPage} dari {totalPages} ({filteredStudents.length} siswa)
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-2.5 py-1 rounded bg-white border border-slate-300 disabled:opacity-40 hover:bg-slate-100 text-slate-700"
          >
            Sebelumnya
          </button>

          <span className="px-2 font-semibold text-slate-800">
            {currentPage}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-2.5 py-1 rounded bg-white border border-slate-300 disabled:opacity-40 hover:bg-slate-100 text-slate-700"
          >
            Selanjutnya
          </button>
        </div>
      </div>

      {/* Modal: Tambah Siswa Baru */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl w-full max-w-lg p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-800">Tambah Siswa Baru ke Database</h4>
              </div>
              <button 
                onClick={() => setAddModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addMsg && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                addMsg.type === 'SUCCESS' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-rose-50 text-rose-800 border border-rose-300'
              }`}>
                {addMsg.type === 'SUCCESS' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                <span>{addMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleAddStudentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap Siswa:</label>
                <input
                  type="text"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="Contoh: Muhammad Ilham Pratama"
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kelas:</label>
                  <select
                    value={newStudentClass}
                    onChange={(e) => setNewStudentClass(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    {CLASSES.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">PIN Mesin AT-101:</label>
                  <input
                    type="text"
                    value={newStudentPin}
                    onChange={(e) => setNewStudentPin(e.target.value)}
                    placeholder="1481"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Jenis Kelamin:</label>
                  <select
                    value={newStudentGender}
                    onChange={(e) => setNewStudentGender(e.target.value as 'L' | 'P')}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">NISN:</label>
                <input
                  type="text"
                  value={newStudentNisn}
                  onChange={(e) => setNewStudentNisn(e.target.value)}
                  placeholder="0078000481"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                />
              </div>

              <div className="border-t border-slate-100 pt-2 space-y-2">
                <span className="font-bold text-slate-800 text-[11px] block">Data Wali Murid (Penerima Notifikasi WhatsApp):</span>
                
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Orang Tua / Wali:</label>
                  <input
                    type="text"
                    value={newStudentParent}
                    onChange={(e) => setNewStudentParent(e.target.value)}
                    placeholder="Bpk. Bambang Sulistyo"
                    required
                    className="w-full p-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">No. WhatsApp Wali:</label>
                    <input
                      type="text"
                      value={newStudentPhone}
                      onChange={(e) => setNewStudentPhone(e.target.value)}
                      placeholder="628129876543"
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Email Orang Tua:</label>
                    <input
                      type="email"
                      value={newStudentEmail}
                      onChange={(e) => setNewStudentEmail(e.target.value)}
                      placeholder="wali@gmail.com"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20"
                >
                  Simpan Data Siswa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Hapus Siswa Confirmation */}
      {deletingStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 shadow-2xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-sm text-rose-700 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-600" />
              <span>Konfirmasi Hapus Siswa</span>
            </h4>
            <p className="text-xs text-slate-600">
              Apakah Anda yakin ingin menghapus siswa <strong>{deletingStudent.name}</strong> ({deletingStudent.class}, PIN: {deletingStudent.pin})?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingStudent(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteStudent}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20"
              >
                Ya, Hapus Siswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Status Modal */}
      {editingStudentId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-sm text-slate-800">
                Ubah Status Presensi Manual (Guru Piket)
              </h4>
              <button 
                onClick={() => setEditingStudentId(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Pilih Status Baru:</label>
              <div className="grid grid-cols-3 gap-2">
                {(['SAKIT', 'IZIN', 'ALPHA', 'HADIR_TEPAT'] as AttendanceStatus[]).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setManualStatus(st)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      manualStatus === st
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Catatan Keterangan:</label>
              <textarea
                rows={2}
                value={manualNote}
                onChange={(e) => setManualNote(e.target.value)}
                placeholder="Misal: Surat dokter terlampir, izin acara keluarga..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingStudentId(null)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveManual}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20"
              >
                Simpan & Notifikasi Orang Tua
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

