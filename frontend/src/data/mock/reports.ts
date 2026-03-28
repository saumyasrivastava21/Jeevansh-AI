import type { DiseaseId } from './diseases';

export type ReportStatus = 'pending' | 'processing' | 'completed' | 'reviewed';
export type SeverityLevel = 'low' | 'medium' | 'high';

export interface MedicalReport {
  id: string;
  patientId: string;
  patientName: string;
  disease: DiseaseId;
  diseaseName: string;
  imageUrl: string;
  confidence: number;
  severity: SeverityLevel;
  status: ReportStatus;
  aiFindings: string;
  recommendation: string;
  doctorNotes?: string;
  doctorName?: string;
  createdAt: string;
  reviewedAt?: string;
  bboxCoords?: { x: number; y: number; w: number; h: number };
}

export const mockReports: MedicalReport[] = [
  {
    id: 'r1', patientId: 'u1', patientName: 'Arjun Mehta',
    disease: 'pneumonia', diseaseName: 'Pneumonia',
    imageUrl: 'https://picsum.photos/seed/xray1/600/500',
    confidence: 91.4, severity: 'high', status: 'completed',
    aiFindings: 'AI analysis detected significant consolidation in the right lower lobe consistent with bacterial pneumonia. Increased opacity observed with air bronchograms. No pleural effusion noted.',
    recommendation: 'Immediate antibiotic therapy recommended. Follow-up chest X-ray in 4–6 weeks. Monitor oxygen saturation closely.',
    doctorName: 'Dr. Rajesh Verma', doctorNotes: 'Confirmed pneumonia. Started Amoxicillin 500mg TID. Patient to rest and maintain hydration.',
    createdAt: '2026-03-25T09:30:00Z', reviewedAt: '2026-03-25T14:00:00Z',
    bboxCoords: { x: 55, y: 40, w: 30, h: 35 },
  },
  {
    id: 'r2', patientId: 'u1', patientName: 'Arjun Mehta',
    disease: 'bone-fracture', diseaseName: 'Bone Fracture',
    imageUrl: 'https://picsum.photos/seed/xray2/600/500',
    confidence: 87.2, severity: 'medium', status: 'reviewed',
    aiFindings: 'Hairline fracture detected in the distal radius. Mildly displaced fracture with no significant angulation. Soft tissue swelling present around the fracture site.',
    recommendation: 'Casting for 6 weeks. Calcium and Vitamin D supplementation. Orthopedic follow-up in 2 weeks.',
    doctorName: 'Dr. Anil Khanna', doctorNotes: 'Applied below-elbow cast. Pain management with ibuprofen. Review in 2 weeks.',
    createdAt: '2026-03-20T11:00:00Z', reviewedAt: '2026-03-20T16:30:00Z',
    bboxCoords: { x: 40, y: 60, w: 25, h: 30 },
  },
  {
    id: 'r3', patientId: 'u2', patientName: 'Priya Sharma',
    disease: 'brain-tumor', diseaseName: 'Brain Tumor',
    imageUrl: 'https://picsum.photos/seed/mri1/600/500',
    confidence: 78.9, severity: 'high', status: 'processing',
    aiFindings: 'AI model has detected a suspicious hyperdense lesion in the right frontal lobe. Further MRI with contrast is recommended for definitive diagnosis.',
    recommendation: 'Urgent MRI with contrast. Neurosurgery consultation required. Monitor for neurological symptoms.',
    createdAt: '2026-03-27T08:15:00Z',
    bboxCoords: { x: 45, y: 25, w: 20, h: 22 },
  },
  {
    id: 'r4', patientId: 'u3', patientName: 'Ravi Kumar',
    disease: 'tuberculosis', diseaseName: 'Tuberculosis',
    imageUrl: 'https://picsum.photos/seed/xray3/600/500',
    confidence: 94.1, severity: 'high', status: 'completed',
    aiFindings: 'Bilateral upper lobe infiltrates with cavitation noted. Findings strongly suggestive of active pulmonary tuberculosis. Hilar lymphadenopathy visible.',
    recommendation: 'Start DOTS therapy immediately. Sputum AFB smear. Isolate patient. Notify public health authorities.',
    doctorName: 'Dr. Rajesh Verma',
    createdAt: '2026-03-22T07:45:00Z', reviewedAt: '2026-03-22T13:00:00Z',
    bboxCoords: { x: 20, y: 15, w: 60, h: 40 },
  },
  {
    id: 'r5', patientId: 'u1', patientName: 'Arjun Mehta',
    disease: 'lung-cancer', diseaseName: 'Lung Cancer',
    imageUrl: 'https://picsum.photos/seed/xray4/600/500',
    confidence: 65.3, severity: 'medium', status: 'pending',
    aiFindings: 'A 1.2cm pulmonary nodule detected in the right upper lobe. Spiculated margins noted. Low-to-moderate probability of malignancy based on AI analysis.',
    recommendation: 'CT chest with contrast for nodule characterization. PET scan if malignancy suspected. Thoracic oncology consultation.',
    createdAt: '2026-03-28T06:00:00Z',
    bboxCoords: { x: 60, y: 20, w: 15, h: 18 },
  },
];

export const adminStats = {
  totalUsers: 12847,
  reportsToday: 342,
  activeDoctors: 89,
  aiAccuracy: 94.7,
  monthlyReports: [
    { month: 'Oct', reports: 2100, users: 890 },
    { month: 'Nov', reports: 2450, users: 1020 },
    { month: 'Dec', reports: 2800, users: 1150 },
    { month: 'Jan', reports: 3200, users: 1380 },
    { month: 'Feb', reports: 3750, users: 1620 },
    { month: 'Mar', reports: 4100, users: 1890 },
  ],
  diseaseDistribution: [
    { name: 'Pneumonia', value: 28, color: '#0EA5E9' },
    { name: 'Fracture', value: 22, color: '#F59E0B' },
    { name: 'TB', value: 18, color: '#6366F1' },
    { name: 'Brain Tumor', value: 12, color: '#8B5CF6' },
    { name: 'Lung Cancer', value: 10, color: '#64748B' },
    { name: 'Others', value: 10, color: '#10B981' },
  ],
};
