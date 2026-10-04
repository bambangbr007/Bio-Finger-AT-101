import React, { useMemo, useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { CLASSES } from '../../data/mockStudents';
import * as XLSX from 'xlsx';
import { 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Clock, 
  MessageSquare, 
  TrendingUp,
  Award,
  ChevronRight,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  X,
  Search,
  Filter,
  GraduationCap,
  Sparkles
} from 'lucide-react';

export const AttendanceAnalytics: React.FC = () => {
  const { 
    students, 
    attendanceRecords, 
    activeDate, 
    notificationLogs,
    permissions,
    schoolConfig 
  } = useAttendance();

  // State for interactive class detail modal
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'HADIR_TEPAT' | 'TERLAMBAT' | 'IZIN_SAKIT' | 'BELUM_SCAN'>('ALL');
  const [studentSearch, setStudentSearch] = useState<string>('');

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
      
      const onTime = classRecords.filter(r => r.status === 'HADIR_TEPAT').length;
      const late = classRecords.filter(r => r.status === 'TERLAMBAT').length;
      const sickOrPerm = classRecords.filter(r => r.status === 'SAKIT' || r.status === 'IZIN').length;
      const present = onTime + late;
      const total = classStudents.length || 40;
      const unrecorded = Math.max(0, total - (present + sickOrPerm));
      const percentage = Math.round((present / total) * 100);

      return {
        className: cls,
        total,
        present,
        onTime,
        late,
        sickOrPerm,
        unrecorded,
        percentage
      };
    });
  }, [students, attendanceRecords, activeDate]);

  // Data detail siswa kelas yang sedang dipilih
  const classDetailData = useMemo(() => {
    if (!selectedClass) return null;

    const classStudents = students.filter(s => s.class === selectedClass);
    const todayRecords = attendanceRecords.filter(r => r.date === activeDate);
    const activePerms = permissions.filter(p => p.status === 'APPROVED');

    const mapped = classStudents.map(student => {
      const record = todayRecords.find(r => r.studentId === student.id);
      const perm = activePerms.find(p => p.studentId === student.id);

      let statusCategory: 'HADIR_TEPAT' | 'TERLAMBAT' | 'IZIN_SAKIT' | 'BELUM_SCAN' = 'BELUM_SCAN';
      let statusLabel = 'Belum Scan';
      let checkInTime = record?.checkInTime || '-';
      let lateMinutes = record?.lateMinutes || 0;
      let notes = '-';

      if (record?.status === 'HADIR_TEPAT') {
        statusCategory = 'HADIR_TEPAT';
        statusLabel = 'Hadir Tepat Waktu';
      } else if (record?.status === 'TERLAMBAT') {
        statusCategory = 'TERLAMBAT';
        statusLabel = `Terlambat (${lateMinutes} mnt)`;
        notes = `Scan pukul ${checkInTime} WIB`;
      } else if (record?.status === 'SAKIT' || perm?.type === 'SAKIT') {
        statusCategory = 'IZIN_SAKIT';
        statusLabel = 'Sakit';
        notes = perm?.reason || 'Surat keterangan sakit';
      } else if (record?.status === 'IZIN' || perm?.type === 'IZIN') {
        statusCategory = 'IZIN_SAKIT';
        statusLabel = 'Izin';
        notes = perm?.reason || 'Permohonan izin wali murid';
      }

      return {
        ...student,
        statusCategory,
        statusLabel,
        checkInTime,
        lateMinutes,
        notes
      };
    });

    const onTimeCount = mapped.filter(s => s.statusCategory === 'HADIR_TEPAT').length;
    const lateCount = mapped.filter(s => s.statusCategory === 'TERLAMBAT').length;
    const izinSakitCount = mapped.filter(s => s.statusCategory === 'IZIN_SAKIT').length;
    const belumScanCount = mapped.filter(s => s.statusCategory === 'BELUM_SCAN').length;

    // Filter berdasarkan status tab & pencarian
    const filtered = mapped.filter(s => {
      const matchStatus = statusFilter === 'ALL' || s.statusCategory === statusFilter;
      const matchSearch = studentSearch.trim() === '' || 
        s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.pin.includes(studentSearch) ||
        s.nisn.includes(studentSearch);
      return matchStatus && matchSearch;
    });

    return {
      className: selectedClass,
      totalStudents: mapped.length,
      onTimeCount,
      lateCount,
      izinSakitCount,
      belumScanCount,
      allStudents: mapped,
      filteredStudents: filtered
    };
  }, [selectedClass, students, attendanceRecords, activeDate, permissions, statusFilter, studentSearch]);

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    if (!classDetailData) return;

    const dataToExport = classDetailData.filteredStudents.map((s, idx) => ({
      'No': idx + 1,
      'NISN': s.nisn,
      'PIN BioFinger': s.pin,
      'Nama Lengkap Siswa': s.name,
      'Kelas': s.class,
      'Status Kehadiran': s.statusLabel,
      'Waktu Scan AT-101': s.checkInTime,
      'Keterangan': s.notes,
      'Nama Wali Murid': s.parentName,
      'No. WhatsApp Wali': `+${s.parentPhone}`
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Presensi_${classDetailData.className.replace(/\s+/g, '_')}`);
    
    // Auto column width
    ws['!cols'] = [
      { wch: 5 },  // No
      { wch: 12 }, // NISN
      { wch: 14 }, // PIN
      { wch: 25 }, // Nama
      { wch: 10 }, // Kelas
      { wch: 20 }, // Status
      { wch: 15 }, // Waktu Scan
      { wch: 25 }, // Keterangan
      { wch: 22 }, // Wali
      { wch: 18 }  // WA
    ];

    XLSX.writeFile(wb, `Laporan_Presensi_${classDetailData.className.replace(/\s+/g, '_')}_${activeDate}.xlsx`);
  };

  // Cetak & Unduh PDF
  const handlePrint = () => {
    if (!classDetailData) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Mohon izinkan popup browser untuk mencetak / mengunduh PDF.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Presensi ${classDetailData.className} - MTs Nurus Salam</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 24px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px; }
            .school-name { font-size: 18px; font-weight: bold; text-transform: uppercase; margin: 0; color: #047857; }
            .sub-title { font-size: 13px; margin: 4px 0 0 0; color: #475569; }
            .meta-info { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 12px; }
            .summary-box { display: flex; gap: 10px; margin-bottom: 16px; }
            .summary-item { flex: 1; padding: 8px; border: 1px solid #cbd5e1; border-radius: 8px; text-align: center; font-size: 11px; }
            .summary-item strong { display: block; font-size: 16px; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 24px; }
            th, td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: bold; }
            .tag { display: inline-block; padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px; }
            .tag-tepat { background: #d1fae5; color: #065f46; }
            .tag-lambat { background: #fef3c7; color: #92400e; }
            .tag-izin { background: #e0e7ff; color: #3730a3; }
            .tag-belum { background: #f1f5f9; color: #475569; }
            .footer-sign { display: flex; justify-content: space-between; margin-top: 40px; font-size: 11px; }
            .sign-col { text-align: center; width: 200px; }
            @media print {
              body { margin: 10mm; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="school-name">MTs Nurus Salam Gebog Kudus</h1>
            <p class="sub-title">LAPORAN DETAIL PRESENSI BIO FINGER AT-101 • ROMBONGAN BELAJAR ${classDetailData.className}</p>
          </div>

          <div class="meta-info">
            <div>
              <strong>Hari, Tanggal:</strong> ${activeDate}<br>
              <strong>Kelas:</strong> ${classDetailData.className}
            </div>
            <div style="text-align: right;">
              <strong>Perangkat:</strong> BIO Finger AT-101<br>
              <strong>Dicetak pada:</strong> ${new Date().toLocaleString('id-ID')} WIB
            </div>
          </div>

          <div class="summary-box">
            <div class="summary-item">Total Siswa<strong style="color: #1e293b;">${classDetailData.totalStudents}</strong></div>
            <div class="summary-item">Hadir Tepat Waktu<strong style="color: #059669;">${classDetailData.onTimeCount}</strong></div>
            <div class="summary-item">Terlambat<strong style="color: #d97706;">${classDetailData.lateCount}</strong></div>
            <div class="summary-item">Izin / Sakit<strong style="color: #4f46e5;">${classDetailData.izinSakitCount}</strong></div>
            <div class="summary-item">Belum Scan<strong style="color: #64748b;">${classDetailData.belumScanCount}</strong></div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 25px; text-align: center;">No</th>
                <th style="width: 70px;">PIN AT-101</th>
                <th style="width: 80px;">NISN</th>
                <th>Nama Lengkap Siswa</th>
                <th style="width: 110px;">Status Kehadiran</th>
                <th style="width: 70px;">Waktu Scan</th>
                <th>Keterangan</th>
                <th>Nama Wali Murid</th>
              </tr>
            </thead>
            <tbody>
              ${classDetailData.filteredStudents.map((s, i) => `
                <tr>
                  <td style="text-align: center;">${i + 1}</td>
                  <td style="font-family: monospace;">${s.pin}</td>
                  <td style="font-family: monospace;">${s.nisn}</td>
                  <td><strong>${s.name}</strong></td>
                  <td>
                    <span class="tag ${
                      s.statusCategory === 'HADIR_TEPAT' ? 'tag-tepat' :
                      s.statusCategory === 'TERLAMBAT' ? 'tag-lambat' :
                      s.statusCategory === 'IZIN_SAKIT' ? 'tag-izin' : 'tag-belum'
                    }">
                      ${s.statusLabel}
                    </span>
                  </td>
                  <td style="font-family: monospace;">${s.checkInTime}</td>
                  <td>${s.notes}</td>
                  <td>${s.parentName}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer-sign">
            <div class="sign-col">
              <p>Mengetahui,<br>Kepala MTs Nurus Salam</p>
              <br><br><br>
              <p><strong>Ahmad Syarifuddin, M.Pd.</strong><br>NIP. 198204122008011015</p>
            </div>
            <div class="sign-col">
              <p>Gebog, Kudus, ${activeDate}<br>Wali Kelas / Guru Piket</p>
              <br><br><br>
              <p><strong>Siti Rahmawati, S.Pd.</strong><br>NIP. 198906152014022003</p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 400);
  };

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
          <p className="text-2xl font-black text-amber-800 mt-2 font-mono">{metrics.late}</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-amber-500 h-full rounded-full transition-all" 
              style={{ width: `${(metrics.late / metrics.totalStudents) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Izin / Sakit */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700">Izin / Sakit</span>
            <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-800 mt-2 font-mono">{metrics.sick + metrics.permission}</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-indigo-500 h-full rounded-full transition-all" 
              style={{ width: `${((metrics.sick + metrics.permission) / metrics.totalStudents) * 100}%` }}
            ></div>
          </div>
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

      {/* Class Level Attendance Gauge Bars (KLIK UNTUK MELIHAT DETAIL, DOWNLOAD EXCEL/PDF & PRINT) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" />
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Persentase Kehadiran per Rombongan Belajar (12 Kelas)
              </h4>
              <p className="text-[11px] text-blue-600 font-semibold">
                *Klik salah satu kotak kelas di bawah untuk melihat rincian siswa (Tepat Waktu, Terlambat, Izin), cetak, & unduh Excel/PDF.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shrink-0">
            Tingkat Kehadiran Sekolah: {metrics.attendanceRate}%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {classBreakdown.map(cb => (
            <button
              key={cb.className}
              type="button"
              onClick={() => {
                setSelectedClass(cb.className);
                setStatusFilter('ALL');
                setStudentSearch('');
              }}
              className="p-3 rounded-2xl border border-slate-200/90 bg-white hover:bg-blue-50/70 hover:border-blue-400 hover:shadow-md cursor-pointer transition-all text-left group relative"
            >
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {cb.className}
                </span>
                <span className={`font-mono font-black ${cb.percentage >= 90 ? 'text-emerald-700' : cb.percentage > 0 ? 'text-amber-700' : 'text-slate-400'}`}>
                  {cb.percentage}%
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200/50">
                <div 
                  className={`h-full rounded-full transition-all ${cb.percentage >= 90 ? 'bg-emerald-500' : cb.percentage > 0 ? 'bg-amber-500' : 'bg-slate-300'}`}
                  style={{ width: `${cb.percentage}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-medium">
                <span>{cb.present} dari {cb.total} siswa</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* MODAL DETAIL KELAS SISWA (TEPAT WAKTU, TERLAMBAT, IZIN + EXCEL + PDF + PRINT) */}
      {selectedClass && classDetailData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-3xl w-full max-w-4xl p-5 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-3 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <span>Laporan Detail Presensi - {classDetailData.className}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-extrabold">
                      {classDetailData.totalStudents} Siswa
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    MTs Nurus Salam Gebog Kudus • Tanggal: <strong className="text-slate-700">{activeDate}</strong> • BIO Finger AT-101
                  </p>
                </div>
              </div>

              {/* Action Buttons: Download Excel, PDF, Print, Close */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  title="Unduh format spreadsheet Excel (.xlsx)"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Download Excel</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  title="Unduh sebagai file PDF atau cetak"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                  title="Cetak langsung ke printer fisik"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedClass(null)}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold ml-1 transition-all"
                  title="Tutup dialog detail"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Class Summary Badges (Hadir Tepat Waktu, Terlambat, Izin/Sakit) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 font-bold block uppercase">Hadir Tepat Waktu</span>
                  <p className="text-lg font-black text-emerald-900 font-mono leading-tight">{classDetailData.onTimeCount} Siswa</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-amber-700 font-bold block uppercase">Hadir Terlambat</span>
                  <p className="text-lg font-black text-amber-900 font-mono leading-tight">{classDetailData.lateCount} Siswa</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500 text-white flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-indigo-700 font-bold block uppercase">Izin / Sakit</span>
                  <p className="text-lg font-black text-indigo-900 font-mono leading-tight">{classDetailData.izinSakitCount} Siswa</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-slate-400 text-white flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Belum Presensi</span>
                  <p className="text-lg font-black text-slate-700 font-mono leading-tight">{classDetailData.belumScanCount} Siswa</p>
                </div>
              </div>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === 'ALL' 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  Semua ({classDetailData.totalStudents})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('HADIR_TEPAT')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === 'HADIR_TEPAT' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  Tepat Waktu ({classDetailData.onTimeCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('TERLAMBAT')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === 'TERLAMBAT' 
                      ? 'bg-amber-600 text-white shadow-xs' 
                      : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                  }`}
                >
                  Terlambat ({classDetailData.lateCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('IZIN_SAKIT')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === 'IZIN_SAKIT' 
                      ? 'bg-indigo-600 text-white shadow-xs' 
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200'
                  }`}
                >
                  Izin / Sakit ({classDetailData.izinSakitCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('BELUM_SCAN')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    statusFilter === 'BELUM_SCAN' 
                      ? 'bg-slate-700 text-white shadow-xs' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  Belum Scan ({classDetailData.belumScanCount})
                </button>
              </div>

              {/* Search in Modal */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Cari siswa / PIN..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Student Table */}
            <div className="flex-1 overflow-y-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px] tracking-wider z-10">
                  <tr>
                    <th className="py-2.5 px-3 text-center">No</th>
                    <th className="py-2.5 px-3">PIN & NISN</th>
                    <th className="py-2.5 px-3">Nama Siswa</th>
                    <th className="py-2.5 px-3">Status Kehadiran</th>
                    <th className="py-2.5 px-3">Waktu Scan AT-101</th>
                    <th className="py-2.5 px-3">Keterangan</th>
                    <th className="py-2.5 px-3">Wali Murid</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classDetailData.filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Tidak ada data siswa yang cocok dengan filter.
                      </td>
                    </tr>
                  ) : (
                    classDetailData.filteredStudents.map((s, idx) => (
                      <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-2 px-3 font-mono">
                          <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded text-[11px] block w-fit">
                            PIN: {s.pin}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{s.nisn}</span>
                        </td>
                        <td className="py-2 px-3">
                          <div className="flex items-center gap-2">
                            <img src={s.avatarUrl} alt={s.name} className="w-6 h-6 rounded-full bg-slate-100 object-cover border border-slate-200" />
                            <span className="font-bold text-slate-800">{s.name}</span>
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                            s.statusCategory === 'HADIR_TEPAT' ? 'bg-emerald-100 text-emerald-800' :
                            s.statusCategory === 'TERLAMBAT' ? 'bg-amber-100 text-amber-800' :
                            s.statusCategory === 'IZIN_SAKIT' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {s.statusCategory === 'HADIR_TEPAT' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                            {s.statusCategory === 'TERLAMBAT' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                            {s.statusCategory === 'IZIN_SAKIT' && <HelpCircle className="w-3 h-3 text-indigo-600" />}
                            {s.statusCategory === 'BELUM_SCAN' && <Clock className="w-3 h-3 text-slate-400" />}
                            <span>{s.statusLabel}</span>
                          </span>
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-700">
                          {s.checkInTime !== '-' ? `${s.checkInTime} WIB` : '-'}
                        </td>
                        <td className="py-2 px-3 text-slate-600 text-[11px]">
                          {s.notes}
                        </td>
                        <td className="py-2 px-3">
                          <span className="text-slate-800 font-medium block">{s.parentName}</span>
                          <span className="text-[10px] text-emerald-700 font-mono">+{s.parentPhone}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Modal Footer info */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
              <span>Menampilkan {classDetailData.filteredStudents.length} dari {classDetailData.totalStudents} siswa di {classDetailData.className}</span>
              <span className="font-semibold text-emerald-700">Tersinkronisasi Real-Time dengan Mesin BIO Finger AT-101</span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
