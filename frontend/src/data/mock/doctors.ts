export interface MockDoctor {
  id: string;
  name: string;
  specialty: string;
  subSpecialty: string;
  rating: number;
  reviewCount: number;
  experience: number;
  hospital: string;
  location: string;
  avatar: string;
  available: boolean;
  nextSlot: string;
  consultationFee: number;
  languages: string[];
  bio: string;
}

export const mockDoctors: MockDoctor[] = [
  {
    id: 'd1', name: 'Dr. Neha Joshi', specialty: 'Radiologist', subSpecialty: 'Neuro Imaging',
    rating: 4.9, reviewCount: 312, experience: 14, hospital: 'Apollo Hospitals',
    location: 'Chennai, TN', avatar: 'https://ui-avatars.com/api/?name=Neha+Joshi&background=0B3C5D&color=fff&size=128',
    available: true, nextSlot: 'Today, 3:00 PM', consultationFee: 800,
    languages: ['English', 'Hindi', 'Tamil'],
    bio: 'Specialist in AI-assisted neurological imaging with 14 years of clinical experience.',
  },
  {
    id: 'd2', name: 'Dr. Rajesh Verma', specialty: 'Pulmonologist', subSpecialty: 'Chest Diseases',
    rating: 4.7, reviewCount: 228, experience: 11, hospital: 'Fortis Healthcare',
    location: 'New Delhi', avatar: 'https://ui-avatars.com/api/?name=Rajesh+Verma&background=2ECC71&color=fff&size=128',
    available: true, nextSlot: 'Today, 5:30 PM', consultationFee: 700,
    languages: ['English', 'Hindi', 'Punjabi'],
    bio: 'Expert in pneumonia management and TB treatment protocols.',
  },
  {
    id: 'd3', name: 'Dr. Sunita Rao', specialty: 'Oncologist', subSpecialty: 'Thoracic Oncology',
    rating: 4.8, reviewCount: 189, experience: 16, hospital: 'Tata Memorial Center',
    location: 'Mumbai, MH', avatar: 'https://ui-avatars.com/api/?name=Sunita+Rao&background=8B5CF6&color=fff&size=128',
    available: false, nextSlot: 'Tomorrow, 10:00 AM', consultationFee: 1200,
    languages: ['English', 'Hindi', 'Marathi'],
    bio: 'Leading oncologist specializing in lung and thoracic cancers with AI-assisted diagnosis.',
  },
  {
    id: 'd4', name: 'Dr. Anil Khanna', specialty: 'Orthopedic Surgeon', subSpecialty: 'Bone & Joint',
    rating: 4.6, reviewCount: 415, experience: 18, hospital: 'Max Super Speciality',
    location: 'Gurugram, HR', avatar: 'https://ui-avatars.com/api/?name=Anil+Khanna&background=F59E0B&color=fff&size=128',
    available: true, nextSlot: 'Today, 4:00 PM', consultationFee: 1000,
    languages: ['English', 'Hindi'],
    bio: 'Senior orthopedic surgeon with expertise in fracture management and joint replacement.',
  },
  {
    id: 'd5', name: 'Dr. Meera Pillai', specialty: 'Ophthalmologist', subSpecialty: 'Diabetic Eye Care',
    rating: 4.9, reviewCount: 267, experience: 12, hospital: 'Narayana Nethralaya',
    location: 'Bangalore, KA', avatar: 'https://ui-avatars.com/api/?name=Meera+Pillai&background=EF4444&color=fff&size=128',
    available: true, nextSlot: 'Today, 2:30 PM', consultationFee: 900,
    languages: ['English', 'Hindi', 'Malayalam', 'Kannada'],
    bio: 'Specialist in diabetic retinopathy screening and laser treatment.',
  },
  {
    id: 'd6', name: 'Dr. Farhan Sheikh', specialty: 'Dermatologist', subSpecialty: 'Dermato-Oncology',
    rating: 4.7, reviewCount: 193, experience: 9, hospital: 'Kokilaben Hospital',
    location: 'Mumbai, MH', avatar: 'https://ui-avatars.com/api/?name=Farhan+Sheikh&background=F97316&color=fff&size=128',
    available: false, nextSlot: 'Tomorrow, 11:30 AM', consultationFee: 850,
    languages: ['English', 'Hindi', 'Urdu'],
    bio: 'Skin cancer specialist with experience in dermoscopy and AI-assisted lesion analysis.',
  },
];
