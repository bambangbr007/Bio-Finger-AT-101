# BIOFINGER AT-101 AUTOMATED SCHOOL ATTENDANCE & WHATSAPP DAEMON
## Sistem Presensi Otomatis 100% Tanpa Campur Tangan Manusia

Layanan daemon mandiri (*standalone background service*) ini menghubungkan mesin presensi biometrik **BioFinger AT-101** (berbasis protokol standar ZKTeco TCP/IP port 4370) dengan gateway notifikasi WhatsApp orang tua siswa.

---

### 🌟 Arsitektur & Alur Kerja Mandiri (07.15 WIB)

1. **Penjadwal Otomatis (Cron Job 07:15 WIB)**:
   - Tepat pada jam cut-off kehadiran (07:15 WIB Senin–Sabtu), daemon secara otomatis aktif tanpa perlu membuka browser atau menekan tombol apa pun.
2. **Koneksi Socket TCP Port 4370**:
   - Membuka koneksi socket TCP langsung ke IP lokal BioFinger AT-101 (misal `192.168.1.201:4370`).
   - Menarik seluruh buffer event scan sidik jari hari ini.
3. **Deduplikasi & Validasi 480 Siswa**:
   - **Deduplikasi**: Apabila seorang siswa melakukan tap sidik jari berkali-kali, sistem hanya mengambil scan pertama (terawal).
   - **Hadir Tepat Waktu**: Scan antara jam 06:00 - 07:00 WIB.
   - **Terlambat**: Scan antara jam 07:01 - 07:15 WIB (kalkulasi menit keterlambatan).
   - **Tidak Hadir / Alpa**: Siswa terdaftar yang ID/PIN-nya sama sekali tidak ada di log mesin hingga cut-off 07:15 WIB otomatis berstatus `TIDAK_HADIR`.
4. **Antrean Notifikasi Rate-Limiting**:
   - Mengirimkan pesan personal ke WhatsApp orang tua dengan delay 1.5 detik per pesan agar nomor pengirim aman dari flag spam Meta/WhatsApp.
   - Mengutamakan pengiriman kabar ketidakhadiran & keterlambatan terlebih dahulu.

---

### 📁 Struktur Berkas

```
backend-daemon/
├── index.js               # Daemon Utama Node.js (Cron + Socket ZK + Queue)
├── biofinger_daemon.py    # Daemon Alternatif Python (pyzk + schedule)
├── package.json           # Dependensi Node.js (node-cron, zklib-js, axios, winston)
├── requirements.txt       # Dependensi Python (pyzk, schedule, requests)
├── .env.example           # Template Konfigurasi IP, Port, Jadwal, Token WA
├── biofinger.service      # Konfigurasi Linux Systemd (Auto-start saat boot)
├── ecosystem.config.js    # Konfigurasi PM2 Process Manager
├── start_windows.bat      # Script Startup Otomatis Windows
└── logs/                  # Folder Log Harian Otomatis (attendance-YYYY-MM-DD.log)
```

---

### 🚀 Cara Menjalankan di Komputer / Server Sekolah

#### Opsi A: Menggunakan Node.js (Rekomendasi)

1. **Instalasi Dependensi**:
   ```bash
   cd backend-daemon
   npm install
   ```

2. **Konfigurasi Lingkungan**:
   Salin `.env.example` menjadi `.env` dan sesuaikan IP mesin BioFinger & Token WhatsApp:
   ```bash
   cp .env.example .env
   ```

3. **Uji Coba Langsung (Test Mode)**:
   ```bash
   npm run test-cutoff
   ```

4. **Jalankan sebagai Background Service Latar Belakang**:
   ```bash
   npm start
   ```

---

#### Opsi B: Menggunakan PM2 (Auto-Restart saat Crash / Reboot)

```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

#### Opsi C: Menggunakan Python 3

```bash
cd backend-daemon
pip install -r requirements.txt
python biofinger_daemon.py
```
Untuk uji coba langsung:
```bash
python biofinger_daemon.py --now
```

---

#### Opsi D: Menjadikan Service Otomatis di Linux (Ubuntu / Debian / Raspberry Pi)

```bash
sudo mkdir -p /opt/biofinger-daemon
sudo cp -r . /opt/biofinger-daemon/
sudo cp biofinger.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable biofinger.service
sudo systemctl start biofinger.service
sudo systemctl status biofinger.service
```

---

#### Opsi E: Otomatis Aktif di Windows saat PC Dinyalakan

1. Tekan tombol `Windows + R`, ketik `shell:startup`, lalu tekan `Enter`.
2. Buat *Shortcut* dari file `start_windows.bat` dan letakkan di dalam folder Startup tersebut.
3. Setiap kali komputer sekolah dinyalakan, service akan otomatis berjalan di latar belakang.
