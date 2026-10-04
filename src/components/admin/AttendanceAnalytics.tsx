import React, { useMemo } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { CLASSES } from '../../data/mockStudents';
import { 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Clock, 
  MessageSquare, 
  TrendingUp,
  Award,
  ChevronRight
} from 'lucide-react';

export const AttendanceAnalytics: React.FC = () => {
  const { students, attendanceRecords, activeDate, notificationLogs } = useAttendance();

  const metrics = useMemo(() => {
    const todayRecords = attendanceRecords.filter(r => r.date === activeDate);
    const totalStudents = students.length || 480;

    const onTime = todayRecords.filter(r => r.status === 'HADIR_TEPAT').length;
    const late = todayRecords.filter(r => r.status === 'TERLAMBAT').length;
    const sick = todayRecords.filter(r => r.status === 'SAKIT').length;
    const permission = todayRecords.filter(r => r.status === 'IZIN').length;
    const alpha = todayRecords.filter(r => r.status === 'ALPHA').length;
    const recordedCount = todayRecords.length;
    const unrecorded = Math.max(0, totalStudents - recordedCount);

    const attendanceRate = totalStudents > 0 ? Math.round(((onTime + late) / totalStudents) * 100) : 0;
    const lateRate = totalStudents > 0 ? Math.round((late / totalStudents) * 100) : 0;

    return {
      totalStudents,
      onTime,
      late,
      sick,
      permission,
      alpha,
      unrecorded,
      attendanceRate,
      lateRate,
      totalNotifsSent: notificationLogs.length
    };
  }, [students, attendanceRecords, activeDate, notificationLogs]);

  // Breakdown per class
  const classBreakdown = useMemo(() => {
    return CLASSES.map(cls => {
      const classStudents = students.filter(s => s.class === cls);
      const studentIds = new Set(classStudents.map(s => s.id));
      const classRecords = attendanceRecords.filter(r => r.date === activeDate && studentIds.has(r.studentId));
      
      const present = classRecords.filter(r => r.status === 'HADIR_TEPAT' || r.status === 'TERLAMBAT').length;
      const total = classStudents.length || 40;
      const percentage = Math.round((present / total) * 100);

      return {
        className: cls,
        total,
        present,
        percentage
      };
    });
  }, [students, attendanceRecords, activeDate]);

  return (
    <div className="space-y-4">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        
        {/* Total Students */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Siswa</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2 font-mono">{metrics.totalStudents}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">12 Rombel Aktif</span>
        </div>

        {/* Hadir Tepat Waktu */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">Tepat Waktu</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-800 mt-2 font-mono">{metrics.onTime}</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all" 
              style={{ width: `${(metrics.onTime / metrics.totalStudents) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Terlambat */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Terlambat</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2 font-mono">{metrics.late}</p>
          <span className="text-[11px] text-amber-600 mt-1 block font-medium">
            Lewat 07:15 WIB
          </span>
        </div>

        {/* Sakit & Izin */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700">Sakit & Izin</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-800 mt-2 font-mono">{metrics.sick + metrics.permission}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {metrics.sick} Sakit • {metrics.permission} Izin
          </span>
        </div>

        {/* Belum Hadir */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Belum Scan</span>
            <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-700 mt-2 font-mono">{metrics.unrecorded}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Menunggu Sidik Jari</span>
        </div>

        {/* WhatsApp Real-time Broadcast */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-3.5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-100">WhatsApp Alert</span>
            <div className="p-1.5 bg-white/20 rounded-lg">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2 font-mono">
            {metrics.onTime + metrics.late}
          </p>
          <span className="text-[11px] text-emerald-200 mt-1 block">
            ✓ Terkirim Real-time
          </span>
        </div>

      </div>

      {/* Class Level Attendance Gauge Bars */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Persentase Kehadiran per Rombongan Belajar (12 Kelas)
            </h4>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            Tingkat Kehadiran Sekolah: {metrics.attendanceRate}%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {classBreakdown.map(cb => (
            <div key={cb.className} className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="font-bold text-slate-800">{cb.className}</span>
                <span className={`font-mono font-bold ${cb.percentage >= 90 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {cb.percentage}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${cb.percentage >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${cb.percentage}%` }}
                ></div>
              </div>
              <div className="text-[10px] text-slate-500 mt-1">
                {cb.present} dari {cb.total} siswa
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
