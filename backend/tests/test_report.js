const mongoose = require("mongoose");
const assert = require("assert");
const Report = require("../models/ReportModel");
const { generateReportPdf } = require("../services/reportPdfService");
const fs = require("fs");
const path = require("path");

async function runTests() {
  console.log("=== Running Backend Report & PDF Integration Tests ===");

  // Mock mongo connection
  const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/jeevansh_test";
  try {
    await mongoose.connect(mongoUri);
    console.log("1. MongoDB connection successful.");
  } catch (err) {
    console.error("MongoDB Connection Failed! Make sure mongodb is running.", err.message);
    process.exit(1);
  }

  // Clear previous test reports
  await Report.deleteMany({ patientName: "Test Patient JSON" });

  // Test Case 1: Report Persistence with ML & Agentic fields
  const mockReportData = {
    patientId: new mongoose.Types.ObjectId(),
    patientName: "Test Patient JSON",
    disease: "bone-fracture",
    diseaseId: "bone_fracture",
    diseaseName: "Bone Fracture",
    imageUrl: "/uploads/test-fracture.png",
    hasFinding: true,
    prediction: "fracture",
    confidence: 71,
    severity: "medium",
    aiModel: "YOLO11 — Bone Fracture Detector",
    taskType: "detection",
    status: "completed",
    reportStatus: "completed",
    medicalReport: {
      title: "AI-Assisted Medical Imaging Report",
      summary: "This is a test summary.",
      findings: [
        {
          diseaseId: "bone_fracture",
          diseaseName: "Bone Fracture",
          status: "detected",
          prediction: "fracture",
          confidence: 71.26,
          interpretation: "A cortical line discontinuity was highlighted.",
          modelArchitecture: "YOLO11",
          modelName: "YOLO11 — Bone Fracture Detector",
          detectionCount: 1
        }
      ],
      overallAssessment: "Patient has signs consistent with a bone fracture.",
      recommendations: ["Refer to specialist"],
      limitations: ["AI requires clinical review"],
      disclaimer: "This AI-generated report is intended to assist clinical review and does not replace professional medical diagnosis."
    },
    reportModel: "nvidia/nemotron-3.5-lightning-30b-a3b",
    reportGeneratedAt: new Date()
  };

  const reportDoc = new Report(mockReportData);
  const savedDoc = await reportDoc.save();
  
  assert.strictEqual(savedDoc.patientName, "Test Patient JSON");
  assert.strictEqual(savedDoc.reportStatus, "completed");
  assert.strictEqual(savedDoc.medicalReport.findings[0].confidence, 71.26);
  assert.strictEqual(savedDoc.medicalReport.findings[0].modelArchitecture, "YOLO11");
  console.log("2. Report schema saving and retrieval validated successfully.");

  // Test Case 2: PDF Generation
  const testPdfDir = path.join(__dirname, "../debug");
  if (!fs.existsSync(testPdfDir)) {
    fs.mkdirSync(testPdfDir, { recursive: true });
  }
  const testPdfPath = path.join(testPdfDir, "test-report-out.pdf");
  const writeStream = fs.createWriteStream(testPdfPath);
  
  try {
    generateReportPdf(savedDoc, writeStream);
    console.log(`3. PDF generated successfully at ${testPdfPath}`);
  } catch (pdfErr) {
    console.error("PDF generation failed!", pdfErr);
    assert.fail("PDF Generation failed");
  }

  // Cleanup DB
  await Report.deleteMany({ patientName: "Test Patient JSON" });
  await mongoose.disconnect();
  console.log("=== All backend tests passed successfully ===");
}

runTests().catch(err => {
  console.error("Test execution failed!", err);
  process.exit(1);
});
