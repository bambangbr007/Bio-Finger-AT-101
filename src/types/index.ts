export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'PARENT';

export type AttendanceStatus = 
  | 'HADIR_TEPAT' 
  | 'TERLAMBAT' 
  | 'PULANG_AWAL' 
  | 'SAKIT' 
  | 'IZIN' 
  | 'ALPHA'
  | 'BELUM_HADIR';

export interface Student {
  id: string;
  pin: string; // BioFinger AT-101 PIN
  nisn: string;
  name: string;
  class: string; // e.g. Kelas 7A
  gender: 'L' | 'P';
  parentName: string;
  parentPhone: string; // Indonesian phone format e.g. 62812xxxx
  parentEmail: string;
  avatarUrl: string;
  fingerprintRegistered: boolean;
  rfidCard?: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string; // HH:mm:ss
  checkOutTime?: string; // HH:mm:ss
  status: AttendanceStatus;
  lateMinutes?: number;
  earlyMinutes?: number;
  checkInDevice?: string;
  checkOutDevice?: string;
  notes?: string;
  whatsappCheckInSent?: boolean;
  whatsappCheckOutSent?: boolean;
  emailCheckInSent?: boolean;
  emailCheckOutSent?: boolean;
  lastUpdated: string;
}

export interface BioFingerLogEntry {
  id: string;
  pin: string;
  timestamp: string; // YYYY-MM-DD HH:mm:ss
  state: 0 | 1 | 2 | 3 | 4 | 5; // 0 = In, 1 = Out, 2 = Break Out, etc.
  verifyMode: 'FINGERPRINT' | 'RFID' | 'PASSWORD';
  deviceId: string;
  workCode?: number;
}

export interface NotificationLog {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  recipientName: string;
  recipientContact: string; // Phone or Email
  channel: 'WHATSAPP' | 'EMAIL';
  direction: 'CHECK_IN' | 'CHECK_OUT' | 'ABSENCE' | 'MANUAL';
  status: 'DELIVERED' | 'SENT' | 'PENDING' | 'FAILED';
  content: string;
  timestamp: string;
  waDirectUrl?: string;
}

export interface SchoolConfig {
  schoolName: string;
  schoolAddress: string;
  academicYear: string;
  semester: string;
  checkInStart: string; // 06:00
  checkInDeadline: string; // 07:15
  checkOutStart: string; // 14:30
  checkOutEnd: string; // 17:00
  // BioFinger AT-101 Machine config
  deviceModel: string;
  deviceIp: string;
  devicePort: number;
  deviceCommKey: string;
  deviceLocation: string;
  deviceStatus: 'CONNECTED' | 'DISCONNECTED' | 'SYNCING';
  lastDeviceSync: string;
  // Notification Config
  waProvider: 'FONNTE' | 'WABLAS' | 'TWILIO' | 'ULTRAMSG';
  waApiKey: string;
  waSenderNumber: string;
  waAutoSend: boolean;
  emailAutoSend: boolean;
  waCheckInTemplate: string;
  waCheckOutTemplate: string;
  waLateTemplate: string;
}

export interface Teacher {
  id: string;
  nip: string;
  name: string;
  roleTitle: string; // e.g. 'Guru Piket / Matematika', 'Wali Kelas 7A'
  classAssigned?: string;
  phone: string;
  email: string;
  pin: string; // BioFinger AT-101 PIN for Teacher
  fingerprintRegistered: boolean;
  avatarUrl: string;
}

export interface AuthUser {
  id: string;
  role: UserRole;
  name: string;
  usernameOrEmail: string;
  studentId?: string; // If role === 'PARENT'
  teacherId?: string; // If role === 'ADMIN'
}

export interface FingerprintEnrollment {
  id: string;
  personId: string;
  personName: string;
  personType: 'STUDENT' | 'TEACHER';
  pin: string;
  fingerIndex: 'TELUNJUK_KANAN' | 'JEMPOL_KANAN' | 'TELUNJUK_KIRI' | 'JEMPOL_KIRI';
  qualityScore: number; // e.g. 96%
  enrolledAt: string;
  enrolledDevice: string;
}

export interface PermissionRequest {
  id: string;
  studentId: string;
  type: 'SAKIT' | 'IZIN';
  startDate: string;
  endDate: string;
  reason: string;
  attachmentUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  submittedAt: string;
  parentNote?: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  connected: boolean;
  lastTested?: string;
  tablesSynced?: {
    students: boolean;
    teachers: boolean;
    attendanceRecords: boolean;
    biometricTemplates: boolean;
  };
}

export interface ParentAccount {
  id: string;
  parentName: string;
  studentName: string; // Nama anak digunakan sebagai Username login
  studentId: string;
  studentClass: string;
  whatsappPhone: string;
  password: string;
  registeredAt: string;
  lastResetAt?: string;
  resetBy?: string; // 'ADMIN' | 'SUPER_ADMIN'
  status: 'ACTIVE' | 'SUSPENDED';
}

export interface SchoolParentMessage {
  id: string;
  studentId: string;
  studentName: string;
  parentName: string;
  parentPhone: string;
  senderRole: 'SUPER_ADMIN' | 'ADMIN' | 'PARENT';
  senderName: string;
  subject?: string;
  content: string; // Wajib diawali Assalamualaikum Wr. Wb. untuk pesan resmi
  sentAt: string;
  read: boolean;
  channel: 'APP' | 'WHATSAPP' | 'BOTH';
}

export interface SchoolAnnouncement {
  id: string;
  title: string;
  category: 'UMUM' | 'LIBUR' | 'UJIAN' | 'KEGIATAN' | 'RAPAT' | 'PHBI';
  content: string;
  targetClass: string; // 'SEMUA' or specific class e.g. 'Kelas 7A'
  publishedAt: string;
  authorName: string;
  authorRole: string; // e.g. 'Kepala MTs Nurus Salam', 'Guru Piket / Kesiswaan'
  priority: 'NORMAL' | 'PENTING';
  pinned?: boolean;
}
