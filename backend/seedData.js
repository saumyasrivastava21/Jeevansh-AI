const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

dotenv.config();

// Models
const User = require("./models/UserModel");
const Doctor = require("./models/DoctorModel");
const Disease = require("./models/DiseaseModel");
const Report = require("./models/ReportModel");

// ─── Mock Users ────────────────────────────────────────────────
const mockUsers = [
  {
    name: "Arjun Mehta",
    email: "arjun@example.com",
    password: "demo123",
    phone: "+91-9876543210",
    address: "14 MG Road, Bangalore, KA 560001",
    role: "patient",
    avatar:
      "https://ui-avatars.com/api/?name=Arjun+Mehta&background=0B3C5D&color=fff&size=128",
    isActive: true,
  },
  {
    name: "Priya Sharma",
    email: "priya@example.com",
    password: "demo123",
    phone: "+91-9123456780",
    address: "22 Andheri West, Mumbai, MH 400053",
    role: "patient",
    avatar:
      "https://ui-avatars.com/api/?name=Priya+Sharma&background=2ECC71&color=fff&size=128",
    isActive: true,
  },
  {
    name: "Ravi Kumar",
    email: "ravi@example.com",
    password: "demo123",
    phone: "+91-9988776655",
    address: "5 Civil Lines, Delhi 110054",
    role: "patient",
    avatar:
      "https://ui-avatars.com/api/?name=Ravi+Kumar&background=1A5C8F&color=fff&size=128",
    isActive: false,
  },
  {
    name: "Dr. Neha Joshi",
    email: "neha.joshi@hospital.com",
    password: "demo123",
    phone: "+91-9900112233",
    address: "Apollo Hospital, Chennai 600006",
    role: "doctor",
    avatar:
      "https://ui-avatars.com/api/?name=Neha+Joshi&background=00D1FF&color=0B3C5D&size=128",
    isActive: true,
  },
  {
    name: "Dr. Rajesh Verma",
    email: "rajesh.verma@hospital.com",
    password: "demo123",
    phone: "+91-9800223344",
    address: "Fortis Healthcare, New Delhi",
    role: "doctor",
    avatar:
      "https://ui-avatars.com/api/?name=Rajesh+Verma&background=2ECC71&color=fff&size=128",
    isActive: true,
  },
  {
    name: "Dr. Sunita Rao",
    email: "sunita.rao@hospital.com",
    password: "demo123",
    phone: "+91-9700334455",
    address: "Tata Memorial Center, Mumbai, MH",
    role: "doctor",
    avatar:
      "https://ui-avatars.com/api/?name=Sunita+Rao&background=8B5CF6&color=fff&size=128",
    isActive: true,
  },
  {
    name: "Dr. Anil Khanna",
    email: "anil.khanna@hospital.com",
    password: "demo123",
    phone: "+91-9600445566",
    address: "Max Super Speciality, Gurugram, HR",
    role: "doctor",
    avatar:
      "https://ui-avatars.com/api/?name=Anil+Khanna&background=F59E0B&color=fff&size=128",
    isActive: true,
  },
  {
    name: "Dr. Meera Pillai",
    email: "meera.pillai@hospital.com",
    password: "demo123",
    phone: "+91-9500556677",
    address: "Narayana Nethralaya, Bangalore, KA",
    role: "doctor",
    avatar:
      "https://ui-avatars.com/api/?name=Meera+Pillai&background=EF4444&color=fff&size=128",
    isActive: true,
  },
  {
    name: "Dr. Farhan Sheikh",
    email: "farhan.sheikh@hospital.com",
    password: "demo123",
    phone: "+91-9400667788",
    address: "Kokilaben Hospital, Mumbai, MH",
    role: "doctor",
    avatar:
      "https://ui-avatars.com/api/?name=Farhan+Sheikh&background=F97316&color=fff&size=128",
    isActive: true,
  },
  {
    name: "Admin User",
    email: "admin@jeevansh.ai",
    password: "demo123",
    phone: "+91-9000000001",
    address: "Jeevansh AI HQ, Hyderabad",
    role: "admin",
    avatar:
      "https://ui-avatars.com/api/?name=Admin+User&background=8B5CF6&color=fff&size=128",
    isActive: true,
  },
];

