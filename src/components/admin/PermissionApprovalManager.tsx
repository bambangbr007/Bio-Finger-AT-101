import React from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  User, 
  Calendar,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

export const PermissionApprovalManager: React.FC = () => {
  const { permissions, students, approvePermission, rejectPermission } = useAttendance();

  const getStudentInfo = (studentId: string) => {
    return students.find(s => s.id === studentId) || {
      name: 'Siswa',
      class: '-',
      parentName: '-',
      avatarUrl: ''
    };
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base">Validasi Pengajuan Izin & Sakit Online</h3>
            <p className="text-xs text-slate-300">
              Surat izin dan keterangan sakit yang diajukan oleh Orang Tua via HP
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
          {permissions.filter(p => p.status === 'PENDING').length} Menunggu Persetujuan
        </span>
      </div>

      <div className="p-4 space-y-3">
        {permissions.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Belum ada pengajuan izin atau sakit dari orang tua.
          </div>
        ) : (
          permissions.map(perm => {
            const student = getStudentInfo(perm.studentId);

            return (
              <div 
                key={perm.id} 
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs ${
                  perm.status === 'PENDING' ? 'bg-amber-50/50 border-amber-200' :
                  perm.status === 'APPROVED' ? 'bg-white border-slate-200 opacity-90' : 'bg-slate-50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                    perm.type === 'SAKIT' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                  }`}>
                    {perm.type === 'SAKIT' ? <HelpCircle className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">{student.name}</span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-semibold">
                        {student.class}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        perm.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        perm.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'
                      }`}>
                        {perm.status === 'APPROVED' ? 'Disetujui' : perm.status === 'REJECTED' ? 'Ditolak' : 'Menunggu Validasi'}
                      </span>
                    </div>

                    <p className="text-slate-700 mt-1 font-medium">
                      Jenis: <strong className="text-blue-700">{perm.type}</strong> • Tanggal: {perm.startDate} s/d {perm.endDate}
                    </p>
                    <p className="text-slate-600 mt-0.5">
                      Alasan: "{perm.reason}"
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Diajukan oleh: {student.parentName} • {perm.submittedAt}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                {perm.status === 'PENDING' ? (
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => approvePermission(perm.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 shadow-sm transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Setujui (Update Absensi)</span>
                    </button>
                    <button
                      onClick={() => rejectPermission(perm.id)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-semibold flex items-center gap-1 transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Tolak</span>
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] text-slate-400 italic">
                    Telah diproses
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
