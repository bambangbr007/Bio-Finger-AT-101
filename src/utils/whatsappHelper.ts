import { SchoolConfig, Student } from '../types';

export function formatWhatsAppMessage(
  template: string,
  student: Student,
  timeStr: string,
  dateStr: string,
  statusLabel: string,
  config: SchoolConfig,
  type: 'CHECK_IN' | 'CHECK_OUT' | 'LATE'
): string {
  let text = template
    .replace(/{sekolah}/g, config.schoolName)
    .replace(/{nama_siswa}/g, student.name)
    .replace(/{nisn}/g, student.nisn)
    .replace(/{pin}/g, student.pin)
    .replace(/{kelas}/g, student.class)
    .replace(/{nama_ortu}/g, student.parentName)
    .replace(/{waktu}/g, timeStr)
    .replace(/{tanggal}/g, dateStr)
    .replace(/{status}/g, statusLabel)
    .replace(/{mesin}/g, config.deviceModel);

  return text;
}

export function generateDirectWhatsAppUrl(phone: string, message: string): string {
  // Clean phone number: remove non-numeric
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

export const DEFAULT_TEMPLATES = {
  checkIn: `*NOTIFIKASI PRESENSI KEHADIRAN* 🏫
*{sekolah}*

Yth. *{nama_ortu}*,
Wali dari: *{nama_siswa}* ({kelas})

Kami menginformasikan bahwa siswa telah hadir di sekolah dan terverifikasi pada mesin *{mesin}*:
📅 Tanggal: *{tanggal}*
⏰ Waktu Masuk: *{waktu} WIB*
📌 Status: *{status}*

Terima kasih atas kerja samanya dalam memantau kedisiplinan putra/putri kita.
_Sistem Absensi Otomatis BIO Finger AT-101 Cloud_`,

  late: `*PERINGATAN KETERLAMBATAN SISWA* ⚠️
*{sekolah}*

Yth. *{nama_ortu}*,
Wali dari: *{nama_siswa}* ({kelas})

Siswa terdeteksi *TERLAMBAT* tiba di sekolah pada mesin *{mesin}*:
📅 Tanggal: *{tanggal}*
⏰ Waktu Masuk: *{waktu} WIB* (Batas masuk: 07.15 WIB)
📌 Status: *{status}*

Mohon bantuan Bapak/Ibu untuk memberikan motivasi kedisiplinan waktu kepada siswa.
_Sistem Absensi Otomatis BIO Finger AT-101 Cloud_`,

  checkOut: `*NOTIFIKASI KEPULANGAN SISWA* 🏠
*{sekolah}*

Yth. *{nama_ortu}*,
Wali dari: *{nama_siswa}* ({kelas})

Kami menginformasikan bahwa siswa telah menyelesaikan kegiatan belajar dan melakukan presensi pulang pada *{mesin}*:
📅 Tanggal: *{tanggal}*
⏰ Waktu Pulang: *{waktu} WIB*
📌 Status: *{status}*

Siswa saat ini dalam perjalanan pulang. Mohon dipantau kepulangan ananda.
_Sistem Absensi Otomatis BIO Finger AT-101 Cloud_`
};