// ─── Mock Doctors (keyed by user email for linking) ────────────
const mockDoctors = [
  {
    userEmail: "neha.joshi@hospital.com",
    specialty: "Radiologist",
    subSpecialty: "Neuro Imaging",
    rating: 4.9,
    reviewCount: 312,
    experience: 14,
    hospital: "Apollo Hospitals",
    location: "Chennai, TN",
    available: true,
    nextSlot: "Today, 3:00 PM",
    consultationFee: 800,
    languages: ["English", "Hindi", "Tamil"],
    bio: "Specialist in AI-assisted neurological imaging with 14 years of clinical experience.",
  },
  {
    userEmail: "rajesh.verma@hospital.com",
    specialty: "Pulmonologist",
    subSpecialty: "Chest Diseases",
    rating: 4.7,
    reviewCount: 228,
    experience: 11,
    hospital: "Fortis Healthcare",
    location: "New Delhi",
    available: true,
    nextSlot: "Today, 5:30 PM",
    consultationFee: 700,
    languages: ["English", "Hindi", "Punjabi"],
    bio: "Expert in pneumonia management and TB treatment protocols.",
  },
  {
    userEmail: "sunita.rao@hospital.com",
    specialty: "Oncologist",
    subSpecialty: "Thoracic Oncology",
    rating: 4.8,
    reviewCount: 189,
    experience: 16,
    hospital: "Tata Memorial Center",
    location: "Mumbai, MH",
    available: false,
    nextSlot: "Tomorrow, 10:00 AM",
    consultationFee: 1200,
    languages: ["English", "Hindi", "Marathi"],
    bio: "Leading oncologist specializing in lung and thoracic cancers with AI-assisted diagnosis.",
  },
  {
    userEmail: "anil.khanna@hospital.com",
    specialty: "Orthopedic Surgeon",
    subSpecialty: "Bone & Joint",
    rating: 4.6,
    reviewCount: 415,
    experience: 18,
    hospital: "Max Super Speciality",
    location: "Gurugram, HR",
    available: true,
    nextSlot: "Today, 4:00 PM",
    consultationFee: 1000,
    languages: ["English", "Hindi"],
    bio: "Senior orthopedic surgeon with expertise in fracture management and joint replacement.",
  },
  {
    userEmail: "meera.pillai@hospital.com",
    specialty: "Ophthalmologist",
    subSpecialty: "Diabetic Eye Care",
    rating: 4.9,
    reviewCount: 267,
    experience: 12,
    hospital: "Narayana Nethralaya",
    location: "Bangalore, KA",
    available: true,
    nextSlot: "Today, 2:30 PM",
    consultationFee: 900,
    languages: ["English", "Hindi", "Malayalam", "Kannada"],
    bio: "Specialist in diabetic retinopathy screening and laser treatment.",
  },
  {
    userEmail: "farhan.sheikh@hospital.com",
    specialty: "Dermatologist",
    subSpecialty: "Dermato-Oncology",
    rating: 4.7,
    reviewCount: 193,
    experience: 9,
    hospital: "Kokilaben Hospital",
    location: "Mumbai, MH",
    available: false,
    nextSlot: "Tomorrow, 11:30 AM",
    consultationFee: 850,
    languages: ["English", "Hindi", "Urdu"],
    bio: "Skin cancer specialist with experience in dermoscopy and AI-assisted lesion analysis.",
  },
];

