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
  SupabaseConfig
} from '../types';
import { generate480Students } from '../data/mockStudents';
import { INITIAL_TEACHERS } from '../data/mockTeachers';
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
  schoolName: 'SMP / SMA NEGERI 1 BINTANG BANGSA',
  schoolAddress: 'Jl. Pendidikan No. 45, Kompleks Akademik Terpadu',
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

    // Check if student / parent PIN, NISN, phone, or studentId
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
        usernameOrEmail: st.parentEmail,
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

    return {
      success: true,
      message: `${student.name} (${student.class}) berhasil presensi ${isCheckIn ? 'MASUK' : 'PULANG'}. Notifikasi terkirim ke WhatsApp ${student.parentPhone}!`,
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
        updateSupabaseConfig
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
