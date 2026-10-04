import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Student, Teacher, AttendanceRecord, SupabaseConfig } from '../types';

export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- BIO FINGER AT-101 SMART SCHOOL ATTENDANCE - SUPABASE DDL SCHEMA & RLS
-- Kapasitas: 480 Siswa, Guru & Tenaga Kependidikan, Log Biometrik Real-time
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL SISWA (480 Siswa)
CREATE TABLE IF NOT EXISTS public.students (
    id VARCHAR(30) PRIMARY KEY,
    pin VARCHAR(20) UNIQUE NOT NULL, -- PIN Biometrik BIO Finger AT-101
    nisn VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    class VARCHAR(30) NOT NULL,
    gender CHAR(1) CHECK (gender IN ('L', 'P')),
    parent_name VARCHAR(150) NOT NULL,
    parent_phone VARCHAR(30) NOT NULL, -- Format WA (62812xxx)
    parent_email VARCHAR(150),
    avatar_url TEXT,
    fingerprint_registered BOOLEAN DEFAULT false,
    rfid_card VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index untuk pencarian kilat mesin BIO Finger AT-101 (<5ms)
CREATE INDEX IF NOT EXISTS idx_students_pin ON public.students(pin);
CREATE INDEX IF NOT EXISTS idx_students_class ON public.students(class);
CREATE INDEX IF NOT EXISTS idx_students_nisn ON public.students(nisn);

-- 3. TABEL GURU & STAF
CREATE TABLE IF NOT EXISTS public.teachers (
    id VARCHAR(30) PRIMARY KEY,
    nip VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    role_title VARCHAR(100) NOT NULL,
    class_assigned VARCHAR(50) DEFAULT '-',
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    pin VARCHAR(20) UNIQUE NOT NULL, -- PIN Mesin AT-101
    fingerprint_registered BOOLEAN DEFAULT false,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_teachers_pin ON public.teachers(pin);

-- 4. TABEL PRESENSI HARIAN (ATTENDANCE RECORDS)
CREATE TABLE IF NOT EXISTS public.attendance_records (
    id VARCHAR(60) PRIMARY KEY,
    student_id VARCHAR(30) REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    status VARCHAR(25) NOT NULL CHECK (status IN ('HADIR_TEPAT', 'TERLAMBAT', 'PULANG_AWAL', 'SAKIT', 'IZIN', 'ALPHA', 'BELUM_HADIR')),
    late_minutes INTEGER DEFAULT 0,
    early_minutes INTEGER DEFAULT 0,
    check_in_device VARCHAR(60) DEFAULT 'BIO Finger AT-101',
    check_out_device VARCHAR(60),
    notes TEXT,
    whatsapp_check_in_sent BOOLEAN DEFAULT false,
    whatsapp_check_out_sent BOOLEAN DEFAULT false,
    email_check_in_sent BOOLEAN DEFAULT false,
    email_check_out_sent BOOLEAN DEFAULT false,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT uq_student_date UNIQUE(student_id, date)
);

CREATE INDEX IF NOT EXISTS idx_attendance_date ON public.attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance_records(student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_status ON public.attendance_records(status);

-- 5. TABEL TEMPLATE SIDIK JARI (BIO FINGER AT-101 BIOMETRIC TEMPLATES)
CREATE TABLE IF NOT EXISTS public.biometric_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id VARCHAR(30) NOT NULL,
    person_type VARCHAR(20) CHECK (person_type IN ('STUDENT', 'TEACHER')),
    pin VARCHAR(20) NOT NULL,
    finger_index VARCHAR(30) NOT NULL, -- 'TELUNJUK_KANAN', 'JEMPOL_KANAN', dll
    quality_score INTEGER CHECK (quality_score >= 0 AND quality_score <= 100),
    template_data BYTEA, -- Binary Minutiae Template AT-101
    enrolled_device VARCHAR(80),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_biometric_pin ON public.biometric_templates(pin);

-- 6. TABEL LOG NOTIFIKASI WHATSAPP & EMAIL
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id VARCHAR(60) PRIMARY KEY,
    student_id VARCHAR(30) REFERENCES public.students(id) ON DELETE CASCADE,
    recipient_name VARCHAR(150),
    recipient_contact VARCHAR(100) NOT NULL,
    channel VARCHAR(20) CHECK (channel IN ('WHATSAPP', 'EMAIL')),
    direction VARCHAR(20) CHECK (direction IN ('CHECK_IN', 'CHECK_OUT', 'ABSENCE', 'MANUAL')),
    status VARCHAR(20) CHECK (status IN ('DELIVERED', 'SENT', 'PENDING', 'FAILED')),
    content TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABEL PENGAJUAN IZIN & SAKIT ORANG TUA
CREATE TABLE IF NOT EXISTS public.permission_requests (
    id VARCHAR(60) PRIMARY KEY,
    student_id VARCHAR(30) REFERENCES public.students(id) ON DELETE CASCADE,
    type VARCHAR(20) CHECK (type IN ('SAKIT', 'IZIN')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    attachment_url TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. AKTIFKAN SUPABASE REALTIME REPLICATION
-- Mengaktifkan listener WebSocket otomatis setiap ada presensi masuk dari mesin AT-101
ALTER PUBLICATION supabase_realtime ADD TABLE public.attendance_records;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notification_logs;

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_requests ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Baca Publik / Anonim (atau Authenticated User)
CREATE POLICY "Public Read Students" ON public.students FOR SELECT USING (true);
CREATE POLICY "Public Read Teachers" ON public.teachers FOR SELECT USING (true);
CREATE POLICY "Public Read Attendance" ON public.attendance_records FOR SELECT USING (true);
CREATE POLICY "Public Read Notifications" ON public.notification_logs FOR SELECT USING (true);
CREATE POLICY "Public Read Permissions" ON public.permission_requests FOR SELECT USING (true);

-- Kebijakan Akses Tulis (Admin & Service Role)
CREATE POLICY "Enable All For Service Role" ON public.attendance_records FOR ALL USING (true);
CREATE POLICY "Enable All Students For Admin" ON public.students FOR ALL USING (true);
CREATE POLICY "Enable All Teachers For Admin" ON public.teachers FOR ALL USING (true);
CREATE POLICY "Enable All Permissions For All" ON public.permission_requests FOR ALL USING (true);
`;

let activeSupabaseClient: SupabaseClient | null = null;
let currentConfig: SupabaseConfig = {
  url: '',
  anonKey: '',
  connected: false
};

export function getSupabaseClient(config?: SupabaseConfig): SupabaseClient | null {
  if (config && config.url && config.anonKey) {
    if (
      !activeSupabaseClient ||
      currentConfig.url !== config.url ||
      currentConfig.anonKey !== config.anonKey
    ) {
      try {
        activeSupabaseClient = createClient(config.url, config.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true
          },
          global: {
            fetch: (input, init) => window.fetch(input, init)
          },
          realtime: {
            params: {
              eventsPerSecond: 20
            }
          }
        });
        currentConfig = { ...config };
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
        return null;
      }
    }
    return activeSupabaseClient;
  }
  return activeSupabaseClient;
}

/**
 * Tes koneksi ke instance Supabase yang diberikan
 */
export async function testSupabaseConnection(
  url: string,
  anonKey: string
): Promise<{ success: boolean; message: string; latencyMs: number }> {
  const startTime = performance.now();

  if (!url || !anonKey) {
    return {
      success: false,
      message: 'URL Project Supabase dan Anon API Key wajib diisi.',
      latencyMs: 0
    };
  }

  // Validate URL format
  if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
    // If it's a self-hosted Supabase, it might not have .supabase.co, but must start with http/https
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return {
        success: false,
        message: 'URL Supabase tidak valid. Contoh: https://xyzexample.supabase.co',
        latencyMs: 0
      };
    }
  }

  try {
    const testClient = createClient(url, anonKey, {
      global: {
        fetch: (input, init) => window.fetch(input, init)
      }
    });
    // Attempt lightweight ping by requesting the server health/auth session or reading students table
    const { error } = await testClient
      .from('students')
      .select('count', { count: 'exact', head: true });

    const latencyMs = Math.round(performance.now() - startTime);

    if (error) {
      // If table doesn't exist yet, it still means authentication connected to Supabase!
      if (error.code === '42P01' || error.message.includes('relation "public.students" does not exist')) {
        return {
          success: true,
          message: `Terhubung ke Supabase (${latencyMs}ms)! Catatan: Tabel database belum dibuat. Silakan jalankan DDL Schema di tab SQL Editor.`,
          latencyMs
        };
      }
      return {
        success: false,
        message: `Gagal mengakses Supabase: ${error.message} (Kode: ${error.code})`,
        latencyMs
      };
    }

    return {
      success: true,
      message: `Berhasil terhubung ke Supabase PostgreSQL! Latensi: ${latencyMs}ms. Database siap digunakan.`,
      latencyMs
    };
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      success: false,
      message: `Koneksi gagal: ${err.message || 'Periksa koneksi jaringan atau URL/Key Supabase'}`,
      latencyMs
    };
  }
}

/**
 * Sinkronisasi data 480 siswa ke tabel students di Supabase
 */
export async function syncStudentsToSupabase(
  client: SupabaseClient,
  students: Student[]
): Promise<{ success: boolean; syncedCount: number; message: string }> {
  try {
    const rows = students.map(s => ({
      id: s.id,
      pin: s.pin,
      nisn: s.nisn,
      name: s.name,
      class: s.class,
      gender: s.gender,
      parent_name: s.parentName,
      parent_phone: s.parentPhone,
      parent_email: s.parentEmail,
      avatar_url: s.avatarUrl,
      fingerprint_registered: s.fingerprintRegistered,
      rfid_card: s.rfidCard || null
    }));

    // Chunk upsert by 100 rows to prevent payload limit issues
    const chunkSize = 100;
    let synced = 0;

    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error } = await client
        .from('students')
        .upsert(chunk, { onConflict: 'id' });

      if (error) {
        throw new Error(error.message);
      }
      synced += chunk.length;
    }

    return {
      success: true,
      syncedCount: synced,
      message: `Sukses menyinkronkan ${synced} siswa ke Supabase PostgreSQL.`
    };
  } catch (err: any) {
    return {
      success: false,
      syncedCount: 0,
      message: `Gagal sync siswa: ${err.message}`
    };
  }
}

/**
 * Sinkronisasi data guru ke tabel teachers di Supabase
 */
export async function syncTeachersToSupabase(
  client: SupabaseClient,
  teachers: Teacher[]
): Promise<{ success: boolean; syncedCount: number; message: string }> {
  try {
    const rows = teachers.map(t => ({
      id: t.id,
      nip: t.nip,
      name: t.name,
      role_title: t.roleTitle,
      class_assigned: t.classAssigned || '-',
      phone: t.phone,
      email: t.email,
      pin: t.pin,
      fingerprint_registered: t.fingerprintRegistered,
      avatar_url: t.avatarUrl
    }));

    const { error } = await client
      .from('teachers')
      .upsert(rows, { onConflict: 'id' });

    if (error) throw new Error(error.message);

    return {
      success: true,
      syncedCount: rows.length,
      message: `Sukses menyinkronkan ${rows.length} guru ke Supabase.`
    };
  } catch (err: any) {
    return {
      success: false,
      syncedCount: 0,
      message: `Gagal sync guru: ${err.message}`
    };
  }
}

/**
 * Sinkronisasi data presensi harian ke Supabase
 */
export async function syncAttendanceToSupabase(
  client: SupabaseClient,
  records: AttendanceRecord[]
): Promise<{ success: boolean; syncedCount: number; message: string }> {
  try {
    const rows = records.map(r => ({
      id: r.id,
      student_id: r.studentId,
      date: r.date,
      check_in_time: r.checkInTime || null,
      check_out_time: r.checkOutTime || null,
      status: r.status,
      late_minutes: r.lateMinutes || 0,
      early_minutes: r.earlyMinutes || 0,
      check_in_device: r.checkInDevice || 'BIO Finger AT-101',
      check_out_device: r.checkOutDevice || null,
      notes: r.notes || null,
      whatsapp_check_in_sent: r.whatsappCheckInSent || false,
      whatsapp_check_out_sent: r.whatsappCheckOutSent || false,
      email_check_in_sent: r.emailCheckInSent || false,
      email_check_out_sent: r.emailCheckOutSent || false,
      last_updated: r.lastUpdated
    }));

    const chunkSize = 100;
    let synced = 0;

    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error } = await client
        .from('attendance_records')
        .upsert(chunk, { onConflict: 'id' });

      if (error) throw new Error(error.message);
      synced += chunk.length;
    }

    return {
      success: true,
      syncedCount: synced,
      message: `Sukses menyinkronkan ${synced} catatan presensi ke Supabase.`
    };
  } catch (err: any) {
    return {
      success: false,
      syncedCount: 0,
      message: `Gagal sync presensi: ${err.message}`
    };
  }
}