// ─── Mock Diseases ─────────────────────────────────────────────
const mockDiseases = [
  {
    name: "Brain Tumor",
    shortDescription:
      "Abnormal growth of cells in the brain detected via MRI analysis.",
    imageUrl: "/images/diseases/brain-tumor.png",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
    icon: "🧠",
    severity: "high",
    prevalence: "~25,000 cases/year in India",
    symptoms: [
      "Persistent headaches",
      "Seizures or convulsions",
      "Vision or hearing problems",
      "Memory loss",
      "Difficulty speaking",
      "Personality changes",
      "Balance problems",
    ],
    causes: [
      "Genetic mutations",
      "Radiation exposure",
      "Family history",
      "Age (risk increases with age)",
      "Certain chemical exposures",
    ],
    treatment: [
      "Surgical resection",
      "Radiation therapy",
      "Chemotherapy",
      "Targeted drug therapy",
      "Immunotherapy",
      "Steroids to reduce swelling",
    ],
    prevention: [
      "Limit radiation exposure",
      "Avoid certain chemical environments",
      "Regular health checkups",
      "Healthy lifestyle maintenance",
    ],
  },
  {
    name: "Pneumonia",
    shortDescription:
      "Lung infection causing air sacs to fill with fluid, detected via chest X-ray.",
    imageUrl: "/images/diseases/pneumonia.png",
    color: "#0EA5E9",
    bgColor: "#F0F9FF",
    icon: "🫁",
    severity: "medium",
    prevalence: "~500,000 hospitalizations/year in India",
    symptoms: [
      "High fever and chills",
      "Productive cough",
      "Chest pain when breathing",
      "Shortness of breath",
      "Fatigue and weakness",
      "Nausea or vomiting",
      "Low oxygen saturation",
    ],
    causes: [
      "Bacterial infection (Streptococcus pneumoniae)",
      "Viral infections (influenza, COVID-19)",
      "Fungal infections",
      "Aspiration of foreign material",
      "Hospital-acquired infections",
    ],
    treatment: [
      "Antibiotics (bacterial type)",
      "Antiviral medications",
      "Fever reducers",
      "Oxygen therapy",
      "Hospitalization if severe",
      "IV fluids for hydration",
    ],
    prevention: [
      "Pneumonia vaccination",
      "Annual flu vaccine",
      "Good hand hygiene",
      "Quit smoking",
      "Strengthen immune system",
    ],
  },
  {
    name: "Bone Fracture",
    shortDescription:
      "Breaks or cracks in bone structure identified through X-ray imaging.",
    imageUrl: "/images/diseases/bone-fracture.png",
    color: "#F59E0B",
    bgColor: "#FFFBEB",
    icon: "🦴",
    severity: "medium",
    prevalence: "Most common orthopedic injury worldwide",
    symptoms: [
      "Intense localized pain",
      "Swelling and bruising",
      "Deformity of limb",
      "Inability to bear weight",
      "Numbness or tingling",
      "Audible snap at time of injury",
    ],
    causes: [
      "Trauma or accidents",
      "Osteoporosis",
      "Repetitive stress",
      "Sports injuries",
      "Falls",
      "Pathological fractures from cancer",
    ],
    treatment: [
      "Casting or splinting",
      "Surgical fixation (plates, screws)",
      "Traction",
      "External fixators",
      "Physical therapy",
      "Pain management",
    ],
    prevention: [
      "Calcium and Vitamin D intake",
      "Regular weight-bearing exercise",
      "Fall prevention",
      "Protective gear during sports",
      "Osteoporosis screening",
    ],
  },
  {
    name: "Dental Caries",
    shortDescription:
      "Tooth decay and cavities detected via dental X-ray analysis.",
    imageUrl: "/images/diseases/dental.png",
    color: "#10B981",
    bgColor: "#ECFDF5",
    icon: "🦷",
    severity: "low",
    prevalence: "Affects ~95% of adults globally",
    symptoms: [
      "Toothache",
      "Sensitivity to hot/cold",
      "Visible holes or pits",
      "Pain when biting",
      "Mild to sharp pain",
      "Staining on tooth surface",
    ],
    causes: [
      "Bacterial plaque",
      "High sugar diet",
      "Poor oral hygiene",
      "Dry mouth",
      "Acidic foods and drinks",
      "Deep tooth grooves",
    ],
    treatment: [
      "Dental fillings",
      "Root canal treatment",
      "Tooth extraction",
      "Dental crowns",
      "Fluoride treatment",
      "Antibiotics for infection",
    ],
    prevention: [
      "Brush twice daily",
      "Floss regularly",
      "Limit sugary foods",
      "Regular dental checkups",
      "Fluoride toothpaste",
      "Dental sealants",
    ],
  },
  {
    name: "Diabetic Retinopathy",
    shortDescription:
      "Diabetes-related eye damage detected through retinal imaging analysis.",
    imageUrl: "/images/diseases/diabetic-retinopathy.png",
    color: "#EF4444",
    bgColor: "#FEF2F2",
    icon: "👁️",
    severity: "high",
    prevalence: "Affects 1 in 3 diabetics globally",
    symptoms: [
      "Blurred vision",
      "Floaters in vision",
      "Dark or empty areas",
      "Vision fluctuation",
      "Color vision problems",
      "Eventual blindness if untreated",
    ],
    causes: [
      "Uncontrolled blood sugar",
      "High blood pressure",
      "High cholesterol",
      "Duration of diabetes",
      "Pregnancy in diabetics",
      "Smoking",
    ],
    treatment: [
      "Laser photocoagulation",
      "Anti-VEGF injections",
      "Vitrectomy surgery",
      "Steroid injections",
      "Blood sugar control",
      "Blood pressure management",
    ],
    prevention: [
      "Regular blood sugar monitoring",
      "Annual eye exams",
      "Healthy diet",
      "Regular exercise",
      "Quit smoking",
      "Blood pressure control",
    ],
  },
  {
    name: "Skin Cancer",
    shortDescription:
      "Malignant skin lesions detected through dermoscopy and image analysis.",
    imageUrl: "/images/diseases/skin-cancer.png",
    color: "#F97316",
    bgColor: "#FFF7ED",
    icon: "🔬",
    severity: "high",
    prevalence: "~13,000 cases/year in India",
    symptoms: [
      "New mole or growth",
      "Change in existing mole",
      "Irregular border lesion",
      "Multiple colors in mole",
      "Sore that does not heal",
      "Itching or bleeding lesion",
    ],
    causes: [
      "UV radiation exposure",
      "Fair skin type",
      "Family history",
      "Weakened immune system",
      "Exposure to chemicals",
      "Previous sunburns",
    ],
    treatment: [
      "Surgical excision",
      "Mohs surgery",
      "Radiation therapy",
      "Chemotherapy",
      "Immunotherapy",
      "Targeted therapy",
    ],
    prevention: [
      "Sunscreen use daily",
      "Avoid peak sun hours",
      "Protective clothing",
      "Regular skin self-exams",
      "Annual dermatology checkup",
      "Avoid tanning beds",
    ],
  },
  {
    name: "Tuberculosis",
    shortDescription:
      "Bacterial lung infection identified through chest X-ray pattern analysis.",
    imageUrl: "/images/diseases/tuberculosis.png",
    color: "#6366F1",
    bgColor: "#EEF2FF",
    icon: "🦠",
    severity: "high",
    prevalence: "India has the highest TB burden globally",
    symptoms: [
      "Persistent cough >3 weeks",
      "Coughing blood",
      "Night sweats",
      "Unexplained weight loss",
      "Fever and chills",
      "Chest pain",
      "Fatigue and weakness",
    ],
    causes: [
      "Mycobacterium tuberculosis bacteria",
      "Airborne transmission",
      "Close contact with TB patient",
      "Weakened immunity",
      "HIV co-infection",
      "Malnutrition",
    ],
    treatment: [
      "6-month antibiotic course (DOTS)",
      "Isoniazid, Rifampin, Pyrazinamide",
      "Drug-resistant TB protocols",
      "Nutritional support",
      "Isolation if active TB",
      "Regular sputum tests",
    ],
    prevention: [
      "BCG vaccination",
      "Early diagnosis and treatment",
      "Good ventilation",
      "Masks in high-risk areas",
      "HIV testing",
      "Regular screening for contacts",
    ],
  },
  {
    name: "Arthritis",
    shortDescription:
      "Joint inflammation and degeneration detected through X-ray and scan analysis.",
    imageUrl: "/images/diseases/arthritis.png",
    color: "#84CC16",
    bgColor: "#F7FEE7",
    icon: "🦿",
    severity: "medium",
    prevalence: "Affects ~180 million Indians",
    symptoms: [
      "Joint pain and stiffness",
      "Swelling and redness",
      "Decreased range of motion",
      "Warmth in joints",
      "Fatigue",
      "Morning stiffness >1 hour",
      "Joint deformity over time",
    ],
    causes: [
      "Age-related wear (osteoarthritis)",
      "Autoimmune disorder (rheumatoid)",
      "Genetic predisposition",
      "Previous joint injuries",
      "Obesity",
      "Infection",
    ],
    treatment: [
      "Anti-inflammatory medications",
      "Corticosteroids",
      "Disease-modifying drugs",
      "Physical therapy",
      "Joint replacement surgery",
      "Lifestyle modifications",
    ],
    prevention: [
      "Maintain healthy weight",
      "Regular low-impact exercise",
      "Protect joints from injury",
      "Omega-3 rich diet",
      "Early treatment of infections",
      "Calcium supplementation",
    ],
  },
  {
    name: "Lung Cancer",
    shortDescription:
      "Malignant lung nodules detected through CT scan and X-ray analysis.",
    imageUrl: "/images/diseases/lung-cancer.png",
    color: "#64748B",
    bgColor: "#F8FAFC",
    icon: "🫁",
    severity: "high",
    prevalence: "~70,000 cases/year in India",
    symptoms: [
      "Persistent cough",
      "Coughing blood",
      "Shortness of breath",
      "Chest pain",
      "Hoarseness of voice",
      "Unexplained weight loss",
      "Bone pain if metastasized",
    ],
    causes: [
      "Smoking (primary cause)",
      "Secondhand smoke",
      "Radon gas exposure",
      "Asbestos exposure",
      "Air pollution",
      "Genetic factors",
      "Prior lung disease",
    ],
    treatment: [
      "Surgery (lobectomy)",
      "Chemotherapy",
      "Radiation therapy",
      "Targeted molecular therapy",
      "Immunotherapy",
      "Palliative care",
    ],
    prevention: [
      "Quit smoking",
      "Avoid secondhand smoke",
      "Radon testing at home",
      "Avoid carcinogen exposure",
      "Regular screening for high-risk individuals",
      "Healthy diet",
    ],
  },
];

