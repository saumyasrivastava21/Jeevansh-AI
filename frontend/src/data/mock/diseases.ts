export type DiseaseId =
  | 'brain-tumor' | 'pneumonia' | 'bone-fracture' | 'dental'
  | 'diabetic-retinopathy' | 'skin-cancer' | 'tuberculosis'
  | 'arthritis' | 'lung-cancer';

export interface Disease {
  id: DiseaseId;
  name: string;
  shortDescription: string;
  imageUrl: string;
  color: string;
  bgColor: string;
  icon: string;
  symptoms: string[];
  causes: string[];
  treatment: string[];
  prevention: string[];
  prevalence: string;
  severity: 'low' | 'medium' | 'high';
}

export const mockDiseases: Disease[] = [
  {
    id: 'brain-tumor',
    name: 'Brain Tumor',
    shortDescription: 'Abnormal growth of cells in the brain detected via MRI analysis.',
    imageUrl: '/images/diseases/brain-tumor.png',
    color: '#8B5CF6', bgColor: '#F5F3FF',
    icon: '🧠',
    severity: 'high',
    prevalence: '~25,000 cases/year in India',
    symptoms: ['Persistent headaches', 'Seizures or convulsions', 'Vision or hearing problems', 'Memory loss', 'Difficulty speaking', 'Personality changes', 'Balance problems'],
    causes: ['Genetic mutations', 'Radiation exposure', 'Family history', 'Age (risk increases with age)', 'Certain chemical exposures'],
    treatment: ['Surgical resection', 'Radiation therapy', 'Chemotherapy', 'Targeted drug therapy', 'Immunotherapy', 'Steroids to reduce swelling'],
    prevention: ['Limit radiation exposure', 'Avoid certain chemical environments', 'Regular health checkups', 'Healthy lifestyle maintenance'],
  },
  {
    id: 'pneumonia',
    name: 'Pneumonia',
    shortDescription: 'Lung infection causing air sacs to fill with fluid, detected via chest X-ray.',
    imageUrl: '/images/diseases/pneumonia.png',
    color: '#0EA5E9', bgColor: '#F0F9FF',
    icon: '🫁',
    severity: 'medium',
    prevalence: '~500,000 hospitalizations/year in India',
    symptoms: ['High fever and chills', 'Productive cough', 'Chest pain when breathing', 'Shortness of breath', 'Fatigue and weakness', 'Nausea or vomiting', 'Low oxygen saturation'],
    causes: ['Bacterial infection (Streptococcus pneumoniae)', 'Viral infections (influenza, COVID-19)', 'Fungal infections', 'Aspiration of foreign material', 'Hospital-acquired infections'],
    treatment: ['Antibiotics (bacterial type)', 'Antiviral medications', 'Fever reducers', 'Oxygen therapy', 'Hospitalization if severe', 'IV fluids for hydration'],
    prevention: ['Pneumonia vaccination', 'Annual flu vaccine', 'Good hand hygiene', 'Quit smoking', 'Strengthen immune system'],
  },
  {
    id: 'bone-fracture',
    name: 'Bone Fracture',
    shortDescription: 'Breaks or cracks in bone structure identified through X-ray imaging.',
    imageUrl: '/images/diseases/bone-fracture.png',
    color: '#F59E0B', bgColor: '#FFFBEB',
    icon: '🦴',
    severity: 'medium',
    prevalence: 'Most common orthopedic injury worldwide',
    symptoms: ['Intense localized pain', 'Swelling and bruising', 'Deformity of limb', 'Inability to bear weight', 'Numbness or tingling', 'Audible snap at time of injury'],
    causes: ['Trauma or accidents', 'Osteoporosis', 'Repetitive stress', 'Sports injuries', 'Falls', 'Pathological fractures from cancer'],
    treatment: ['Casting or splinting', 'Surgical fixation (plates, screws)', 'Traction', 'External fixators', 'Physical therapy', 'Pain management'],
    prevention: ['Calcium and Vitamin D intake', 'Regular weight-bearing exercise', 'Fall prevention', 'Protective gear during sports', 'Osteoporosis screening'],
  },
  {
    id: 'dental',
    name: 'Dental Caries',
    shortDescription: 'Tooth decay and cavities detected via dental X-ray analysis.',
    imageUrl: '/images/diseases/dental.png',
    color: '#10B981', bgColor: '#ECFDF5',
    icon: '🦷',
    severity: 'low',
    prevalence: 'Affects ~95% of adults globally',
    symptoms: ['Toothache', 'Sensitivity to hot/cold', 'Visible holes or pits', 'Pain when biting', 'Mild to sharp pain', 'Staining on tooth surface'],
    causes: ['Bacterial plaque', 'High sugar diet', 'Poor oral hygiene', 'Dry mouth', 'Acidic foods and drinks', 'Deep tooth grooves'],
    treatment: ['Dental fillings', 'Root canal treatment', 'Tooth extraction', 'Dental crowns', 'Fluoride treatment', 'Antibiotics for infection'],
    prevention: ['Brush twice daily', 'Floss regularly', 'Limit sugary foods', 'Regular dental checkups', 'Fluoride toothpaste', 'Dental sealants'],
  },
  {
    id: 'diabetic-retinopathy',
    name: 'Diabetic Retinopathy',
    shortDescription: 'Diabetes-related eye damage detected through retinal imaging analysis.',
    imageUrl: '/images/diseases/diabetic-retinopathy.png',
    color: '#EF4444', bgColor: '#FEF2F2',
    icon: '👁️',
    severity: 'high',
    prevalence: 'Affects 1 in 3 diabetics globally',
    symptoms: ['Blurred vision', 'Floaters in vision', 'Dark or empty areas', 'Vision fluctuation', 'Color vision problems', 'Eventual blindness if untreated'],
    causes: ['Uncontrolled blood sugar', 'High blood pressure', 'High cholesterol', 'Duration of diabetes', 'Pregnancy in diabetics', 'Smoking'],
    treatment: ['Laser photocoagulation', 'Anti-VEGF injections', 'Vitrectomy surgery', 'Steroid injections', 'Blood sugar control', 'Blood pressure management'],
    prevention: ['Regular blood sugar monitoring', 'Annual eye exams', 'Healthy diet', 'Regular exercise', 'Quit smoking', 'Blood pressure control'],
  },
  {
    id: 'skin-cancer',
    name: 'Skin Cancer',
    shortDescription: 'Malignant skin lesions detected through dermoscopy and image analysis.',
    imageUrl: '/images/diseases/skin-cancer.png',
    color: '#F97316', bgColor: '#FFF7ED',
    icon: '🔬',
    severity: 'high',
    prevalence: '~13,000 cases/year in India',
    symptoms: ['New mole or growth', 'Change in existing mole', 'Irregular border lesion', 'Multiple colors in mole', 'Sore that does not heal', 'Itching or bleeding lesion'],
    causes: ['UV radiation exposure', 'Fair skin type', 'Family history', 'Weakened immune system', 'Exposure to chemicals', 'Previous sunburns'],
    treatment: ['Surgical excision', 'Mohs surgery', 'Radiation therapy', 'Chemotherapy', 'Immunotherapy', 'Targeted therapy'],
    prevention: ['Sunscreen use daily', 'Avoid peak sun hours', 'Protective clothing', 'Regular skin self-exams', 'Annual dermatology checkup', 'Avoid tanning beds'],
  },
  {
    id: 'tuberculosis',
    name: 'Tuberculosis',
    shortDescription: 'Bacterial lung infection identified through chest X-ray pattern analysis.',
    imageUrl: '/images/diseases/tuberculosis.png',
    color: '#6366F1', bgColor: '#EEF2FF',
    icon: '🦠',
    severity: 'high',
    prevalence: 'India has the highest TB burden globally',
    symptoms: ['Persistent cough >3 weeks', 'Coughing blood', 'Night sweats', 'Unexplained weight loss', 'Fever and chills', 'Chest pain', 'Fatigue and weakness'],
    causes: ['Mycobacterium tuberculosis bacteria', 'Airborne transmission', 'Close contact with TB patient', 'Weakened immunity', 'HIV co-infection', 'Malnutrition'],
    treatment: ['6-month antibiotic course (DOTS)', 'Isoniazid, Rifampin, Pyrazinamide', 'Drug-resistant TB protocols', 'Nutritional support', 'Isolation if active TB', 'Regular sputum tests'],
    prevention: ['BCG vaccination', 'Early diagnosis and treatment', 'Good ventilation', 'Masks in high-risk areas', 'HIV testing', 'Regular screening for contacts'],
  },
  {
    id: 'arthritis',
    name: 'Arthritis',
    shortDescription: 'Joint inflammation and degeneration detected through X-ray and scan analysis.',
    imageUrl: '/images/diseases/arthritis.png',
    color: '#84CC16', bgColor: '#F7FEE7',
    icon: '🦿',
    severity: 'medium',
    prevalence: 'Affects ~180 million Indians',
    symptoms: ['Joint pain and stiffness', 'Swelling and redness', 'Decreased range of motion', 'Warmth in joints', 'Fatigue', 'Morning stiffness >1 hour', 'Joint deformity over time'],
    causes: ['Age-related wear (osteoarthritis)', 'Autoimmune disorder (rheumatoid)', 'Genetic predisposition', 'Previous joint injuries', 'Obesity', 'Infection'],
    treatment: ['Anti-inflammatory medications', 'Corticosteroids', 'Disease-modifying drugs', 'Physical therapy', 'Joint replacement surgery', 'Lifestyle modifications'],
    prevention: ['Maintain healthy weight', 'Regular low-impact exercise', 'Protect joints from injury', 'Omega-3 rich diet', 'Early treatment of infections', 'Calcium supplementation'],
  },
  {
    id: 'lung-cancer',
    name: 'Lung Cancer',
    shortDescription: 'Malignant lung nodules detected through CT scan and X-ray analysis.',
    imageUrl: '/images/diseases/lung-cancer.png',
    color: '#64748B', bgColor: '#F8FAFC',
    icon: '🫁',
    severity: 'high',
    prevalence: '~70,000 cases/year in India',
    symptoms: ['Persistent cough', 'Coughing blood', 'Shortness of breath', 'Chest pain', 'Hoarseness of voice', 'Unexplained weight loss', 'Bone pain if metastasized'],
    causes: ['Smoking (primary cause)', 'Secondhand smoke', 'Radon gas exposure', 'Asbestos exposure', 'Air pollution', 'Genetic factors', 'Prior lung disease'],
    treatment: ['Surgery (lobectomy)', 'Chemotherapy', 'Radiation therapy', 'Targeted molecular therapy', 'Immunotherapy', 'Palliative care'],
    prevention: ['Quit smoking', 'Avoid secondhand smoke', 'Radon testing at home', 'Avoid carcinogen exposure', 'Regular screening for high-risk individuals', 'Healthy diet'],
  },
];
