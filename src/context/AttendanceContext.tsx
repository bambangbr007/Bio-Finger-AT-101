import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Student, 
  Teacher,
  AuthUser,
  AttendanceRecord, 
  UserRole, 
  SchoolConfig, 
  NotificationLog, 
  BioFingerLogEntry, 
  PermissionRequest,
  FingerprintEnrollment,
  AttendanceStatus,
  SupabaseConfig,
  ParentAccount,
  SchoolParentMessage,
  SchoolAnnouncement
} from '../types';
import { generate480Students } from '../data/mockStudents';
import { INITIAL_TEACHERS } from '../data/mockTeachers';
import { INITIAL_ANNOUNCEMENTS } from '../data/mockAnnouncements';
import { calculateLateMinutes, ParsedBioFingerRow } from '../utils/bioFingerParser';
import { DEFAULT_TEMPLATES, formatWhatsAppMessage, generateDirectWhatsAppUrl } from '../utils/whatsappHelper';

interface AttendanceContextType {
  currentUser: AuthUser | null;
  login: (identifier: string, password?: string, roleOverride?: UserRole, studentIdOverride?: string) => boolean;
  logout: () => void;
  students: Student[];
  teachers: Teacher[];
  attendanceRecords: AttendanceRecord[];
  activeDate: string;
  setActiveDate: (date: string) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  selectedParentStudentId: string;
  setSelectedParentStudentId: (id: string) => void;
  schoolConfig: SchoolConfig;
  updateSchoolConfig: (newConfig: Partial<SchoolConfig>) => void;
  notificationLogs: NotificationLog[];
  recentScans: BioFingerLogEntry[];
  permissions: PermissionRequest[];
  enrollmentLogs: FingerprintEnrollment[];
  supabaseConfig: SupabaseConfig;
  updateSupabaseConfig: (config: Partial<SupabaseConfig>) => void;
  
  // Parent accounts & direct messaging
  parentAccounts: ParentAccount[];
  registerParentAccount: (data: { parentName: string; studentName: string; whatsappPhone: string; password: string; studentClass?: string; avatarUrl?: string }) => { success: boolean; message: string; account?: ParentAccount };
  resetParentPassword: (accountId: string, newPassword?: string) => { success: boolean; message: string; newPassword: string };
  schoolParentMessages: SchoolParentMessage[];
  sendMessageToParent: (data: { studentId: string; subject: string; content: string; channel: 'APP' | 'WHATSAPP' | 'BOTH' }) => { success: boolean; message: string };
  sendParentReplyMessage: (studentId: string, content: string) => { success: boolean; message: string };
  markMessageAsRead: (messageId: string) => void;
  markAllStudentMessagesAsRead: (studentId: string) => void;
  
  // Announcements (Pengumuman Madrasah)
  announcements: SchoolAnnouncement[];
  addAnnouncement: (data: Omit<SchoolAnnouncement, 'id' | 'publishedAt'>) => { success: boolean; message: string; announcement?: SchoolAnnouncement };
  updateAnnouncement: (id: string, data: Partial<Omit<SchoolAnnouncement, 'id'>>) => { success: boolean; message: string };
  deleteAnnouncement: (id: string) => { success: boolean; message: string };
  
  // Actions
  addStudent: (data: Omit<Student, 'id'>) => { success: boolean; message: string; student?: Student };
  deleteStudent: (studentId: string) => { success: boolean; message: string };
  addTeacher: (data: Omit<Teacher, 'id'>) => { success: boolean; message: string; teacher?: Teacher };
  deleteTeacher: (teacherId: string) => { success: boolean; message: string };
  enrollFingerprint: (personId: string, personType: 'STUDENT' | 'TEACHER', fingerIndex: 'TELUNJUK_KANAN' | 'JEMPOL_KANAN' | 'TELUNJUK_KIRI' | 'JEMPOL_KIRI', qualityScore: number) => { success: boolean; message: string };
  processBioFingerScan: (pin: string, state?: 0 | 1, customTime?: string, verifyMode?: 'FINGERPRINT' | 'RFID' | 'PASSWORD') => { success: boolean; message: string; record?: AttendanceRecord };
  processBatchExcelRows: (rows: ParsedBioFingerRow[]) => { total: number; processed: number; errors: number; lateCount: number };
  updateAttendanceManual: (studentId: string, status: AttendanceStatus, notes?: string) => void;
  submitPermission: (studentId: string, type: 'SAKIT' | 'IZIN', reason: string, startDate: string, endDate: string, parentNote?: string) => void;
  approvePermission: (permissionId: string) => void;
  rejectPermission: (permissionId: string) => void;
  resendNotification: (logId: string) => void;
  resetAllData: () => void;
}

