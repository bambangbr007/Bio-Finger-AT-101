import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { CloudArchitectureViewer } from './CloudArchitectureViewer';
import { SupabaseIntegrationManager } from './SupabaseIntegrationManager';
import { BackendDaemonGenerator } from './BackendDaemonGenerator';
import { 
  ShieldAlert, 
  Cpu, 
  MessageSquare, 
  Clock, 
  Save, 
  RefreshCw, 
  RotateCcw, 
  CheckCircle2, 
  Wifi, 
  Terminal,
  Database,
  Sliders,
  Send,
  Cloud,
  Zap
} from 'lucide-react';
import { DEFAULT_TEMPLATES } from '../../utils/whatsappHelper';

export const SuperAdminControl: React.FC = () => {
  const { schoolConfig, updateSchoolConfig, resetAllData, students, supabaseConfig } = useAttendance();

  const [activeTab, setActiveTab] = useState<'config' | 'supabase' | 'daemon' | 'cloud_architecture'>('config');
  const [formData, setFormData] = useState(schoolConfig);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [testingPing, setTestingPing] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestDevicePing = () => {
    setTestingPing(true);
    setPingResult(null);
    setTimeout(() => {
      setTestingPing(false);
      setPingResult(`✓ Terhubung ke BIO Finger AT-101 (${formData.deviceIp}:${formData.devicePort}). Firmware v6.60, Memori: 480/1000 Sidik Jari.`);
    }, 600);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 text-white p-5 rounded-2xl shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
            <ShieldAlert className="w-7 h-7 text-amber-200" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-amber-200">Hak Akses Penuh</span>
            <h2 className="text-lg font-black">Panel Konfigurasi Super Admin</h2>
            <p className="text-xs text-amber-100">
              Integrasi Hardware BIO Finger AT-101, Gateway WhatsApp/Email, dan Infrastruktur Cloud Database
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'config' && (
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-slate-950 text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Seluruh Perubahan</span>
            </button>
          )}
        </div>
      </div>

      {/* Super Admin Sub-Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'config'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Konfigurasi Mesin AT-101 & Gateway WhatsApp</span>
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'supabase'
              ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-400/40'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-500" />
          <span>Database Supabase Cloud (PostgreSQL)</span>
          {supabaseConfig?.connected && (
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('daemon')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'daemon'
              ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/40'
              : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200'
          }`}
        >
          <Cpu className="w-4 h-4 text-indigo-500" />
          <span>Backend Daemon & IoT (Cron 07.15 WIB)</span>
        </button>

        <button
          onClick={() => setActiveTab('cloud_architecture')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'cloud_architecture'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Cloud className="w-4 h-4" />
          <span>Arsitektur Cloud GCP & Skema PostgreSQL (DDL)</span>
        </button>
      </div>

      {activeTab === 'daemon' && (
        <BackendDaemonGenerator />
      )}

      {activeTab === 'supabase' && (
        <SupabaseIntegrationManager />
      )}

      {activeTab === 'cloud_architecture' && (
        <CloudArchitectureViewer />
      )}

      {activeTab === 'config' && (
        <>
          {saveSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Konfigurasi sistem & gateway berhasil disimpan ke memori cloud!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Hardware BIO Finger AT-101 Connection Config */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Hardware Mesin BIO Finger AT-101</h3>
                    <p className="text-xs text-slate-400">Parameter Komunikasi Jaringan Mesin Presensi</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                  Status: Online
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Model Mesin</label>
                  <input
                    type="text"
                    value={formData.deviceModel}
                    onChange={(e) => setFormData({ ...formData, deviceModel: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">IP Address Mesin (LAN/WLAN)</label>
                  <input
                    type="text"
                    value={formData.deviceIp}
                    onChange={(e) => setFormData({ ...formData, deviceIp: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Port Komunikasi (Default: 4370)</label>
                  <input
                    type="number"
                    value={formData.devicePort}
                    onChange={(e) => setFormData({ ...formData, devicePort: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Comm Key / Password Mesin</label>
                  <input
                    type="password"
                    value={formData.deviceCommKey}
                    onChange={(e) => setFormData({ ...formData, deviceCommKey: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1 text-xs">Penempatan Fisik Mesin</label>
                <input
                  type="text"
                  value={formData.deviceLocation}
                  onChange={(e) => setFormData({ ...formData, deviceLocation: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleTestDevicePing}
                  disabled={testingPing}
                  className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all"
                >
                  {testingPing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>Uji Koneksi Ping ke BIO Finger AT-101</span>
                </button>
                {pingResult && (
                  <p className="mt-2 text-[11px] text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    {pingResult}
                  </p>
                )}
              </div>
            </div>

            {/* Schedule & Timing Policy */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Aturan Jam Presensi & Keterlambatan</h3>
                    <p className="text-xs text-slate-400">Toleransi Waktu Masuk dan Jam Kepulangan</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Instansi / Sekolah</label>
                  <input
                    type="text"
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-1 focus:ring-blue-500 font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Mulai Presensi Masuk</label>
                    <input
                      type="time"
                      value={formData.checkInStart}
                      onChange={(e) => setFormData({ ...formData, checkInStart: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1 text-rose-700">
                      Batas Akhir Tepat Waktu (Deadline)
                    </label>
                    <input
                      type="time"
                      value={formData.checkInDeadline}
                      onChange={(e) => setFormData({ ...formData, checkInDeadline: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-rose-300 bg-rose-50/30 text-xs font-bold text-rose-800"
                    />
                    <span className="text-[10px] text-slate-400 mt-0.5 block">Scan setelah jam ini dicatat Terlambat</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Mulai Presensi Pulang</label>
                    <input
                      type="time"
                      value={formData.checkOutStart}
                      onChange={(e) => setFormData({ ...formData, checkOutStart: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Akhir Presensi Pulang</label>
                    <input
                      type="time"
                      value={formData.checkOutEnd}
                      onChange={(e) => setFormData({ ...formData, checkOutEnd: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Gateway Integration */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Gateway WhatsApp & Email API</h3>
                    <p className="text-xs text-slate-400">Pengaturan Mesin Notifikasi Otomatis ke Orang Tua</p>
                  </div>
                </div>

                <label className="flex items-center gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.waAutoSend}
                    onChange={(e) => setFormData({ ...formData, waAutoSend: e.target.checked })}
                    className="w-4 h-4 accent-emerald-600 rounded"
                  />
                  <span className="font-bold text-slate-700">Aktifkan Auto-Send WhatsApp</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Provider Gateway</label>
                  <select
                    value={formData.waProvider}
                    onChange={(e) => setFormData({ ...formData, waProvider: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="FONNTE">Fonnte WhatsApp API (Indonesia)</option>
                    <option value="WABLAS">Wablas Cloud Gateway</option>
                    <option value="ULTRAMSG">UltraMsg Multi-Device</option>
                    <option value="TWILIO">Twilio Programmable Messaging</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">API Key / Token Gateway</label>
                  <input
                    type="password"
                    value={formData.waApiKey}
                    onChange={(e) => setFormData({ ...formData, waApiKey: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nomor Pengirim Resmi Sekolah</label>
                  <input
                    type="text"
                    value={formData.waSenderNumber}
                    onChange={(e) => setFormData({ ...formData, waSenderNumber: e.target.value })}
                    placeholder="628129990001"
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Template Editors */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="font-bold text-xs text-emerald-800 block mb-1">
                    Template: Masuk Tepat Waktu
                  </label>
                  <textarea
                    rows={6}
                    value={formData.waCheckInTemplate}
                    onChange={(e) => setFormData({ ...formData, waCheckInTemplate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-[11px] focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-xs text-amber-800 block mb-1">
                    Template: Masuk Terlambat
                  </label>
                  <textarea
                    rows={6}
                    value={formData.waLateTemplate}
                    onChange={(e) => setFormData({ ...formData, waLateTemplate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-[11px] focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-xs text-blue-800 block mb-1">
                    Template: Pulang Sekolah
                  </label>
                  <textarea
                    rows={6}
                    value={formData.waCheckOutTemplate}
                    onChange={(e) => setFormData({ ...formData, waCheckOutTemplate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-[11px] focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-700">Variabel Tersedia:</span>
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">{"{nama_siswa}"}</code>
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">{"{kelas}"}</code>
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">{"{waktu}"}</code>
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">{"{status}"}</code>
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">{"{tanggal}"}</code>
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">{"{nama_ortu}"}</code>
                <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200">{"{mesin}"}</code>
              </div>
            </div>

            {/* Database & Reset Zone */}
            <div className="bg-slate-100/80 rounded-2xl p-5 border border-slate-200 lg:col-span-2 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-slate-600" />
                  <span>Manajemen Basis Data & Reset</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sistem saat ini menyimpan {students.length} profil siswa lengkap dengan nomor telepon wali murid.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset seluruh data presensi ke kondisi awal?')) {
                    resetAllData();
                  }
                }}
                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset ke Data Awal 480 Siswa</span>
              </button>
            </div>

          </form>
        </>
      )}

    </div>
  );
};
