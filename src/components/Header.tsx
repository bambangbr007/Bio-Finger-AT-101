import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { UserRole } from '../types';
import { 
  ShieldAlert, 
  UserCheck, 
  Smartphone, 
  Fingerprint, 
  Wifi, 
  Calendar, 
  MessageSquare, 
  Sparkles,
  LogOut,
  Database,
  Rocket,
  Tv
} from 'lucide-react';

interface HeaderProps {
  onOpenTrialKit?: () => void;
  onOpenKiosk?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenTrialKit, onOpenKiosk }) => {
  const { 
    currentRole, 
    activeDate, 
    setActiveDate, 
    schoolConfig, 
    students, 
    selectedParentStudentId, 
    currentUser,
    logout,
    supabaseConfig
  } = useAttendance();

  const selectedStudent = students.find(s => s.id === selectedParentStudentId) || students[0];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Brand Logo & Device Status */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
              <Fingerprint className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base sm:text-lg tracking-tight truncate">
                  BIO Finger <span className="text-blue-400 font-extrabold">AT-101</span>
                </h1>
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  Siap Trial Konsumen
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate hidden sm:block">
                {schoolConfig.schoolName} • 480 Siswa
              </p>
            </div>
          </div>

          {/* Quick Action Buttons: Pilot Kit & Kiosk */}
          <div className="flex items-center gap-2">
            {onOpenTrialKit && (
              <button
                onClick={onOpenTrialKit}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-black text-xs transition-all shadow-md shadow-amber-500/20 flex items-center gap-1.5"
                title="Buka Pusat Panduan Uji Coba Konsumen"
              >
                <Rocket className="w-4 h-4 fill-slate-950" />
                <span className="hidden sm:inline">Panduan Trial Konsumen</span>
                <span className="sm:hidden">Trial Kit</span>
              </button>
            )}

            {onOpenKiosk && (
              <button
                onClick={onOpenKiosk}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/80 hover:bg-indigo-600 active:scale-95 text-white font-bold text-xs transition-all border border-indigo-400/30 flex items-center gap-1.5"
                title="Layar Kiosk Gerbang / TV Lobby Sekolah"
              >
                <Tv className="w-4 h-4 text-indigo-300" />
                <span className="hidden md:inline">Layar Kiosk Gerbang</span>
              </button>
            )}
          </div>

          {/* Authenticated User Profile & Logout */}
          <div className="flex items-center gap-2.5">
            {currentUser && (
              <div className="flex items-center gap-2.5 bg-slate-800/90 px-3 py-1.5 rounded-xl border border-slate-700">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  currentRole === 'SUPER_ADMIN' 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                    : currentRole === 'ADMIN'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {currentRole === 'SUPER_ADMIN' && <ShieldAlert className="w-4 h-4 text-amber-300" />}
                  {currentRole === 'ADMIN' && <UserCheck className="w-4 h-4 text-blue-300" />}
                  {currentRole === 'PARENT' && <Smartphone className="w-4 h-4 text-emerald-300" />}
                </div>

                <div className="text-left hidden sm:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">
                      {currentRole === 'SUPER_ADMIN' ? 'Super Admin' : currentRole === 'ADMIN' ? 'Admin / Guru' : 'Wali Murid'}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  </div>
                  <p className="text-xs font-bold text-slate-200 truncate max-w-[150px] lg:max-w-[200px]">
                    {currentUser.name}
                  </p>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={() => logout()}
              className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-rose-600 active:scale-95 text-slate-300 hover:text-white border border-slate-700 hover:border-rose-500 transition-all text-xs font-bold flex items-center gap-1.5 shadow-sm"
              title="Keluar dari akun dan kembali ke halaman Login"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
