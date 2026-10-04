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
import { ParentAccountsManager } from './ParentAccountsManager';
import { AnnouncementManager } from './AnnouncementManager';
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
  Sparkles,
  Rocket,
  Tv,
  Key,
  Bell,
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  Layers
} from 'lucide-react';

type TabKey = 'scan' | 'realtime' | 'students' | 'teachers' | 'enrollment' | 'excel' | 'broadcast' | 'permissions' | 'parent_accounts' | 'announcements';

interface AdminMenuItem {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
  description: string;
  badge?: string;
  badgeColor?: string;
}

interface AdminMenuCategory {
  group: string;
  items: AdminMenuItem[];
}

interface AdminDashboardProps {
  onOpenTrialKit?: () => void;
  onOpenKiosk?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenTrialKit, onOpenKiosk }) => {
  const { recentScans, permissions, notificationLogs, teachers, parentAccounts, announcements } = useAttendance();
  const [activeTab, setActiveTab] = useState<TabKey>('scan');
  const [enrollTarget, setEnrollTarget] = useState<{ id: string; type: 'STUDENT' | 'TEACHER' } | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const pendingPermissionsCount = permissions.filter(p => p.status === 'PENDING').length;

  const handleTriggerTeacherEnroll = (teacher: any) => {
    setEnrollTarget({ id: teacher.id, type: 'TEACHER' });
    setActiveTab('enrollment');
    setIsMenuOpen(false);
  };

  const menuCategories: AdminMenuCategory[] = [
    {
      group: 'Biometrik & Presensi Mesin AT-101',
      items: [
        {
          key: 'scan' as const,
          label: 'Terminal Scan & Live Feed',
          icon: <Fingerprint className="w-4 h-4 text-blue-500" />,
          description: 'Monitoring kehadiran real-time & radar scan sidik jari',
          badge: recentScans.length > 0 ? `${recentScans.length} Aktivitas` : undefined,
          badgeColor: 'bg-emerald-100 text-emerald-800'
        },
        {
          key: 'enrollment' as const,
          label: 'Perekaman Sidik Jari (Enrollment Baru)',
          icon: <Sparkles className="w-4 h-4 text-amber-500" />,
          description: 'Registrasi biometric template 10 jari santri & guru',
          badge: 'Baru',
          badgeColor: 'bg-amber-100 text-amber-800'
        },
        {
          key: 'realtime' as const,
          label: 'Socket Stream (Port 4370)',
          icon: <Radio className="w-4 h-4 text-cyan-500" />,
          description: 'Jembatan komunikasi TCP/IP perangkat AT-101'
        }
      ]
    },
    {
      group: 'Data Master & Sinkronisasi',
      items: [
        {
          key: 'students' as const,
          label: 'Data Siswa (Tambah/Hapus)',
          icon: <Users className="w-4 h-4 text-blue-600" />,
          description: 'Kelola data 480 santri, NISN, kelas, dan PIN mesin'
        },
        {
          key: 'teachers' as const,
          label: `Data Guru & Staff (${teachers.length})`,
          icon: <GraduationCap className="w-4 h-4 text-indigo-500" />,
          description: 'Data dewan guru, guru piket, dan wali kelas',
          badge: `${teachers.length} Guru`,
          badgeColor: 'bg-indigo-100 text-indigo-800'
        },
        {
          key: 'excel' as const,
          label: 'Impor/Ekspor Excel AT-101',
          icon: <FileSpreadsheet className="w-4 h-4 text-emerald-600" />,
          description: 'Tarik log flashdisk USB/LAN dan sinkronisasi presisi'
        }
      ]
    },
    {
      group: 'Komunikasi & Layanan Orang Tua',
      items: [
        {
          key: 'announcements' as const,
          label: `Pengumuman Madrasah (${announcements.length})`,
          icon: <Bell className="w-4 h-4 text-amber-500" />,
          description: 'Buat & siarkan pengumuman resmi ke seluruh akun wali murid',
          badge: `${announcements.length}`,
          badgeColor: 'bg-amber-100 text-amber-800 font-bold'
        },
        {
          key: 'parent_accounts' as const,
          label: `Akun Orang Tua & Pesan (${parentAccounts.length})`,
          icon: <Key className="w-4 h-4 text-emerald-600" />,
          description: 'Kelola login, reset sandi, dan kirim pesan santun resmi',
          badge: `${parentAccounts.length} Akun`,
          badgeColor: 'bg-emerald-100 text-emerald-800'
        },
        {
          key: 'permissions' as const,
          label: 'Validasi Izin Online',
          icon: <FileText className="w-4 h-4 text-purple-600" />,
          description: 'Persetujuan izin sakit atau surat permohonan wali murid',
          badge: pendingPermissionsCount > 0 ? `${pendingPermissionsCount} Menunggu` : undefined,
          badgeColor: 'bg-rose-500 text-white font-bold animate-pulse'
        },
        {
          key: 'broadcast' as const,
          label: `Antrian Notifikasi WA (${notificationLogs.length})`,
          icon: <MessageSquare className="w-4 h-4 text-teal-600" />,
          description: 'Riwayat broadcast WhatsApp real-time ke nomor wali murid',
          badge: `${notificationLogs.length}`,
          badgeColor: 'bg-teal-100 text-teal-800'
        }
      ]
    }
  ];

  // Current active menu item details
  const allMenuItems = menuCategories.flatMap(c => c.items);
  const currentActiveItem = allMenuItems.find(i => i.key === activeTab) || allMenuItems[0];

  return (
    <div className="space-y-4">
      
      {/* High Level KPI Metrics */}
      <AttendanceAnalytics />

      {/* Admin Hamburger Navigation Bar & Collapsible Menu */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Main Hamburger Header Bar */}
        <div className="p-2.5 sm:p-3 flex items-center justify-between gap-3 flex-wrap bg-slate-50/80">
          
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Tombol Hamburger Collapse / Expand */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all"
              title={isMenuOpen ? 'Lipat / Tutup Menu Navigasi' : 'Buka Menu Hamburger Navigasi Admin'}
            >
              {isMenuOpen ? <X className="w-4 h-4 stroke-[2.5]" /> : <Menu className="w-4 h-4 stroke-[2.5]" />}
              <span>{isMenuOpen ? 'Tutup Menu' : 'Menu Navigasi Admin (10 Modul)'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Indikator Menu yang Sedang Aktif */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-800 text-xs shadow-2xs font-semibold">
              <span className="text-slate-400 text-[11px]">Modul Aktif:</span>
              <span className="flex items-center gap-1.5 font-bold text-blue-700">
                {currentActiveItem.icon}
                <span>{currentActiveItem.label}</span>
              </span>
              {currentActiveItem.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${currentActiveItem.badgeColor || 'bg-blue-100 text-blue-800'}`}>
                  {currentActiveItem.badge}
                </span>
              )}
            </div>
          </div>

          {/* Akses Cepat Kiosk & Pilot Kit */}
          <div className="flex items-center gap-2">
            {onOpenKiosk && (
              <button
                onClick={onOpenKiosk}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold transition-all border border-indigo-200 flex items-center gap-1.5 shadow-2xs"
                title="Buka Layar Kiosk TV Gerbang Sekolah"
              >
                <Tv className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Layar Kiosk Gerbang</span>
                <span className="sm:hidden">Kiosk</span>
              </button>
            )}

            {onOpenTrialKit && (
              <button
                onClick={onOpenTrialKit}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5"
                title="Buka Panduan & Alat Uji Coba Konsumen"
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>Pilot Kit</span>
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Panel Menu (Dapat Dibuka & Dilipat) */}
        {isMenuOpen && (
          <div className="p-4 sm:p-5 bg-white border-t border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Daftar Modul & Fitur Administrasi Madrasah
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-all"
              >
                <X className="w-3.5 h-3.5" />
                <span>Lipat Menu</span>
              </button>
            </div>

            {/* Menu Grid Berdasarkan Kategori */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {menuCategories.map((category) => (
                <div key={category.group} className="space-y-2 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/70">
                  <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 px-1">
                    {category.group}
                  </h4>
                  <div className="space-y-1.5">
                    {category.items.map((item) => {
                      const isActive = activeTab === item.key;
                      return (
                        <button
                          key={item.key}
                          type="button"
                          onClick={() => {
                            setActiveTab(item.key);
                            setIsMenuOpen(false); // Otomatis collapse setelah memilih menu
                          }}
                          className={`w-full p-2.5 rounded-xl text-left transition-all flex items-start gap-2.5 border ${
                            isActive
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white hover:bg-slate-100/80 text-slate-800 border-slate-200/80'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 ${
                            isActive ? 'bg-white/20 text-white' : 'bg-slate-100'
                          }`}>
                            {item.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className={`text-xs font-bold truncate block ${isActive ? 'text-white' : 'text-slate-900'}`}>
                                {item.label}
                              </span>
                              {item.badge && (
                                <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold shrink-0 ${
                                  isActive ? 'bg-white text-blue-700' : (item.badgeColor || 'bg-slate-100 text-slate-700')
                                }`}>
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className={`text-[10px] mt-0.5 line-clamp-1 ${
                              isActive ? 'text-blue-100' : 'text-slate-500'
                            }`}>
                              {item.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Action Footer inside Drawer */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px]">Klik salah satu modul di atas untuk berpindah halaman dan melipat menu kembali.</span>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Tutup Panel Menu</span>
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
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

      {activeTab === 'parent_accounts' && (
        <ParentAccountsManager />
      )}

      {activeTab === 'announcements' && (
        <AnnouncementManager />
      )}

    </div>
  );
};
