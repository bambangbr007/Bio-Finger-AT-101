import { Student } from '../types';

const FIRST_NAMES_MALE = [
  'Ahmad', 'Muhammad', 'Rizky', 'Budi', 'Dimas', 'Aditya', 'Fajar', 'Bagas',
  'Ilham', 'Bayu', 'Gilang', 'Rafi', 'Daffa', 'Farhan', 'Alif', 'Rendra',
  'Fauzan', 'Hafizh', 'Arya', 'Kevin', 'Bryan', 'Danendra', 'Raditya', 'Yoga'
];

const FIRST_NAMES_FEMALE = [
  'Siti', 'Dewi', 'Aisyah', 'Putri', 'Nur', 'Anisa', 'Zahra', 'Nabila',
  'Safira', 'Rania', 'Kayla', 'Tiara', 'Salma', 'Amanda', 'Dinda', 'Syifa',
  'Khadijah', 'Farah', 'Intan', 'Melati', 'Bella', 'Clarissa', 'Hanifah', 'Nadhira'
];

const LAST_NAMES = [
  'Pratama', 'Saputra', 'Wijaya', 'Santoso', 'Kusuma', 'Ramadhan', 'Hidayat',
  'Setiawan', 'Nugroho', 'Wibowo', 'Firmansyah', 'Siregar', 'Harahap', 'Nasution',
  'Lestari', 'Utami', 'Puspitasari', 'Maharani', 'Anggraini', 'Sulistyo', 'Hadi',
  'Pranoto', 'Gunawan', 'Subekti', 'Kurniawan', 'Maulana', 'Firmansyah', 'Syahputra'
];

const PARENT_PREFIXES_M = ['Bpk. ', 'Ir. ', 'Drs. ', 'H. '];
const PARENT_PREFIXES_F = ['Ibu ', 'Hj. ', 'Dr. '];

// Classes: 12 classes x 40 students = 480 students
export const CLASSES = [
  'Kelas 7A', 'Kelas 7B', 'Kelas 7C', 'Kelas 7D',
  'Kelas 8A', 'Kelas 8B', 'Kelas 8C', 'Kelas 8D',
  'Kelas 9A', 'Kelas 9B', 'Kelas 9C', 'Kelas 9D'
];

export function generate480Students(): Student[] {
  const students: Student[] = [];
  let globalIndex = 1;

  for (const className of CLASSES) {
    for (let cIdx = 1; cIdx <= 40; cIdx++) {
      const isMale = (cIdx % 2 === 1);
      const firstNames = isMale ? FIRST_NAMES_MALE : FIRST_NAMES_FEMALE;
      const fName = firstNames[(globalIndex * 7 + cIdx) % firstNames.length];
      const lName = LAST_NAMES[(globalIndex * 13 + cIdx * 3) % LAST_NAMES.length];
      const fullName = `${fName} ${lName}`;
      
      const pin = (1000 + globalIndex).toString(); // e.g. 1001, 1002, ..., 1480
      const nisn = `00${78000000 + globalIndex}`;
      
      const parentIsFather = (cIdx % 3 !== 0);
      const parentPre = parentIsFather 
        ? PARENT_PREFIXES_M[(globalIndex + cIdx) % PARENT_PREFIXES_M.length]
        : PARENT_PREFIXES_F[(globalIndex + cIdx) % PARENT_PREFIXES_F.length];
      const parentLastName = LAST_NAMES[(globalIndex * 5 + 7) % LAST_NAMES.length];
      const parentName = `${parentPre}${parentLastName}`;
      
      // WhatsApp friendly phone (628xxxxxxxx)
      const phoneSuffix = (10000000 + globalIndex * 1234).toString().slice(0, 8);
      const parentPhone = `62812${phoneSuffix}`;
      const parentEmail = `wali.${fName.toLowerCase()}.${lName.toLowerCase()}${globalIndex}@gmail.com`;

      students.push({
        id: `STU-${String(globalIndex).padStart(3, '0')}`,
        pin: pin,
        nisn: nisn,
        name: fullName,
        class: className,
        gender: isMale ? 'L' : 'P',
        parentName: parentName,
        parentPhone: parentPhone,
        parentEmail: parentEmail,
        avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${fullName}&backgroundColor=e2e8f0,b6e3f4,c0aede,ffd5dc,ffdfbf`,
        fingerprintRegistered: true,
        rfidCard: `RFID-${100000 + globalIndex}`
      });

      globalIndex++;
    }
  }

  return students;
}
