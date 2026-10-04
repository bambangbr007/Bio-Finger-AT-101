import * as XLSX from 'xlsx';
import { AttendanceRecord, BioFingerLogEntry, SchoolConfig, Student } from '../types';

export interface ParsedBioFingerRow {
  pin: string;
  timestamp: string;
  state: 0 | 1 | 2 | 3 | 4 | 5;
  verifyMode: 'FINGERPRINT' | 'RFID' | 'PASSWORD';
  deviceName?: string;
}

export function parseBioFingerExcel(fileBuffer: ArrayBuffer): ParsedBioFingerRow[] {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  if (rawRows.length < 2) return [];

  const headers: string[] = rawRows[0].map((h: any) => String(h || '').trim().toLowerCase());
  
  // Find column indices
  let pinCol = headers.findIndex(h => h.includes('pin') || h.includes('id') || h.includes('user') || h.includes('no'));
  let dateCol = headers.findIndex(h => h.includes('date') || h.includes('tanggal') || h.includes('waktu') || h.includes('time'));
  let stateCol = headers.findIndex(h => h.includes('state') || h.includes('status') || h.includes('tipe') || h.includes('in/out') || h.includes('mode'));
  let verifyCol = headers.findIndex(h => h.includes('verify') || h.includes('verifikasi') || h.includes('metode'));
  let deviceCol = headers.findIndex(h => h.includes('device') || h.includes('mesin') || h.includes('sn'));

  // Default fallbacks if header names differ
  if (pinCol === -1) pinCol = 0;
  if (dateCol === -1) dateCol = 1;
  if (stateCol === -1) stateCol = 2;
  if (verifyCol === -1) verifyCol = 3;

  const results: ParsedBioFingerRow[] = [];

  for (let i = 1; i < rawRows.length; i++) {
    const row = rawRows[i];
    if (!row || row.length === 0) continue;

    const rawPin = String(row[pinCol] ?? '').trim();
    if (!rawPin) continue;

    // Normalize PIN (remove decimals if parsed as number)
    const pin = rawPin.split('.')[0];
    
    // Parse timestamp
    let rawDateVal = row[dateCol];
    let timestampStr = '';

    if (rawDateVal instanceof Date) {
      timestampStr = rawDateVal.toISOString().replace('T', ' ').slice(0, 19);
    } else if (typeof rawDateVal === 'number') {
      // Excel serial date number
      const parsedDate = new Date((rawDateVal - (25567 + 2)) * 86400 * 1000);
      timestampStr = parsedDate.toISOString().replace('T', ' ').slice(0, 19);
    } else {
      timestampStr = String(rawDateVal || '').trim();
    }

    if (!timestampStr) {
      const now = new Date();
      timestampStr = now.toISOString().replace('T', ' ').slice(0, 19);
    }

    // Determine state
    let state: 0 | 1 = 0;
    const rawState = String(row[stateCol] ?? '').toLowerCase();
    if (rawState.includes('out') || rawState.includes('pulang') || rawState === '1') {
      state = 1;
    } else {
      state = 0;
    }

    results.push({
      pin,
      timestamp: timestampStr,
      state,
      verifyMode: 'FINGERPRINT',
      deviceName: deviceCol !== -1 && row[deviceCol] ? String(row[deviceCol]) : 'BIO Finger AT-101 Gate-1'
    });
  }

  return results;
}

export function generateSampleBioFingerExcel(students: Student[], dateStr: string): Uint8Array {
  // Generate a realistic BIO Finger AT-101 export log
  const data = [
    ['No ID / PIN', 'Nama Siswa', 'Tanggal & Waktu Scan', 'Status Presensi', 'Mode Verifikasi', 'Perangkat Mesin'],
  ];

  // Pick ~60 students with realistic scan times for demonstration
  students.slice(0, 60).forEach((student, index) => {
    // Check in scan
    const isLate = index % 5 === 0;
    const hour = isLate ? '07' : '06';
    const minute = isLate 
      ? String(20 + (index % 15)).padStart(2, '0') 
      : String(30 + (index % 25)).padStart(2, '0');
    const second = String((index * 13) % 59).padStart(2, '0');
    const checkInTime = `${dateStr} ${hour}:${minute}:${second}`;

    data.push([
      student.pin,
      student.name,
      checkInTime,
      'Masuk (Check In)',
      'Fingerprint BioFinger AT-101',
      'BIO Finger AT-101 - Gate 1'
    ]);

    // Pulang scan for some students
    if (index < 25) {
      const outHour = '14';
      const outMinute = String(35 + (index % 20)).padStart(2, '0');
      const checkOutTime = `${dateStr} ${outHour}:${outMinute}:${second}`;
      data.push([
        student.pin,
        student.name,
        checkOutTime,
        'Pulang (Check Out)',
        'Fingerprint BioFinger AT-101',
        'BIO Finger AT-101 - Gate 2'
      ]);
    }
  });

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'BioFinger_AT101_Logs');
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
}

export function generateStudentsMasterExcel(students: Student[]): Uint8Array {
  const headers = [
    'ID Siswa', 'PIN BioFinger', 'NISN', 'Nama Lengkap', 'Kelas',
    'Jenis Kelamin', 'Nama Orang Tua / Wali', 'No. WhatsApp Wali', 'Email Orang Tua', 'Status Biometrik'
  ];

  const rows = students.map(s => [
    s.id,
    s.pin,
    s.nisn,
    s.name,
    s.class,
    s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
    s.parentName,
    s.parentPhone,
    s.parentEmail,
    s.fingerprintRegistered ? 'Terdaftar (AT-101)' : 'Belum'
  ]);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Data_480_Siswa');
  return XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
}

export function calculateLateMinutes(checkInTimeStr: string, deadlineStr: string): number {
  const [inHour, inMin] = checkInTimeStr.split(':').map(Number);
  const [deadHour, deadMin] = deadlineStr.split(':').map(Number);

  const inMinutes = inHour * 60 + inMin;
  const deadlineMinutes = deadHour * 60 + deadMin;

  if (inMinutes > deadlineMinutes) {
    return inMinutes - deadlineMinutes;
  }
  return 0;
}
