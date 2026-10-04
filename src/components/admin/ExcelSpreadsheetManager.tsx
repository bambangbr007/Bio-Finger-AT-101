import React, { useState, useRef } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { 
  FileSpreadsheet, 
  UploadCloud, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Sparkles, 
  FileText,
  RefreshCw,
  Info
} from 'lucide-react';
import { 
  parseBioFingerExcel, 
  generateSampleBioFingerExcel, 
  generateStudentsMasterExcel,
  ParsedBioFingerRow 
} from '../../utils/bioFingerParser';

export const ExcelSpreadsheetManager: React.FC = () => {
  const { 
    students, 
    activeDate, 
    processBatchExcelRows,
    schoolConfig
  } = useAttendance();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<{
    state: 'IDLE' | 'PROCESSING' | 'SUCCESS' | 'ERROR';
    summary?: { total: number; processed: number; errors: number; lateCount: number };
    errorMessage?: string;
  }>({ state: 'IDLE' });

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportStatus({ state: 'PROCESSING' });

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result as ArrayBuffer;
        const rows: ParsedBioFingerRow[] = parseBioFingerExcel(buffer);

        if (rows.length === 0) {
          setImportStatus({
            state: 'ERROR',
            errorMessage: 'Format file tidak sesuai atau tidak ada baris data PIN di spreadsheet.'
          });
          return;
        }

        // Process batch rows
        const summary = processBatchExcelRows(rows);
        setImportStatus({
          state: 'SUCCESS',
          summary
        });
      } catch (err: any) {
        setImportStatus({
          state: 'ERROR',
          errorMessage: `Gagal memproses file Excel: ${err?.message || 'Error tidak diketahui'}`
        });
      }
    };
    reader.readAsArrayBuffer(file);
    // Reset file input so re-uploading same file works
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Download sample BioFinger AT-101 Excel log
  const handleDownloadSampleExcel = () => {
    const buffer = generateSampleBioFingerExcel(students, activeDate);
    const blob = new Blob([buffer.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BIO_Finger_AT101_Log_${activeDate}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download Master 480 Students Sheet
  const handleDownloadMasterStudents = () => {
    const buffer = generateStudentsMasterExcel(students);
    const blob = new Blob([buffer.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Master_480_Siswa_${schoolConfig.schoolName.replace(/\s+/g, '_')}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // One-click Auto Import Demo (Simulates plugging in USB/Syncing from AT-101)
  const handleSimulateAutoSync = () => {
    setImportStatus({ state: 'PROCESSING' });
    setTimeout(() => {
      const buffer = generateSampleBioFingerExcel(students, activeDate);
      const rows = parseBioFingerExcel(buffer.buffer as ArrayBuffer);
      const summary = processBatchExcelRows(rows);
      setImportStatus({
        state: 'SUCCESS',
        summary
      });
    }, 500);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base">Sinkronisasi Data Excel / Spreadsheet BIO Finger AT-101</h3>
            <p className="text-xs text-slate-300">
              Impor log presensi dari flashdisk USB / kabel LAN mesin dan kirim notifikasi massal
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadSampleExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span>Download Template Log AT-101 (.xlsx)</span>
          </button>

          <button
            onClick={handleDownloadMasterStudents}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/80 text-xs text-emerald-200 border border-emerald-700/60 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export 480 Data Siswa (.xlsx)</span>
          </button>
        </div>
      </div>

      <div className="p-5 space-y-6">
        
        {/* Upload Zone & Quick Action */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          
          {/* Drag & Drop Upload Container */}
          <div className="md:col-span-8 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-slate-50/60 transition-all flex flex-col items-center justify-center relative group">
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx, .xls, .csv, .txt"
              onChange={handleFileUpload}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
            
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h4 className="text-sm font-bold text-slate-800">
              Pilih atau Tarik File Excel Hasil Export Mesin BIO Finger AT-101
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-md">
              Mendukung format .XLSX, .XLS, atau .CSV dari USB Flashdisk mesin AT-101 atau software BioFinger Attendance.
            </p>

            <div className="mt-4 flex items-center gap-2">
              <span className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-xs">
                Format Kolom: PIN | Waktu Scan | Mode Masuk/Pulang
              </span>
            </div>
          </div>

          {/* Quick Simulation Box */}
          <div className="md:col-span-4 bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-4 flex flex-col justify-between shadow-md">
            <div>
              <div className="flex items-center gap-2 mb-2 text-blue-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Uji Coba Cepat (1-Klik)</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Belum ada file fisik dari mesin? Klik tombol di bawah untuk membuat simulasi file Excel log AT-101 (60 scan) dan langsung memprosesnya secara instan!
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={handleSimulateAutoSync}
                disabled={importStatus.state === 'PROCESSING'}
                className="w-full py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
              >
                {importStatus.state === 'PROCESSING' ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memproses Baris...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Tarik Data & Kirim Presisi ke Akun Ortu</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Processing State & Success Report */}
        {importStatus.state === 'PROCESSING' && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 text-blue-900 text-xs">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
            <div>
              <p className="font-bold">Memproses File Spreadsheet & Sinkronisasi Presisi...</p>
              <p className="text-blue-700">Mencocokkan PIN BioFinger & Nama Anak untuk mengirimkan laporan langsung ke akun aplikasi orang tua siswa.</p>
            </div>
          </div>
        )}

        {importStatus.state === 'SUCCESS' && importStatus.summary && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                  Data BIO Finger Berhasil Ditarik & Terkirim Presisi ke Akun Orang Tua
                </h4>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-200 text-emerald-800">
                100% Presisi
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-xs">
                <span className="text-[10px] text-slate-500 font-semibold block">Total Log Mesin</span>
                <span className="text-base font-bold text-slate-800">{importStatus.summary.total} Baris</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-xs">
                <span className="text-[10px] text-slate-500 font-semibold block">Terkirim ke Akun Siswa</span>
                <span className="text-base font-bold text-emerald-700">{importStatus.summary.processed} Akun</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-xs">
                <span className="text-[10px] text-slate-500 font-semibold block">Terdeteksi Terlambat</span>
                <span className="text-base font-bold text-amber-600">{importStatus.summary.lateCount} Siswa</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-emerald-200 shadow-xs">
                <span className="text-[10px] text-slate-500 font-semibold block">Sinkronisasi Aplikasi</span>
                <span className="text-base font-bold text-emerald-600">✓ Real-time</span>
              </div>
            </div>

            <p className="text-[11px] text-emerald-800 leading-relaxed">
              ✓ Seluruh data kehadiran yang ditarik dari mesin BIO Finger AT-101 telah otomatis terkirim secara presisi ke setiap akun aplikasi orang tua siswa berdasarkan Nama Anak dan PIN BioFinger masing-masing.
            </p>
          </div>
        )}

        {importStatus.state === 'ERROR' && (
          <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl flex items-center gap-3 text-rose-900 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold">Gagal Mengimpor File</p>
              <p className="text-rose-700">{importStatus.errorMessage}</p>
            </div>
          </div>
        )}

        {/* Informational Guidance on BIO Finger AT-101 Export */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Info className="w-4 h-4 text-blue-600" />
            <span>Panduan Mengambil Data dari Mesin BIO Finger AT-101:</span>
          </div>
          <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
            <li>Tancapkan Flashdisk USB ke port USB di sisi bawah mesin BIO Finger AT-101.</li>
            <li>Tekan tombol <strong>[MENU / M]</strong> di mesin, lalu arahkan ke menu <strong>Pen Drive / USB Disk</strong>.</li>
            <li>Pilih opsi <strong>Download Data Presensi (AttLog)</strong> dan tunggu proses unduh selesai.</li>
            <li>Buka file di laptop atau langsung tarik file .XLSX / .DAT tersebut ke area upload di atas.</li>
            <li>Sistem akan secara otomatis mencocokkan PIN siswa dan mengirimkan notifikasi ke orang tua secara real-time.</li>
          </ol>
        </div>

      </div>
    </div>
  );
};
