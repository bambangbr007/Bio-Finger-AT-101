@echo off
title BIOFINGER AT-101 DAEMON SERVICE
color 0A
echo ==============================================================================
echo MENJALANKAN SERVICE PRESENSI OTOMATIS BIOFINGER AT-101 (PORT 4370)
echo ==============================================================================
cd /d "%~dp0"

if not exist node_modules (
    echo [INFO] Menginstal dependensi Node.js pertama kali...
    call npm install
)

echo [INFO] Menjalankan Daemon di background. Jangan tutup jendela ini!
node index.js
pause
