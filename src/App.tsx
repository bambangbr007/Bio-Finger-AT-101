import React from 'react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import { Header } from './components/Header';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SuperAdminControl } from './components/superadmin/SuperAdminControl';
import { ParentMobileView } from './components/parent/ParentMobileView';
import { LoginPage } from './components/auth/LoginPage';

const MainContent: React.FC = () => {
  const { currentRole, currentUser } = useAttendance();

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {currentRole === 'PARENT' ? (
          <ParentMobileView />
        ) : (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {currentRole === 'SUPER_ADMIN' && <SuperAdminControl />}
            {currentRole === 'ADMIN' && <AdminDashboard />}
          </div>
        )}
      </main>

      {/* Footer (Only shown in Super Admin / Admin modes) */}
      {currentRole !== 'PARENT' && (
        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>
              © 2026 <strong>BIO Finger AT-101 Smart School Attendance</strong> • Integrasi Cloud Biometrik 480 Siswa
            </p>
            <p className="text-[11px] text-slate-400">
              Mendukung Sinkronisasi Excel/Spreadsheet & Notifikasi Otomatis WhatsApp Real-Time
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AttendanceProvider>
      <MainContent />
    </AttendanceProvider>
  );
}
