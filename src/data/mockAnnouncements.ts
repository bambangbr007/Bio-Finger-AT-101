import { SchoolAnnouncement } from '../types';

export const INITIAL_ANNOUNCEMENTS: SchoolAnnouncement[] = [
  {
    id: 'ANN-001',
    title: 'Pelaksanaan Penilaian Tengah Semester (PTS) Genap & Disiplin Presensi',
    category: 'UJIAN',
    content: `Assalamualaikum Wr. Wb.

Yth. Seluruh Bapak/Ibu Wali Murid MTs Nurus Salam Gebog Kudus,

Diberitahukan bahwa pelaksanaan Penilaian Tengah Semester (PTS) Genap Tahun Ajaran 2026/2027 akan diselenggarakan mulai hari Senin pekan depan.

Ketentuan penting selama pelaksanaan PTS:
1. Siswa wajib hadir tepat waktu paling lambat pukul 06.45 WIB.
2. Setiap siswa wajib melakukan pemindaian sidik jari pada mesin BIO Finger AT-101 di gerbang madrasah sebelum masuk ke ruang ujian.
3. Orang tua dimohon memastikan ananda sarapan dari rumah dan membawa perlengkapan ujian lengkap serta kartu tanda peserta.
4. Apabila ananda berhalangan hadir karena sakit, mohon segera mengajukan izin/sakit melalui menu Izin Online di aplikasi ini lengkap dengan bukti surat keterangan dokter.

Demikian pemberitahuan ini kami sampaikan. Atas perhatian dan kerja sama Bapak/Ibu wali murid, kami haturkan terima kasih.

Wassalamualaikum Wr. Wb.`,
    targetClass: 'SEMUA',
    publishedAt: '2026-10-04 07:00:00',
    authorName: 'Ahmad Syarifuddin, M.Pd.',
    authorRole: 'Kepala MTs Nurus Salam',
    priority: 'PENTING',
    pinned: true
  },
  {
    id: 'ANN-002',
    title: 'Peringatan Isra Mi\'raj Nabi Muhammad SAW & Doa Bersama Sukses Belajar',
    category: 'PHBI',
    content: `Assalamualaikum Wr. Wb.

Dalam rangka memperingati Isra Mi'raj Nabi Muhammad SAW 1448 H, madrasah akan menyelenggarakan kegiatan keagamaan dan doa bersama seluruh santri/siswa:

Hari / Tanggal: Sabtu, 10 Oktober 2026
Waktu: Pukul 07.00 - 10.30 WIB
Tempat: Masjid & Aula Utama MTs Nurus Salam Gebog Kudus
Pakaian: Busana Muslim putih (putra berpeci hitam, putri berjilbab putih)

Seluruh siswa tetap melakukan presensi kehadiran sidik jari pada mesin BIO Finger AT-101 pada saat kedatangan dan kepulangan seperti biasa.

Wassalamualaikum Wr. Wb.`,
    targetClass: 'SEMUA',
    publishedAt: '2026-10-03 08:30:00',
    authorName: 'M. Hidayatullah, S.Pd.I.',
    authorRole: 'Waka Kesiswaan & Keagamaan',
    priority: 'NORMAL',
    pinned: false
  },
  {
    id: 'ANN-003',
    title: 'Undangan Rapat Koordinasi Wali Murid Kelas 9 Persiapan Ujian Akhir Madrasah',
    category: 'RAPAT',
    content: `Assalamualaikum Wr. Wb.

Mengharap kehadiran Bapak/Ibu Wali Murid khusus Kelas 9A, 9B, 9C, dan 9D pada acara Rapat Koordinasi Persiapan Asesmen Madrasah & Program Sukses Kelulusan:

Hari, Tanggal: Ahad, 18 Oktober 2026
Waktu: Pukul 08.30 WIB - selesai
Tempat: Gedung Pertemuan MTs Nurus Salam

Mengingat pentingnya agenda tersebut, kami sangat mengharapkan kehadiran Bapak/Ibu tepat pada waktunya tanpa diwakilkan.

Wassalamualaikum Wr. Wb.`,
    targetClass: 'Kelas 9A',
    publishedAt: '2026-10-02 09:15:00',
    authorName: 'Siti Rahmawati, S.Pd.',
    authorRole: 'Koordinator Wali Kelas 9',
    priority: 'PENTING',
    pinned: false
  },
  {
    id: 'ANN-004',
    title: 'Informasi Penyesuaian Jam Masuk & Presensi BIO Finger AT-101 Selama Musim Hujan',
    category: 'UMUM',
    content: `Assalamualaikum Wr. Wb.

Memasuki musim penghujan, pihak madrasah mengingatkan seluruh santri/siswa untuk:
1. Membawa payung / jas hujan saat berangkat ke madrasah.
2. Memastikan jari dalam keadaan kering saat menempelkan jari ke sensor BIO Finger AT-101 agar verifikasi sidik jari berlangsung cepat dan akurat.
3. Batas toleransi keterlambatan tetap mengacu pada jam 07.00 WIB.

Terima kasih atas kerja sama Bapak/Ibu sekalian dalam mendisiplinkan ananda.

Wassalamualaikum Wr. Wb.`,
    targetClass: 'SEMUA',
    publishedAt: '2026-10-01 06:45:00',
    authorName: 'Tata Usaha MTs Nurus Salam',
    authorRole: 'Tim Kepegawaian & Sarpras',
    priority: 'NORMAL',
    pinned: false
  }
];