const DEFAULT_CONFIG: SchoolConfig = {
  schoolName: 'MTs Nurus Salam',
  schoolAddress: 'Jl. Raya Gebang, Kompleks Pendidikan MTs Nurus Salam',
  academicYear: '2026/2027',
  semester: 'Ganjil',
  checkInStart: '06:00',
  checkInDeadline: '07:15',
  checkOutStart: '14:30',
  checkOutEnd: '17:00',
  // Device
  deviceModel: 'BIO Finger AT-101 (Cloud Standalone)',
  deviceIp: '192.168.1.201',
  devicePort: 4370,
  deviceCommKey: '0',
  deviceLocation: 'Gerbang Utama & Lobby Presensi Siswa',
  deviceStatus: 'CONNECTED',
  lastDeviceSync: new Date().toISOString(),
  // WhatsApp & Email Gateway
  waProvider: 'FONNTE',
  waApiKey: 'fn_live_89a3f28d8b9e1104e76',
  waSenderNumber: '628129990001',
  waAutoSend: true,
  emailAutoSend: true,
  waCheckInTemplate: DEFAULT_TEMPLATES.checkIn,
  waLateTemplate: DEFAULT_TEMPLATES.late,
  waCheckOutTemplate: DEFAULT_TEMPLATES.checkOut
};

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const [activeDate, setActiveDate] = useState<string>(getTodayStr());

  // Current logged in user (starts null so LoginPage is shown on first visit)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = sessionStorage.getItem('biofinger_auth_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.id && parsed.role) return parsed;
      } catch (e) {}
    }
    return null;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return currentUser?.role || 'ADMIN';
  });

  // Load or generate initial 480 students
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('biofinger_students_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 400) return parsed;
      } catch (e) {
        console.error('Error parsing students', e);
      }
    }
    const initial = generate480Students();
    localStorage.setItem('biofinger_students_v1', JSON.stringify(initial));
    return initial;
  });

  // Teachers roster
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('biofinger_teachers_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    localStorage.setItem('biofinger_teachers_v1', JSON.stringify(INITIAL_TEACHERS));
    return INITIAL_TEACHERS;
  });

  const [selectedParentStudentId, setSelectedParentStudentId] = useState<string>(() => {
    if (currentUser?.studentId) return currentUser.studentId;
    return students[0]?.id || 'STU-001';
  });

  // Biometric Enrollment Logs
  const [enrollmentLogs, setEnrollmentLogs] = useState<FingerprintEnrollment[]>(() => {
    const saved = localStorage.getItem('biofinger_enrollments_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [
      {
        id: 'ENROLL-001',
        personId: 'STU-001',
        personName: 'Ahmad Fauzi',
        personType: 'STUDENT',
        pin: '1001',
        fingerIndex: 'TELUNJUK_KANAN',
        qualityScore: 98,
        enrolledAt: '2026-10-01 08:30:15',
        enrolledDevice: 'BIO Finger AT-101 Gate-1'
      },
      {
        id: 'ENROLL-002',
        personId: 'TCH-002',
        personName: 'Siti Rahmawati, S.Pd.',
        personType: 'TEACHER',
        pin: '2002',
        fingerIndex: 'JEMPOL_KANAN',
        qualityScore: 95,
        enrolledAt: '2026-10-01 09:12:00',
        enrolledDevice: 'BIO Finger AT-101 Gate-1'
      }
    ];
  });

  const [schoolConfig, setSchoolConfig] = useState<SchoolConfig>(() => {
    const saved = localStorage.getItem('biofinger_config_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_CONFIG;
  });

  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => {
    const saved = localStorage.getItem('biofinger_supabase_config');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      url: '',
      anonKey: '',
      connected: false
    };
  });

  const updateSupabaseConfig = (config: Partial<SupabaseConfig>) => {
    setSupabaseConfig(prev => {
      const updated = { ...prev, ...config };
      localStorage.setItem('biofinger_supabase_config', JSON.stringify(updated));
      return updated;
    });
  };

  // Load attendance records
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('biofinger_attendance_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    // Pre-populate some realistic initial attendance for today so dashboard looks vibrant immediately
    const today = getTodayStr();
    const initialRecs: AttendanceRecord[] = [];
    const sampleStudents = generate480Students();
    
    // 320 on time, 35 late, 10 sakit, 5 izin, remaining belum hadir
    sampleStudents.slice(0, 320).forEach((st, idx) => {
      const min = String(20 + (idx % 45)).padStart(2, '0');
      const sec = String((idx * 17) % 59).padStart(2, '0');
      initialRecs.push({
        id: `ATT-${today}-${st.id}`,
        studentId: st.id,
        date: today,
        checkInTime: `06:${min}:${sec}`,
        status: 'HADIR_TEPAT',
        lateMinutes: 0,
        checkInDevice: 'BIO Finger AT-101 Gate-1',
        whatsappCheckInSent: true,
        emailCheckInSent: true,
        lastUpdated: new Date().toISOString()
      });
    });

    sampleStudents.slice(320, 355).forEach((st, idx) => {
      const lateM = 5 + (idx % 25);
      const min = String(15 + lateM).padStart(2, '0');
      const sec = String((idx * 11) % 59).padStart(2, '0');
      initialRecs.push({
        id: `ATT-${today}-${st.id}`,
        studentId: st.id,
        date: today,
        checkInTime: `07:${min}:${sec}`,
        status: 'TERLAMBAT',
        lateMinutes: lateM,
        checkInDevice: 'BIO Finger AT-101 Gate-2',
        whatsappCheckInSent: true,
        emailCheckInSent: true,
        lastUpdated: new Date().toISOString()
      });
    });

    sampleStudents.slice(355, 365).forEach((st) => {
      initialRecs.push({
        id: `ATT-${today}-${st.id}`,
        studentId: st.id,
        date: today,
        status: 'SAKIT',
        notes: 'Demam & flu, surat dokter terlampir',
        whatsappCheckInSent: true,
        emailCheckInSent: true,
        lastUpdated: new Date().toISOString()
      });
    });

    sampleStudents.slice(365, 370).forEach((st) => {
      initialRecs.push({
        id: `ATT-${today}-${st.id}`,
        studentId: st.id,
        date: today,
        status: 'IZIN',
        notes: 'Acara keluarga di luar kota',
        whatsappCheckInSent: true,
        emailCheckInSent: true,
        lastUpdated: new Date().toISOString()
      });
    });

    return initialRecs;
  });

  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>(() => {
    const saved = localStorage.getItem('biofinger_notifs_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const [recentScans, setRecentScans] = useState<BioFingerLogEntry[]>([]);

  const [permissions, setPermissions] = useState<PermissionRequest[]>(() => {
    return [
      {
        id: 'PERM-001',
        studentId: 'STU-356',
        type: 'SAKIT',
        startDate: getTodayStr(),
        endDate: getTodayStr(),
        reason: 'Suhu tubuh tinggi 38.5C dan pusing, istirahat di rumah.',
        status: 'APPROVED',
        submittedAt: `${getTodayStr()} 06:40:00`,
        parentNote: 'Mohon izin ananda istirahat 1 hari'
      },
      {
        id: 'PERM-002',
        studentId: 'STU-005',
        type: 'IZIN',
        startDate: getTodayStr(),
        endDate: getTodayStr(),
        reason: 'Menghadiri wisuda kakak di luar kota',
        status: 'PENDING',
        submittedAt: `${getTodayStr()} 07:05:00`,
        parentNote: 'Surat tugas orang tua terlampir'
      }
    ];
  });

  // Data Akun Orang Tua Siswa (Username adalah Nama Anak)
  const [parentAccounts, setParentAccounts] = useState<ParentAccount[]>(() => {
    const saved = localStorage.getItem('biofinger_parent_accounts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    // Seed initial 30 parent accounts from sample students
    const initialStudents = generate480Students().slice(0, 30);
    const seeded: ParentAccount[] = initialStudents.map((st) => ({
      id: `ACC-${st.id}`,
      parentName: st.parentName,
      studentName: st.name, // Nama anak = username
      studentId: st.id,
      studentClass: st.class,
      whatsappPhone: st.parentPhone,
      password: 'wali' + st.pin,
      registeredAt: '2026-10-01 08:00:00',
      status: 'ACTIVE'
    }));
    return seeded;
  });

  // Pesan Resmi Madrasah ke Orang Tua (Wajib diawali Assalamualaikum Wr. Wb.)
  const [schoolParentMessages, setSchoolParentMessages] = useState<SchoolParentMessage[]>(() => {
    const saved = localStorage.getItem('biofinger_parent_messages');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    const initialStudents = generate480Students().slice(0, 10);
    const seeded: SchoolParentMessage[] = initialStudents.map(st => ({
      id: `MSG-INIT-${st.id}`,
      studentId: st.id,
      studentName: st.name,
      parentName: st.parentName,
      parentPhone: st.parentPhone,
      senderRole: 'ADMIN',
      senderName: 'Siti Rahmawati, S.Pd. (Guru Piket)',
      subject: 'Selamat Datang di Portal Presensi MTs Nurus Salam',
      content: `Assalamualaikum Wr. Wb.\n\nYth. Bapak/Ibu ${st.parentName}, Wali dari ananda ${st.name} (${st.class}).\n\nSelamat datang di Portal Presensi Biometrik BIO Finger AT-101 MTs Nurus Salam Gebog Kudus. Melalui aplikasi ini, Bapak/Ibu dapat memantau kehadiran ananda secara langsung dan mengajukan surat izin sakit online kapan saja.\n\nSemoga ananda senantiasa istiqomah dan berprestasi.\n\nWassalamualaikum Wr. Wb.\nMTs Nurus Salam Gebog Kudus`,
      sentAt: `${getTodayStr()} 06:30:00`,
      read: false,
      channel: 'APP'
    }));
    return seeded;
  });

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('biofinger_parent_accounts', JSON.stringify(parentAccounts));
  }, [parentAccounts]);

  useEffect(() => {
    localStorage.setItem('biofinger_parent_messages', JSON.stringify(schoolParentMessages));
  }, [schoolParentMessages]);

  // Pengumuman Madrasah untuk Seluruh Akun (Admin edit/kirim, Orang Tua hanya membaca)
  const [announcements, setAnnouncements] = useState<SchoolAnnouncement[]>(() => {
    const saved = localStorage.getItem('biofinger_announcements_v1');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return INITIAL_ANNOUNCEMENTS;
  });

  useEffect(() => {
    localStorage.setItem('biofinger_announcements_v1', JSON.stringify(announcements));
  }, [announcements]);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('biofinger_attendance_v1', JSON.stringify(attendanceRecords));
  }, [attendanceRecords]);

  useEffect(() => {
    localStorage.setItem('biofinger_notifs_v1', JSON.stringify(notificationLogs.slice(0, 300)));
  }, [notificationLogs]);

  useEffect(() => {
    localStorage.setItem('biofinger_config_v1', JSON.stringify(schoolConfig));
  }, [schoolConfig]);

  useEffect(() => {
    localStorage.setItem('biofinger_students_v1', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('biofinger_teachers_v1', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('biofinger_enrollments_v1', JSON.stringify(enrollmentLogs));
  }, [enrollmentLogs]);

  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem('biofinger_auth_user', JSON.stringify(currentUser));
      setCurrentRole(currentUser.role);
    } else {
      sessionStorage.removeItem('biofinger_auth_user');
      localStorage.removeItem('biofinger_auth_user');
    }
  }, [currentUser]);

  // Authentication: Login & Logout
  const login = (identifier: string, password?: string, roleOverride?: UserRole, studentIdOverride?: string): boolean => {
    const cleanId = identifier.trim().toLowerCase();

    if (roleOverride === 'SUPER_ADMIN' || cleanId === 'superadmin' || cleanId === 'superadmin@sekolah.sch.id') {
      const user: AuthUser = {
        id: 'USR-SUPERADMIN',
        role: 'SUPER_ADMIN',
        name: 'Drs. H. Bambang Sudiro, M.Pd. (Kepala Sekolah)',
        usernameOrEmail: 'superadmin@sekolah.sch.id'
      };
      setCurrentUser(user);
      setCurrentRole('SUPER_ADMIN');
      return true;
    }

    if (roleOverride === 'ADMIN' || cleanId === 'admin' || cleanId === 'admin@sekolah.sch.id') {
      const user: AuthUser = {
        id: 'USR-ADMIN-01',
        role: 'ADMIN',
        name: 'Siti Rahmawati, S.Pd. (Guru Piket)',
        usernameOrEmail: 'admin@sekolah.sch.id',
        teacherId: 'TCH-002'
      };
      setCurrentUser(user);
      setCurrentRole('ADMIN');
      return true;
    }

    // Check if matching teacher
    const matchedTeacher = teachers.find(t => 
      t.email.toLowerCase() === cleanId || 
      t.nip === cleanId || 
      t.pin === cleanId
    );
    if (matchedTeacher) {
      const user: AuthUser = {
        id: `USR-${matchedTeacher.id}`,
        role: 'ADMIN',
        name: `${matchedTeacher.name} (${matchedTeacher.roleTitle})`,
        usernameOrEmail: matchedTeacher.email,
        teacherId: matchedTeacher.id
      };
      setCurrentUser(user);
      setCurrentRole('ADMIN');
      return true;
    }

    // 1. Cek akun orang tua terdaftar dengan Username = Nama Anak, Nomor HP, atau ID Siswa
    const matchedAccount = parentAccounts.find(acc => 
      acc.studentName.toLowerCase() === cleanId || 
      acc.studentId.toLowerCase() === cleanId || 
      acc.whatsappPhone.includes(cleanId)
    );

    if (matchedAccount) {
      if (password && matchedAccount.password && matchedAccount.password !== password) {
        return false;
      }
      const st = students.find(s => s.id === matchedAccount.studentId) || {
        id: matchedAccount.studentId,
        pin: '1001',
        nisn: '0012345678',
        name: matchedAccount.studentName,
        class: matchedAccount.studentClass,
        gender: 'L' as const,
        parentName: matchedAccount.parentName,
        parentPhone: matchedAccount.whatsappPhone,
        parentEmail: `${matchedAccount.studentName.toLowerCase().replace(/\s+/g, '')}@wali.sekolah.id`,
        avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${matchedAccount.studentName}`,
        fingerprintRegistered: true
      };

      const user: AuthUser = {
        id: `USR-PARENT-${st.id}`,
        role: 'PARENT',
        name: `${matchedAccount.parentName} (Wali dari ${matchedAccount.studentName})`,
        usernameOrEmail: matchedAccount.studentName,
        studentId: st.id
      };
      setCurrentUser(user);
      setCurrentRole('PARENT');
      setSelectedParentStudentId(st.id);
      return true;
    }

    // 2. Cek apakah cocok dengan nama siswa langsung
    const matchedStudentByName = students.find(s => s.name.toLowerCase() === cleanId);
    if (matchedStudentByName) {
      const existingAcc = parentAccounts.find(a => a.studentId === matchedStudentByName.id);
      if (existingAcc && password && existingAcc.password !== password) {
        return false;
      }
      const user: AuthUser = {
        id: `USR-PARENT-${matchedStudentByName.id}`,
        role: 'PARENT',
        name: `${matchedStudentByName.parentName} (Wali dari ${matchedStudentByName.name})`,
        usernameOrEmail: matchedStudentByName.name,
        studentId: matchedStudentByName.id
      };
      setCurrentUser(user);
      setCurrentRole('PARENT');
      setSelectedParentStudentId(matchedStudentByName.id);
      return true;
    }

    // 3. Fallback: Cek PIN BioFinger, NISN, No HP, atau ID Siswa
    const targetStudentId = studentIdOverride;
    const matchedStudent = targetStudentId 
      ? students.find(s => s.id === targetStudentId)
      : students.find(s => 
          s.pin === cleanId || 
          s.nisn === cleanId || 
          s.parentPhone.includes(cleanId) ||
          s.id.toLowerCase() === cleanId
        );

    if (matchedStudent || roleOverride === 'PARENT') {
      const st = matchedStudent || students[0];
      const user: AuthUser = {
        id: `USR-PARENT-${st.id}`,
        role: 'PARENT',
        name: `${st.parentName} (Wali dari ${st.name})`,
        usernameOrEmail: st.name,
        studentId: st.id
      };
      setCurrentUser(user);
      setCurrentRole('PARENT');
      setSelectedParentStudentId(st.id);
      return true;
    }

    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('biofinger_auth_user');
    localStorage.removeItem('biofinger_auth_user');
  };

  // Registrasi Akun Baru Orang Tua (Nama Anak = Username)
  const registerParentAccount = (data: {
    parentName: string;
    studentName: string;
    whatsappPhone: string;
    password: string;
    studentClass?: string;
    avatarUrl?: string;
  }): { success: boolean; message: string; account?: ParentAccount } => {
    const cleanStudentName = data.studentName.trim();
    const cleanParentName = data.parentName.trim();
    const cleanPhone = data.whatsappPhone.trim().replace(/[^0-9]/g, '');
    const cleanClass = data.studentClass?.trim() || 'Kelas 7A';

    const formattedPhone = cleanPhone.startsWith('62') 
      ? cleanPhone 
      : cleanPhone.startsWith('0') 
      ? '62' + cleanPhone.slice(1) 
      : '62' + cleanPhone;

    // Cek apakah akun untuk siswa ini sudah pernah didaftarkan
    const existing = parentAccounts.find(
      acc => acc.studentName.toLowerCase() === cleanStudentName.toLowerCase()
    );
    if (existing) {
      return { 
        success: false, 
        message: `Akun untuk siswa "${cleanStudentName}" sudah terdaftar. Silakan login atau hubungi admin jika lupa password.` 
      };
    }

    const studentAvatar = data.avatarUrl && data.avatarUrl.trim() 
      ? data.avatarUrl.trim() 
      : `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanStudentName}`;

    // Cek atau buatkan data siswa
    let matchedStudent = students.find(
      s => s.name.toLowerCase() === cleanStudentName.toLowerCase()
    );

    if (!matchedStudent) {
      const nextId = `STU-${String(students.length + 1).padStart(3, '0')}`;
      const nextPin = String(1000 + students.length + 1);
      const newStudent: Student = {
        id: nextId,
        pin: nextPin,
        nisn: `00${Math.floor(10000000 + Math.random() * 90000000)}`,
        name: cleanStudentName,
        class: cleanClass,
        gender: 'L',
        parentName: cleanParentName,
        parentPhone: formattedPhone,
        parentEmail: `${cleanStudentName.toLowerCase().replace(/\s+/g, '')}@wali.sekolah.id`,
        avatarUrl: studentAvatar,
        fingerprintRegistered: true
      };
      setStudents(prev => [newStudent, ...prev]);
      matchedStudent = newStudent;
    } else if (data.avatarUrl) {
      setStudents(prev => prev.map(s => s.id === matchedStudent!.id ? { ...s, avatarUrl: studentAvatar } : s));
      matchedStudent = { ...matchedStudent, avatarUrl: studentAvatar };
    }

    const newAccount: ParentAccount = {
      id: `ACC-PARENT-${Date.now()}`,
      parentName: cleanParentName,
      studentName: matchedStudent.name,
      studentId: matchedStudent.id,
      studentClass: matchedStudent.class,
      whatsappPhone: formattedPhone,
      password: data.password.trim(),
      registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'ACTIVE'
    };

    setParentAccounts(prev => [newAccount, ...prev]);

    // Kirim pesan selamat datang resmi diawali Assalamualaikum
    const welcomeMsg: SchoolParentMessage = {
      id: `MSG-WELCOME-${Date.now()}`,
      studentId: matchedStudent.id,
      studentName: matchedStudent.name,
      parentName: cleanParentName,
      parentPhone: formattedPhone,
      senderRole: 'ADMIN',
      senderName: 'Tata Usaha MTs Nurus Salam',
      subject: 'Pendaftaran Akun Wali Murid Berhasil',
      content: `Assalamualaikum Wr. Wb.\n\nYth. Bapak/Ibu ${cleanParentName}, Wali dari ananda ${matchedStudent.name} (${matchedStudent.class}).\n\nAlhamdulillah pendaftaran akun wali murid di MTs Nurus Salam Gebog Kudus telah berhasil. Akun Anda telah aktif dengan rincian login:\n- Username: ${matchedStudent.name}\n- Password: [Sesuai yang Bapak/Ibu buat]\n\nMelalui aplikasi ini, Bapak/Ibu dapat memantau presensi ananda secara langsung dan mengajukan izin/sakit online kapan saja.\n\nWassalamualaikum Wr. Wb.\nMTs Nurus Salam Gebog Kudus`,
      sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      read: false,
      channel: 'BOTH'
    };
    setSchoolParentMessages(prev => [welcomeMsg, ...prev]);

    return {
      success: true,
      message: `Pendaftaran berhasil! Akun untuk wali dari ananda ${matchedStudent.name} telah aktif.`,
      account: newAccount
    };
  };

  // Reset Password Akun Orang Tua oleh Admin / Super Admin
  const resetParentPassword = (accountId: string, newPassword?: string): { success: boolean; message: string; newPassword: string } => {
    const acc = parentAccounts.find(a => a.id === accountId);
    if (!acc) return { success: false, message: 'Akun wali murid tidak ditemukan.', newPassword: '' };

    const genPassword = newPassword && newPassword.trim() ? newPassword.trim() : `mts${Math.floor(100000 + Math.random() * 900000)}`;

    setParentAccounts(prev => prev.map(a => {
      if (a.id === accountId) {
        return {
          ...a,
          password: genPassword,
          lastResetAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
          resetBy: currentRole
        };
      }
      return a;
    }));

    // Kirim pesan notifikasi reset password santun diawali Assalamualaikum
    const resetMsg: SchoolParentMessage = {
      id: `MSG-RESET-${Date.now()}`,
      studentId: acc.studentId,
      studentName: acc.studentName,
      parentName: acc.parentName,
      parentPhone: acc.whatsappPhone,
      senderRole: currentRole === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN',
      senderName: currentRole === 'SUPER_ADMIN' ? 'Kepala Sekolah MTs Nurus Salam' : 'Guru Piket MTs Nurus Salam',
      subject: 'Pemberitahuan Reset Password Akun Aplikasi',
      content: `Assalamualaikum Wr. Wb.\n\nYth. Bapak/Ibu ${acc.parentName}, Wali dari ananda ${acc.studentName} (${acc.studentClass}).\n\nMenindaklanjuti permohonan reset password, akun aplikasi presensi ananda di MTs Nurus Salam Gebog Kudus telah berhasil direset oleh pihak sekolah dengan informasi sebagai berikut:\n\n- Username: ${acc.studentName}\n- Password Baru: ${genPassword}\n\nSilakan gunakan kredensial tersebut untuk login kembali ke aplikasi. Demi keamanan, simpanlah password ini dengan baik.\n\nWassalamualaikum Wr. Wb.\nMTs Nurus Salam Gebog Kudus`,
      sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      read: false,
      channel: 'BOTH'
    };
    setSchoolParentMessages(prev => [resetMsg, ...prev]);

    return {
      success: true,
      message: `Password akun ${acc.studentName} berhasil direset menjadi: ${genPassword}`,
      newPassword: genPassword
    };
  };

  // Kirim Pesan Resmi Madrasah ke Orang Tua (Wajib diawali Assalamualaikum Wr. Wb.)
  const sendMessageToParent = (data: {
    studentId: string;
    subject: string;
    content: string;
    channel: 'APP' | 'WHATSAPP' | 'BOTH';
  }): { success: boolean; message: string } => {
    const student = students.find(s => s.id === data.studentId);
    if (!student) return { success: false, message: 'Data siswa tidak ditemukan.' };

    // Pastikan seluruh pesan diawali dengan Assalamualaikum Wr. Wb.
    let finalContent = data.content.trim();
    if (!finalContent.toLowerCase().startsWith('assalamualaikum')) {
      finalContent = `Assalamualaikum Wr. Wb.\n\n${finalContent}`;
    }

    const newMsg: SchoolParentMessage = {
      id: `MSG-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      senderRole: currentRole === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'ADMIN',
      senderName: currentUser?.name || (currentRole === 'SUPER_ADMIN' ? 'Kepala Sekolah MTs Nurus Salam' : 'Guru Piket MTs Nurus Salam'),
      subject: data.subject.trim(),
      content: finalContent,
      sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      read: false,
      channel: data.channel
    };

    setSchoolParentMessages(prev => [newMsg, ...prev]);

    return {
      success: true,
      message: `Pesan resmi berhasil dikirimkan ke akun wali murid ${student.name}.`
    };
  };

  // Balasan Interaktif Real-Time dari Orang Tua ke Admin / Guru Piket
  const sendParentReplyMessage = (studentId: string, content: string): { success: boolean; message: string } => {
    const student = students.find(s => s.id === studentId);
    if (!student) return { success: false, message: 'Data siswa tidak ditemukan.' };

    let cleanContent = content.trim();
    if (!cleanContent.toLowerCase().startsWith('assalamualaikum') && !cleanContent.toLowerCase().startsWith('waalaikumsalam')) {
      cleanContent = `Assalamualaikum Wr. Wb.\n\n${cleanContent}`;
    }

    const parentMsg: SchoolParentMessage = {
      id: `MSG-PARENT-${Date.now()}`,
      studentId: student.id,
      studentName: student.name,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      senderRole: 'PARENT',
      senderName: `${student.parentName} (Wali Murid)`,
      subject: 'Balasan Pesan dari Orang Tua',
      content: cleanContent,
      sentAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      read: true,
      channel: 'APP'
    };

    setSchoolParentMessages(prev => [...prev, parentMsg]);

    return {
      success: true,
      message: 'Pesan berhasil terkirim ke Guru Piket MTs Nurus Salam.'
    };
  };

  const markMessageAsRead = (messageId: string) => {
    setSchoolParentMessages(prev => prev.map(m => m.id === messageId ? { ...m, read: true } : m));
  };

  const markAllStudentMessagesAsRead = (studentId: string) => {
    setSchoolParentMessages(prev => prev.map(m => m.studentId === studentId ? { ...m, read: true } : m));
  };

  // Announcements CRUD (Admin bisa membuat, mengedit, & menghapus)
  const addAnnouncement = (data: Omit<SchoolAnnouncement, 'id' | 'publishedAt'>) => {
    const newAnn: SchoolAnnouncement = {
      ...data,
      id: `ANN-${Date.now()}`,
      publishedAt: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    return { 
      success: true, 
      message: 'Pengumuman resmi madrasah berhasil diterbitkan ke seluruh akun!', 
      announcement: newAnn 
    };
  };

  const updateAnnouncement = (id: string, data: Partial<Omit<SchoolAnnouncement, 'id'>>) => {
    setAnnouncements(prev => prev.map(a => a.id === id ? { ...a, ...data } : a));
    return { success: true, message: 'Pengumuman berhasil diperbarui!' };
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
    return { success: true, message: 'Pengumuman berhasil dihapus.' };
  };

  // Student CRUD: Add & Delete
  const addStudent = (data: Omit<Student, 'id'>) => {
    // Generate next student ID and PIN if not provided
    const nextIdx = students.length + 1;
    const newId = `STU-${String(nextIdx).padStart(3, '0')}`;
    const newPin = data.pin || String(1000 + nextIdx);

    // Verify PIN isn't already taken
    if (students.some(s => s.pin === newPin)) {
      return { success: false, message: `PIN [${newPin}] sudah digunakan oleh siswa lain.` };
    }

    const newStudent: Student = {
      ...data,
      id: newId,
      pin: newPin,
      avatarUrl: data.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=e2e8f0,b6e3f4,ffd5dc`,
      fingerprintRegistered: data.fingerprintRegistered ?? false
    };

    setStudents(prev => [newStudent, ...prev]);
    return { 
      success: true, 
      message: `Siswa ${newStudent.name} (${newStudent.class}) dengan PIN ${newStudent.pin} berhasil ditambahkan!`,
      student: newStudent
    };
  };

  const deleteStudent = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) {
      return { success: false, message: 'Siswa tidak ditemukan.' };
    }

    setStudents(prev => prev.filter(s => s.id !== studentId));
    // Also remove from today's attendance records
    setAttendanceRecords(prev => prev.filter(r => r.studentId !== studentId));
    
    return { 
      success: true, 
      message: `Siswa ${student.name} (${student.class}) berhasil dihapus dari sistem.` 
    };
  };

  // Teacher CRUD: Add & Delete
  const addTeacher = (data: Omit<Teacher, 'id'>) => {
    const nextIdx = teachers.length + 1;
    const newId = `TCH-${String(nextIdx).padStart(3, '0')}`;
    const newPin = data.pin || String(2000 + nextIdx);

    const newTeacher: Teacher = {
      ...data,
      id: newId,
      pin: newPin,
      avatarUrl: data.avatarUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(data.name)}&backgroundColor=b6e3f4,c0aede`,
      fingerprintRegistered: data.fingerprintRegistered ?? false
    };

    setTeachers(prev => [newTeacher, ...prev]);
    return {
      success: true,
      message: `Guru / Staff ${newTeacher.name} berhasil ditambahkan dengan PIN ${newTeacher.pin}!`,
      teacher: newTeacher
    };
  };

  const deleteTeacher = (teacherId: string) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) {
      return { success: false, message: 'Guru tidak ditemukan.' };
    }

    setTeachers(prev => prev.filter(t => t.id !== teacherId));
    return {
      success: true,
      message: `Data guru ${teacher.name} berhasil dihapus dari sistem.`
    };
  };

  // Fingerprint Enrollment (Perekaman Sidik Jari untuk Pertama Kali)
  const enrollFingerprint = (
    personId: string, 
    personType: 'STUDENT' | 'TEACHER', 
    fingerIndex: 'TELUNJUK_KANAN' | 'JEMPOL_KANAN' | 'TELUNJUK_KIRI' | 'JEMPOL_KIRI', 
    qualityScore: number
  ) => {
    let personName = '';
    let pin = '';

    if (personType === 'STUDENT') {
      const student = students.find(s => s.id === personId);
      if (!student) return { success: false, message: 'Siswa tidak ditemukan.' };
      personName = student.name;
      pin = student.pin;

      // Update student fingerprint status
      setStudents(prev => prev.map(s => s.id === personId ? { ...s, fingerprintRegistered: true } : s));
    } else {
      const teacher = teachers.find(t => t.id === personId);
      if (!teacher) return { success: false, message: 'Guru tidak ditemukan.' };
      personName = teacher.name;
      pin = teacher.pin;

      // Update teacher fingerprint status
      setTeachers(prev => prev.map(t => t.id === personId ? { ...t, fingerprintRegistered: true } : t));
    }

    const now = new Date();
    const enrolledAtStr = now.toISOString().replace('T', ' ').slice(0, 19);

    const log: FingerprintEnrollment = {
      id: `ENROLL-${Date.now()}`,
      personId,
      personName,
      personType,
      pin,
      fingerIndex,
      qualityScore,
      enrolledAt: enrolledAtStr,
      enrolledDevice: `${schoolConfig.deviceModel} (Optik 500 DPI)`
    };

    setEnrollmentLogs(prev => [log, ...prev]);

    return {
      success: true,
      message: `Perekaman sidik jari ${personName} (PIN: ${pin}, Jari: ${fingerIndex.replace(/_/g, ' ')}) berhasil dengan skor kualitas ${qualityScore}%. Data biometrik tersimpan di mesin AT-101!`
    };
  };

  const updateSchoolConfig = (newConfig: Partial<SchoolConfig>) => {
    setSchoolConfig(prev => ({ ...prev, ...newConfig }));
  };

  // BioFinger AT-101 scan processing
  const processBioFingerScan = (
    pin: string, 
    stateOverride?: 0 | 1, 
    customTime?: string, 
    verifyMode: 'FINGERPRINT' | 'RFID' | 'PASSWORD' = 'FINGERPRINT'
  ) => {
    const student = students.find(s => s.pin === pin || s.rfidCard === pin || s.id === pin);
    if (!student) {
      return { success: false, message: `PIN / Kartu [${pin}] tidak terdaftar di database 480 siswa.` };
    }

    const now = new Date();
    const timeNowStr = customTime || `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const dateToday = activeDate;

    // Check existing record for this student today
    const existingRec = attendanceRecords.find(r => r.studentId === student.id && r.date === dateToday);

    let isCheckIn = true;
    if (stateOverride !== undefined) {
      isCheckIn = stateOverride === 0;
    } else {
      // Automatic detection: if already checked in and current time is past 11:30 AM, treat as check-out
      const hour = parseInt(timeNowStr.split(':')[0], 10);
      if (existingRec && existingRec.checkInTime && hour >= 11) {
        isCheckIn = false;
      }
    }

    let updatedRecord: AttendanceRecord;
    let notifDirection: 'CHECK_IN' | 'CHECK_OUT';
    let notifStatusText = '';

    if (isCheckIn) {
      notifDirection = 'CHECK_IN';
      const lateM = calculateLateMinutes(timeNowStr, schoolConfig.checkInDeadline);
      const isLate = lateM > 0;
      const status: AttendanceStatus = isLate ? 'TERLAMBAT' : 'HADIR_TEPAT';
      notifStatusText = isLate ? `Terlambat (${lateM} menit)` : 'Tepat Waktu';

      updatedRecord = {
        id: existingRec ? existingRec.id : `ATT-${dateToday}-${student.id}`,
        studentId: student.id,
        date: dateToday,
        checkInTime: timeNowStr,
        checkOutTime: existingRec?.checkOutTime,
        status: status,
        lateMinutes: lateM,
        checkInDevice: `${schoolConfig.deviceModel} (ID: ${pin})`,
        checkOutDevice: existingRec?.checkOutDevice,
        whatsappCheckInSent: schoolConfig.waAutoSend,
        emailCheckInSent: schoolConfig.emailAutoSend,
        lastUpdated: new Date().toISOString()
      };
    } else {
      notifDirection = 'CHECK_OUT';
      notifStatusText = 'Pulang Sekolah';

      updatedRecord = {
        id: existingRec ? existingRec.id : `ATT-${dateToday}-${student.id}`,
        studentId: student.id,
        date: dateToday,
        checkInTime: existingRec?.checkInTime || timeNowStr,
        checkOutTime: timeNowStr,
        status: existingRec?.status || 'HADIR_TEPAT',
        lateMinutes: existingRec?.lateMinutes || 0,
        checkInDevice: existingRec?.checkInDevice || `${schoolConfig.deviceModel} (ID: ${pin})`,
        checkOutDevice: `${schoolConfig.deviceModel} (ID: ${pin})`,
        whatsappCheckOutSent: schoolConfig.waAutoSend,
        emailCheckOutSent: schoolConfig.emailAutoSend,
        lastUpdated: new Date().toISOString()
      };
    }

    // Update attendance state
    setAttendanceRecords(prev => {
      const idx = prev.findIndex(r => r.id === updatedRecord.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updatedRecord;
        return copy;
      }
      return [updatedRecord, ...prev];
    });

    // Add to recent scans radar
    const scanLog: BioFingerLogEntry = {
      id: `SCAN-${Date.now()}-${pin}`,
      pin: student.pin,
      timestamp: `${dateToday} ${timeNowStr}`,
      state: isCheckIn ? 0 : 1,
      verifyMode: verifyMode,
      deviceId: schoolConfig.deviceModel,
      workCode: 0
    };
    setRecentScans(prev => [scanLog, ...prev.slice(0, 49)]);

    // Prepare and dispatch WhatsApp & Email Notification
    const template = isCheckIn 
      ? (updatedRecord.status === 'TERLAMBAT' ? schoolConfig.waLateTemplate : schoolConfig.waCheckInTemplate)
      : schoolConfig.waCheckOutTemplate;

    const formattedMessage = formatWhatsAppMessage(
      template,
      student,
      timeNowStr,
      dateToday,
      notifStatusText,
      schoolConfig,
      isCheckIn ? (updatedRecord.status === 'TERLAMBAT' ? 'LATE' : 'CHECK_IN') : 'CHECK_OUT'
    );

    const waLink = generateDirectWhatsAppUrl(student.parentPhone, formattedMessage);

    const newNotifLog: NotificationLog = {
      id: `NOTIF-${Date.now()}-${student.id}`,
      studentId: student.id,
      studentName: student.name,
      className: student.class,
      recipientName: student.parentName,
      recipientContact: student.parentPhone,
      channel: 'WHATSAPP',
      direction: notifDirection,
      status: 'DELIVERED',
      content: formattedMessage,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      waDirectUrl: waLink
    };

    const emailNotifLog: NotificationLog = {
      id: `NOTIF-EMAIL-${Date.now()}-${student.id}`,
      studentId: student.id,
      studentName: student.name,
      className: student.class,
      recipientName: student.parentName,
      recipientContact: student.parentEmail,
      channel: 'EMAIL',
      direction: notifDirection,
      status: 'DELIVERED',
      content: `Laporan Presensi ${student.name}: ${notifStatusText} pukul ${timeNowStr} WIB.`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    setNotificationLogs(prev => [newNotifLog, emailNotifLog, ...prev.slice(0, 298)]);

    // Kirim notifikasi pesan resmi ke akun aplikasi orang tua siswa secara presisi berdasarkan Nama Anak & PIN BioFinger
    const parentAttMsg: SchoolParentMessage = {
      id: `MSG-ATT-${Date.now()}-${student.id}`,
      studentId: student.id,
      studentName: student.name,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      senderRole: 'ADMIN',
      senderName: 'Sistem BIO Finger AT-101 MTs Nurus Salam',
      subject: `Notifikasi Presensi ${isCheckIn ? 'Masuk' : 'Pulang'} - ${student.name}`,
      content: `Assalamualaikum Wr. Wb.\n\nYth. Bapak/Ibu ${student.parentName}, Wali dari ananda ${student.name} (${student.class}).\n\nAlhamdulillah, ananda telah berhasil terdeteksi melakukan scan sidik jari pada mesin BIO Finger AT-101 MTs Nurus Salam Gebog Kudus:\n\n- Nama Anak: ${student.name}\n- PIN BioFinger: ${student.pin}\n- Waktu Scan: ${timeNowStr} WIB\n- Status: ${notifStatusText}\n- Tanggal: ${dateToday}\n\nNotifikasi ini terkirim secara presisi langsung ke akun aplikasi ini.\n\nWassalamualaikum Wr. Wb.\nMTs Nurus Salam Gebog Kudus`,
      sentAt: `${dateToday} ${timeNowStr}`,
      read: false,
      channel: 'BOTH'
    };

    setSchoolParentMessages(prev => [parentAttMsg, ...prev]);

    return {
      success: true,
      message: `${student.name} (${student.class}) berhasil presensi ${isCheckIn ? 'MASUK' : 'PULANG'}. Laporan langsung tersinkronisasi presisi ke akun orang tua & WhatsApp ${student.parentPhone}!`,
      record: updatedRecord
    };
  };

  // Batch import from BIO Finger AT-101 Excel/CSV
  const processBatchExcelRows = (rows: ParsedBioFingerRow[]) => {
    let processed = 0;
    let errors = 0;
    let lateCount = 0;

    rows.forEach(row => {
      const stateNorm: 0 | 1 = row.state === 1 ? 1 : 0;
      const res = processBioFingerScan(
        row.pin, 
        stateNorm, 
        row.timestamp.split(' ')[1] || row.timestamp, 
        row.verifyMode
      );
      if (res.success) {
        processed++;
        if (res.record?.status === 'TERLAMBAT') {
          lateCount++;
        }
      } else {
        errors++;
      }
    });

    return {
      total: rows.length,
      processed,
      errors,
      lateCount
    };
  };

  const updateAttendanceManual = (studentId: string, status: AttendanceStatus, notes?: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const dateToday = activeDate;
    const existing = attendanceRecords.find(r => r.studentId === studentId && r.date === dateToday);

    const updated: AttendanceRecord = {
      id: existing ? existing.id : `ATT-${dateToday}-${studentId}`,
      studentId,
      date: dateToday,
      checkInTime: existing?.checkInTime,
      checkOutTime: existing?.checkOutTime,
      status,
      notes: notes || existing?.notes,
      checkInDevice: 'Manual Guru Piket / Admin',
      lastUpdated: new Date().toISOString()
    };

    setAttendanceRecords(prev => {
      const idx = prev.findIndex(r => r.id === updated.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [updated, ...prev];
    });

    // Notify parent about status change
    const msg = `*UPDATE PRESENSI SISWA* 🏫\n${schoolConfig.schoolName}\n\nYth. *${student.parentName}*,\nPresensi *${student.name}* (${student.class}) tanggal ${dateToday} telah dicatat sebagai *${status}*.\nCatatan: ${notes || '-'}\n\n_Sistem Absensi BIO Finger AT-101 Cloud_`;
    const waLink = generateDirectWhatsAppUrl(student.parentPhone, msg);

    const notif: NotificationLog = {
      id: `NOTIF-${Date.now()}-${student.id}`,
      studentId: student.id,
      studentName: student.name,
      className: student.class,
      recipientName: student.parentName,
      recipientContact: student.parentPhone,
      channel: 'WHATSAPP',
      direction: 'MANUAL',
      status: 'DELIVERED',
      content: msg,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      waDirectUrl: waLink
    };

    setNotificationLogs(prev => [notif, ...prev.slice(0, 299)]);
  };

  const submitPermission = (studentId: string, type: 'SAKIT' | 'IZIN', reason: string, startDate: string, endDate: string, parentNote?: string) => {
    const newReq: PermissionRequest = {
      id: `PERM-${Date.now()}`,
      studentId,
      type,
      startDate,
      endDate,
      reason,
      status: 'PENDING',
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      parentNote
    };

    setPermissions(prev => [newReq, ...prev]);
  };

  const approvePermission = (permissionId: string) => {
    setPermissions(prev => prev.map(p => {
      if (p.id === permissionId) {
        // Auto update today's attendance if matches
        updateAttendanceManual(p.studentId, p.type, `Pengajuan Izin Online disetujui: ${p.reason}`);
        return { ...p, status: 'APPROVED' };
      }
      return p;
    }));
  };

  const rejectPermission = (permissionId: string) => {
    setPermissions(prev => prev.map(p => p.id === permissionId ? { ...p, status: 'REJECTED' } : p));
  };

  const resendNotification = (logId: string) => {
    setNotificationLogs(prev => prev.map(l => {
      if (l.id === logId) {
        return { ...l, status: 'DELIVERED', timestamp: new Date().toLocaleTimeString('id-ID') };
      }
      return l;
    }));
  };

  const resetAllData = () => {
    localStorage.removeItem('biofinger_attendance_v1');
    localStorage.removeItem('biofinger_notifs_v1');
    localStorage.removeItem('biofinger_config_v1');
    localStorage.removeItem('biofinger_students_v1');
    window.location.reload();
  };

  return (
    <AttendanceContext.Provider
      value={{
        currentUser,
        login,
        logout,
        students,
        teachers,
        attendanceRecords,
        activeDate,
        setActiveDate,
        currentRole,
        setCurrentRole,
        selectedParentStudentId,
        setSelectedParentStudentId,
        schoolConfig,
        updateSchoolConfig,
        notificationLogs,
        recentScans,
        permissions,
        enrollmentLogs,
        addStudent,
        deleteStudent,
        addTeacher,
        deleteTeacher,
        enrollFingerprint,
        processBioFingerScan,
        processBatchExcelRows,
        updateAttendanceManual,
        submitPermission,
        approvePermission,
        rejectPermission,
        resendNotification,
        resetAllData,
        supabaseConfig,
        updateSupabaseConfig,
        parentAccounts,
        registerParentAccount,
        resetParentPassword,
        schoolParentMessages,
        sendMessageToParent,
        sendParentReplyMessage,
        markMessageAsRead,
        markAllStudentMessagesAsRead,
        announcements,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
