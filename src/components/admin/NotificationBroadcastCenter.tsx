import React, { useState } from 'react';
import { useAttendance } from '../../context/AttendanceContext';
import { 
  MessageSquare, 
  Mail, 
  Send, 
  CheckCheck, 
  ExternalLink, 
  RefreshCw, 
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles
} from 'lucide-react';
import { generateDirectWhatsAppUrl } from '../../utils/whatsappHelper';

export const NotificationBroadcastCenter: React.FC = () => {
  const { notificationLogs, schoolConfig, updateSchoolConfig, resendNotification } = useAttendance();
  const [filterChannel, setFilterChannel] = useState<'ALL' | 'WHATSAPP' | 'EMAIL'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLogs = notificationLogs.filter(log => {
    if (filterChannel !== 'ALL' && log.channel !== filterChannel) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        log.studentName.toLowerCase().includes(q) ||
        log.className.toLowerCase().includes(q) ||
        log.recipientName.toLowerCase().includes(q) ||
        log.recipientContact.includes(q)
      );
    }
    return true;
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base">Pusat Antrian Notifikasi WhatsApp & Email Real-Time</h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Gateway {schoolConfig.waProvider}: Aktif
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Setiap pemindaian di BIO Finger AT-101 langsung memicu pengiriman pesan instan ke orang tua
            </p>
          </div>
        </div>

        {/* Auto Send Toggle */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={schoolConfig.waAutoSend}
              onChange={(e) => updateSchoolConfig({ waAutoSend: e.target.checked })}
              className="accent-emerald-500 w-4 h-4 rounded"
            />
            <span className="font-medium text-slate-200">Auto-Send WhatsApp Aktif</span>
          </label>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm relative">
          <Search className="w-4 h-4 absolute left-3 top-2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama siswa, wali, atau nomor kontak..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white border border-slate-300 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterChannel('ALL')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filterChannel === 'ALL' ? 'bg-blue-600 text-white font-semibold' : 'bg-white border text-slate-700 hover:bg-slate-100'
            }`}
          >
            Semua Saluran ({notificationLogs.length})
          </button>
          <button
            onClick={() => setFilterChannel('WHATSAPP')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filterChannel === 'WHATSAPP' ? 'bg-emerald-600 text-white font-semibold' : 'bg-white border text-slate-700 hover:bg-slate-100'
            }`}
          >
            WhatsApp
          </button>
          <button
            onClick={() => setFilterChannel('EMAIL')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              filterChannel === 'EMAIL' ? 'bg-indigo-600 text-white font-semibold' : 'bg-white border text-slate-700 hover:bg-slate-100'
            }`}
          >
            Email
          </button>
        </div>
      </div>

      {/* Broadcast Feed */}
      <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Belum ada notifikasi terkirim atau cocok dengan pencarian.
          </div>
        ) : (
          filteredLogs.slice(0, 40).map(log => (
            <div key={log.id} className="p-3.5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  log.channel === 'WHATSAPP' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {log.channel === 'WHATSAPP' ? <MessageSquare className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{log.studentName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-semibold">
                      {log.className}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                  </div>

                  <p className="text-slate-600 text-[11px] mt-0.5 truncate max-w-xl">
                    Tujuan: <strong className="text-slate-800">{log.recipientName}</strong> ({log.recipientContact})
                  </p>
                  <p className="text-slate-500 text-[11px] line-clamp-1 italic mt-0.5">
                    "{log.content.replace(/\*/g, '')}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCheck className="w-3 h-3 text-emerald-600" /> Terkirim Real-time
                </span>

                {log.channel === 'WHATSAPP' && (
                  <a
                    href={log.waDirectUrl || generateDirectWhatsAppUrl(log.recipientContact, log.content)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-700 transition-colors"
                    title="Buka Pesan di WhatsApp Langsung"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500">
        Menampilkan {Math.min(40, filteredLogs.length)} log pengiriman notifikasi terbaru
      </div>
    </div>
  );
};
