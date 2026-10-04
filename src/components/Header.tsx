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
  Database
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    currentRole, 
    setCurrentRole, 
    activeDate, 
    setActiveDate, 
    schoolConfig, 
    students, 
    selectedParentStudentId, 
    setSelectedParentStudentId,
    currentUser,
    logout,
    supabaseConfig
  } = useAttendance();

  const selectedStudent = students.find(s => s.id === selectedParentStudentId) || students[0];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
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
                <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Cloud Bridge
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate hidden sm:block">
                {schoolConfig.schoolName} • 480 Siswa
              </p>
            </div>
          </div>

          {/* Quick Info & Date Selector (Hidden on small mobile) */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
              <Calendar className="w-4 h-4 text-blue-400" />
              <input 
                type="date"
                value={activeDate}
                onChange={(e) => setActiveDate(e.target.value)}
                className="bg-transparent text-slate-200 outline-none cursor-pointer text-xs font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-300">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-mono text-slate-400">192.168.1.201:4370</span>
            </div>

            <div className="flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1.5 rounded-lg text-xs text-emerald-300">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp: Auto On</span>
            </div>

            <div className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border ${
              supabaseConfig?.connected
                ? 'bg-teal-950/60 border-teal-700/60 text-teal-300'
                : 'bg-slate-800/80 border-slate-700 text-slate-300'
            }`}>
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>{supabaseConfig?.connected ? 'Supabase: Sync' : 'Supabase: Ready'}</span>
            </div>
          </div>

          {/* Role Switcher & User Profile / Logout */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => setCurrentRole('SUPER_ADMIN')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'SUPER_ADMIN'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
                title="Super Admin (Laptop/PC)"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Super Admin</span>
              </button>

              <button
                onClick={() => setCurrentRole('ADMIN')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'ADMIN'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
                title="Admin / Guru Piket (Laptop/PC)"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin Guru</span>
              </button>

              <button
                onClick={() => setCurrentRole('PARENT')}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'PARENT'
                    ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
                title="User / Orang Tua Siswa (Hp)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Orang Tua (Hp)</span>
              </button>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => logout()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 hover:text-rose-200 text-slate-400 border border-slate-700 transition-colors"
              title="Keluar / Ganti Akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