// ─── Mock Reports (patientEmail for linking, doctorName for display) ───
const mockReportsData = [
  {
    patientEmail: "arjun@example.com",
    patientName: "Arjun Mehta",
    disease: "pneumonia",
    diseaseName: "Pneumonia",
    imageUrl: "https://picsum.photos/seed/xray1/600/500",
    confidence: 91.4,
    severity: "high",
    status: "completed",
    aiFindings:
      "AI analysis detected significant consolidation in the right lower lobe consistent with bacterial pneumonia. Increased opacity observed with air bronchograms. No pleural effusion noted.",
    recommendation:
      "Immediate antibiotic therapy recommended. Follow-up chest X-ray in 4–6 weeks. Monitor oxygen saturation closely.",
    doctorName: "Dr. Rajesh Verma",
    doctorNotes:
      "Confirmed pneumonia. Started Amoxicillin 500mg TID. Patient to rest and maintain hydration.",
    createdAt: new Date("2026-03-25T09:30:00Z"),
    reviewedAt: new Date("2026-03-25T14:00:00Z"),
    bboxCoords: { x: 55, y: 40, w: 30, h: 35 },
  },
  {
    patientEmail: "arjun@example.com",
    patientName: "Arjun Mehta",
    disease: "bone-fracture",
    diseaseName: "Bone Fracture",
    imageUrl: "https://picsum.photos/seed/xray2/600/500",
    confidence: 87.2,
    severity: "medium",
    status: "reviewed",
    aiFindings:
      "Hairline fracture detected in the distal radius. Mildly displaced fracture with no significant angulation. Soft tissue swelling present around the fracture site.",
    recommendation:
      "Casting for 6 weeks. Calcium and Vitamin D supplementation. Orthopedic follow-up in 2 weeks.",
    doctorName: "Dr. Anil Khanna",
    doctorNotes:
      "Applied below-elbow cast. Pain management with ibuprofen. Review in 2 weeks.",
    createdAt: new Date("2026-03-20T11:00:00Z"),
    reviewedAt: new Date("2026-03-20T16:30:00Z"),
    bboxCoords: { x: 40, y: 60, w: 25, h: 30 },
  },
  {
    patientEmail: "priya@example.com",
    patientName: "Priya Sharma",
    disease: "brain-tumor",
    diseaseName: "Brain Tumor",
    imageUrl: "https://picsum.photos/seed/mri1/600/500",
    confidence: 78.9,
    severity: "high",
    status: "processing",
    aiFindings:
      "AI model has detected a suspicious hyperdense lesion in the right frontal lobe. Further MRI with contrast is recommended for definitive diagnosis.",
    recommendation:
      "Urgent MRI with contrast. Neurosurgery consultation required. Monitor for neurological symptoms.",
    createdAt: new Date("2026-03-27T08:15:00Z"),
    bboxCoords: { x: 45, y: 25, w: 20, h: 22 },
  },
  {
    patientEmail: "ravi@example.com",
    patientName: "Ravi Kumar",
    disease: "tuberculosis",
    diseaseName: "Tuberculosis",
    imageUrl: "https://picsum.photos/seed/xray3/600/500",
    confidence: 94.1,
    severity: "high",
    status: "completed",
    aiFindings:
      "Bilateral upper lobe infiltrates with cavitation noted. Findings strongly suggestive of active pulmonary tuberculosis. Hilar lymphadenopathy visible.",
    recommendation:
      "Start DOTS therapy immediately. Sputum AFB smear. Isolate patient. Notify public health authorities.",
    doctorName: "Dr. Rajesh Verma",
    createdAt: new Date("2026-03-22T07:45:00Z"),
    reviewedAt: new Date("2026-03-22T13:00:00Z"),
    bboxCoords: { x: 20, y: 15, w: 60, h: 40 },
  },
  {
    patientEmail: "arjun@example.com",
    patientName: "Arjun Mehta",
    disease: "lung-cancer",
    diseaseName: "Lung Cancer",
    imageUrl: "https://picsum.photos/seed/xray4/600/500",
    confidence: 65.3,
    severity: "medium",
    status: "pending",
    aiFindings:
      "A 1.2cm pulmonary nodule detected in the right upper lobe. Spiculated margins noted. Low-to-moderate probability of malignancy based on AI analysis.",
    recommendation:
      "CT chest with contrast for nodule characterization. PET scan if malignancy suspected. Thoracic oncology consultation.",
    createdAt: new Date("2026-03-28T06:00:00Z"),
    bboxCoords: { x: 60, y: 20, w: 15, h: 18 },
  },
];

