import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { AttendanceAnalytics } from './AttendanceAnalytics';
import { LiveBioFingerScanner } from './LiveBioFingerScanner';
import { ExcelSpreadsheetManager } from './ExcelSpreadsheetManager';
import { StudentListTable } from './StudentListTable';
import { NotificationBroadcastCenter } from './NotificationBroadcastCenter';
import { PermissionApprovalManager } from './PermissionApprovalManager';
import { RealtimeBioFingerBridge } from './RealtimeBioFingerBridge';
import { TeacherManager } from './TeacherManager';
import { FingerprintEnrollmentManager } from './FingerprintEnrollmentManager';
import { 
  Activity, 
  Users, 
  FileSpreadsheet, 
  MessageSquare, 
  FileText, 
  Fingerprint,
  Radio,
  Clock,
  CheckCircle2,
  Cpu,
  GraduationCap,
  Sparkles
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { recentScans, permissions, notificationLogs, teachers } = useAttendance();
  const [activeTab, setActiveTab] = useState<'scan' | 'realtime' | 'students' | 'teachers' | 'enrollment' | 'excel' | 'broadcast' | 'permissions'>('scan');
  const [enrollTarget, setEnrollTarget] = useState<{ id: string; type: 'STUDENT' | 'TEACHER' } | null>(null);

  const pendingPermissionsCount = permissions.filter(p => p.status === 'PENDING').length;

  const handleTriggerTeacherEnroll = (teacher: any) => {
    setEnrollTarget({ id: teacher.id, type: 'TEACHER' });
    setActiveTab('enrollment');
  };

  return (
    <div className="space-y-6">
      
      {/* High Level KPI Metrics */}
      <AttendanceAnalytics />

      {/* Admin Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('scan')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'scan'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Fingerprint className="w-4 h-4" />
          <span>Terminal Scan & Live Feed</span>
          {recentScans.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('enrollment')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'enrollment'
              ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/40'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Perekaman Sidik Jari (Enrollment Baru)</span>
        </button>

        <button
          onClick={() => setActiveTab('realtime')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'realtime'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Radio className="w-4 h-4 text-cyan-500" />
          <span>Socket Stream (Port 4370)</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'students'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Data Siswa (Tambah/Hapus)</span>
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'teachers'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-indigo-500" />
          <span>Data Guru & Staff ({teachers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('excel')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'excel'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Impor/Ekspor Excel AT-101</span>
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'broadcast'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Antrian Notifikasi WA ({notificationLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'permissions'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Validasi Izin Online</span>
          {pendingPermissionsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-500 text-white">
              {pendingPermissionsCount}
            </span>
          )}
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'scan' && (
        <div className="space-y-6">
          <LiveBioFingerScanner />
          
          {/* Live Recent Scans Radar Ticker */}
          {recentScans.length > 0 && (
            <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-sm border border-slate-800">
              <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Radar Pemindaian Sidik Jari Terkini (Real-time BioFinger AT-101)
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {recentScans.length} Aktivitas Terakhir
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {recentScans.slice(0, 6).map((scan) => (
                  <div key={scan.id} className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Fingerprint className="w-3.5 h-3.5 text-blue-400" />
                        <span className="font-bold text-slate-200">PIN: {scan.pin}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          scan.state === 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          {scan.state === 0 ? 'Masuk' : 'Pulang'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{scan.timestamp}</p>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">✓ Verified</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'enrollment' && (
        <FingerprintEnrollmentManager preselectedPerson={enrollTarget} />
      )}

      {activeTab === 'realtime' && (
        <RealtimeBioFingerBridge />
      )}

      {activeTab === 'students' && (
        <StudentListTable />
      )}

      {activeTab === 'teachers' && (
        <TeacherManager onTriggerEnrollment={handleTriggerTeacherEnroll} />
      )}

      {activeTab === 'excel' && (
        <ExcelSpreadsheetManager />
      )}

      {activeTab === 'broadcast' && (
        <NotificationBroadcastCenter />
      )}

      {activeTab === 'permissions' && (
        <PermissionApprovalManager />
      )}

    </div>
  );
};