// ─── Seed Function ─────────────────────────────────────────────
const seedDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Clear existing data
    console.log("\n🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Disease.deleteMany({});
    await Report.deleteMany({});
    console.log("   Done.");

    // 1. Seed Users (passwords are auto-hashed by the pre-save hook)
    console.log("\n👤 Seeding Users...");
    const createdUsers = await User.create(mockUsers);
    console.log(`   ✅ ${createdUsers.length} users created`);

    // Build email → _id lookup
    const userByEmail = {};
    createdUsers.forEach((u) => {
      userByEmail[u.email] = u._id;
    });

    // 2. Seed Doctors (link to user via userId)
    console.log("\n🩺 Seeding Doctors...");
    const doctorDocs = mockDoctors.map((d) => {
      const { userEmail, ...doctorData } = d;
      return { ...doctorData, userId: userByEmail[userEmail] };
    });
    const createdDoctors = await Doctor.insertMany(doctorDocs);
    console.log(`   ✅ ${createdDoctors.length} doctors created`);

    // 3. Seed Diseases
    console.log("\n🦠 Seeding Diseases...");
    const createdDiseases = await Disease.insertMany(mockDiseases);
    console.log(`   ✅ ${createdDiseases.length} diseases created`);

    // 4. Seed Reports (link patientId via email lookup)
    console.log("\n📋 Seeding Reports...");
    const reportDocs = mockReportsData.map((r) => {
      const { patientEmail, ...reportData } = r;
      return { ...reportData, patientId: userByEmail[patientEmail] };
    });
    const createdReports = await Report.insertMany(reportDocs);
    console.log(`   ✅ ${createdReports.length} reports created`);

    // Summary
    console.log("\n" + "═".repeat(50));
    console.log("🎉 DATABASE SEEDED SUCCESSFULLY!");
    console.log("═".repeat(50));
    console.log(`   Users:    ${createdUsers.length}`);
    console.log(`   Doctors:  ${createdDoctors.length}`);
    console.log(`   Diseases: ${createdDiseases.length}`);
    console.log(`   Reports:  ${createdReports.length}`);
    console.log("\n📌 Demo Credentials (password: demo123):");
    console.log("   Patient: arjun@example.com");
    console.log("   Doctor:  neha.joshi@hospital.com");
    console.log("   Admin:   admin@jeevansh.ai");
    console.log("═".repeat(50));

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Error:", error);
    process.exit(1);
  }
};

seedDatabase();
