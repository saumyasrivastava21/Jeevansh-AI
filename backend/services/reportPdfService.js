const PDFDocument = require("pdfkit");

/**
 * Generates a professional hospital-style medical report PDF from MongoDB report data.
 * @param {object} report - The Mongoose report document.
 * @param {stream.Writable} writeStream - Writable stream (usually Express res).
 */
function generateReportPdf(report, writeStream) {
  const doc = new PDFDocument({ margin: 50, size: "A4", bufferPages: true });
  doc.pipe(writeStream);

  // Colors
  const primaryColor = "#0f172a";   // Dark Slate
  const accentColor = "#0891b2";    // Cyan / Medical Blue
  const textColor = "#334155";      // Slate 700
  const lightBg = "#f8fafc";        // Slate 50
  const borderLight = "#e2e8f0";    // Slate 200

  // 1. Header Section
  doc.rect(0, 0, 595.28, 15).fill(accentColor); // Top accent strip

  doc.fillColor(primaryColor);
  doc.fontSize(24).font("Helvetica-Bold").text("JEEVANSH AI", 50, 40);
  doc.fontSize(10).font("Helvetica").fillColor(textColor).text("Next-Generation AI Medical Diagnostics", 50, 68);
  
  doc.fontSize(13).font("Helvetica-Bold").fillColor(accentColor).text("AI-ASSISTED MEDICAL IMAGING REPORT", 50, 95, { align: "right" });
  
  // Horizontal Line
  doc.moveTo(50, 115).lineTo(545, 115).strokeColor(borderLight).lineWidth(1.5).stroke();

  // 2. Patient & Report Metadata
  doc.fontSize(10).font("Helvetica-Bold").fillColor(primaryColor).text("PATIENT INFORMATION", 50, 130);
  doc.font("Helvetica").fillColor(textColor);
  doc.text(`Patient Name: ${report.patientName || "N/A"}`, 50, 148);
  doc.text(`Patient ID: ${report.patientId ? report.patientId.toString() : "N/A"}`, 50, 163);

  doc.fontSize(10).font("Helvetica-Bold").fillColor(primaryColor).text("REPORT METADATA", 320, 130);
  doc.font("Helvetica").fillColor(textColor);
  doc.text(`Report ID: ${report._id.toString().toUpperCase()}`, 320, 148);
  doc.text(`Date Created: ${new Date(report.createdAt).toLocaleDateString("en-IN")}`, 320, 163);
  doc.text(`Inference Model: ${report.aiModel || "Jeevansh AI"}`, 320, 178);

  doc.moveTo(50, 198).lineTo(545, 198).strokeColor(borderLight).lineWidth(1).stroke();

  let currentY = 215;

  // 3. Raw Model Inference Results
  doc.fontSize(12).font("Helvetica-Bold").fillColor(primaryColor).text("1. RAW MEDICAL MODEL INFERENCE RESULTS", 50, currentY);
  currentY += 20;

  // Render scan details table
  doc.rect(50, currentY, 495, 80).fill(lightBg);
  doc.fillColor(primaryColor).font("Helvetica-Bold");
  doc.text("Disease Target:", 65, currentY + 10);
  doc.text("Finding Status:", 65, currentY + 28);
  doc.text("Model Architecture:", 65, currentY + 46);
  doc.text("Model Confidence:", 65, currentY + 64);

  doc.font("Helvetica").fillColor(textColor);
  doc.text(report.diseaseName || "N/A", 200, currentY + 10);
  
  const statusStr = report.hasFinding ? "Detected" : "Not Detected";
  doc.fillColor(report.hasFinding ? "#dc2626" : "#16a34a").font("Helvetica-Bold");
  doc.text(statusStr, 200, currentY + 28);

  doc.fillColor(textColor).font("Helvetica");
  doc.text(report.taskType === "detection" && report.aiModel.includes("YOLO") ? "YOLO11" : (report.taskType === "classification" ? "MobileNetV3-Large" : "N/A"), 200, currentY + 46);
  
  const confDisplay = report.confidence !== null && report.confidence !== undefined ? `${report.confidence}%` : "N/A";
  doc.text(confDisplay, 200, currentY + 64);

  currentY += 95;

  // Show class probabilities or detections if they exist
  if (report.taskType === "classification" && report.probabilities) {
    doc.fontSize(11).font("Helvetica-Bold").fillColor(primaryColor).text("Class Probabilities:", 50, currentY);
    currentY += 15;
    
    // Sort probabilities descending
    const sortedProbs = Object.entries(report.probabilities).sort((a, b) => b[1] - a[1]);
    for (const [cls, prob] of sortedProbs) {
      const percentage = (prob <= 1 ? prob * 100 : prob).toFixed(2);
      doc.fontSize(9).font("Helvetica").fillColor(textColor).text(`${cls.replace(/_/g, " ").toUpperCase()}: ${percentage}%`, 65, currentY);
      currentY += 14;
      if (currentY > 730) { doc.addPage(); currentY = 50; }
    }
    currentY += 10;
  } else if (report.taskType === "detection" && report.detections && report.detections.length > 0) {
    doc.fontSize(11).font("Helvetica-Bold").fillColor(primaryColor).text("Detected Bounding Boxes:", 50, currentY);
    currentY += 15;

    report.detections.forEach((d, idx) => {
      const bboxStr = d.bbox ? `X: ${Math.round(d.bbox.x)}%, Y: ${Math.round(d.bbox.y)}%, W: ${Math.round(d.bbox.w)}%, H: ${Math.round(d.bbox.h)}%` : "N/A";
      doc.fontSize(9).font("Helvetica").fillColor(textColor).text(`[Detection #${idx + 1}] Label: ${d.label} · Confidence: ${d.confidence}% · Coordinates: ${bboxStr}`, 65, currentY);
      currentY += 14;
      if (currentY > 730) { doc.addPage(); currentY = 50; }
    });
    currentY += 10;
  }

  if (currentY > 700) { doc.addPage(); currentY = 50; }

  // 4. LLM Medical Report Section (Only if completed)
  if (report.reportStatus === "completed" && report.medicalReport) {
    doc.moveTo(50, currentY).lineTo(545, currentY).strokeColor(borderLight).lineWidth(1).stroke();
    currentY += 15;

    doc.fontSize(12).font("Helvetica-Bold").fillColor(primaryColor).text("2. AI-GENERATED MEDICAL REPORT (NVIDIA Nemotron)", 50, currentY);
    currentY += 20;

    // Summary
    doc.fontSize(10).font("Helvetica-Bold").fillColor(accentColor).text("REPORT SUMMARY", 50, currentY);
    currentY += 15;
    doc.fontSize(9).font("Helvetica").fillColor(textColor).text(report.medicalReport.summary || "N/A", 50, currentY, { width: 495, align: "justify" });
    
    const summaryLines = Math.ceil((report.medicalReport.summary || "").length / 90);
    currentY += summaryLines * 12 + 15;

    if (currentY > 700) { doc.addPage(); currentY = 50; }

    // Per-disease findings interpretation (flat schema keys)
    doc.fontSize(10).font("Helvetica-Bold").fillColor(accentColor).text("FINDINGS INTERPRETATION", 50, currentY);
    currentY += 15;

    (report.medicalReport.findings || []).forEach((finding) => {
      const displayStatus = (finding.status || "N/A").toUpperCase().replace('_', ' ');
      doc.fontSize(9).font("Helvetica-Bold").fillColor(primaryColor).text(`Disease Target: ${finding.diseaseName} (${displayStatus})`, 60, currentY);
      currentY += 13;
      
      doc.fontSize(8.5).font("Helvetica").fillColor(textColor);
      doc.text(`Model Architecture: ${finding.modelArchitecture || "N/A"}`, 70, currentY);
      doc.text(`Model Name: ${finding.modelName || "N/A"}`, 70, currentY + 12);
      
      const predVal = finding.prediction ? finding.prediction.toUpperCase().replace('_', ' ') : "N/A";
      const confVal = finding.confidence !== null && finding.confidence !== undefined ? `${finding.confidence}%` : "N/A";
      doc.text(`Prediction Label: ${predVal}  |  Model Confidence: ${confVal}`, 70, currentY + 24);
      currentY += 40;

      doc.fontSize(9).font("Helvetica-Bold").fillColor(primaryColor).text("Interpretation:", 70, currentY);
      doc.fontSize(9).font("Helvetica").fillColor(textColor).text(finding.interpretation || "No interpretation provided.", 145, currentY, { width: 390 });
      
      const interpretationLines = Math.ceil((finding.interpretation || "").length / 75);
      currentY += Math.max(interpretationLines * 11, 12) + 15;
      
      if (currentY > 700) { doc.addPage(); currentY = 50; }
    });

    if (currentY > 700) { doc.addPage(); currentY = 50; }

    // Overall assessment
    doc.fontSize(10).font("Helvetica-Bold").fillColor(accentColor).text("OVERALL ASSESSMENT", 50, currentY);
    currentY += 15;
    doc.fontSize(9).font("Helvetica").fillColor(textColor).text(report.medicalReport.overallAssessment || "N/A", 50, currentY, { width: 495, align: "justify" });
    const assessmentLines = Math.ceil((report.medicalReport.overallAssessment || "").length / 90);
    currentY += assessmentLines * 12 + 15;

    if (currentY > 700) { doc.addPage(); currentY = 50; }

    // Recommendations
    doc.fontSize(10).font("Helvetica-Bold").fillColor(accentColor).text("RECOMMENDATIONS", 50, currentY);
    currentY += 15;
    (report.medicalReport.recommendations || []).forEach((rec) => {
      doc.fontSize(9).font("Helvetica").fillColor(textColor).text(`• ${rec}`, 60, currentY, { width: 475 });
      const recLines = Math.ceil(rec.length / 85);
      currentY += recLines * 12 + 5;
      if (currentY > 700) { doc.addPage(); currentY = 50; }
    });
    currentY += 10;

    if (currentY > 700) { doc.addPage(); currentY = 50; }

    // Limitations
    doc.fontSize(10).font("Helvetica-Bold").fillColor(accentColor).text("AI LIMITATIONS", 50, currentY);
    currentY += 15;
    (report.medicalReport.limitations || []).forEach((lim) => {
      doc.fontSize(9).font("Helvetica").fillColor(textColor).text(`• ${lim}`, 60, currentY, { width: 475 });
      const limLines = Math.ceil(lim.length / 85);
      currentY += limLines * 12 + 5;
      if (currentY > 700) { doc.addPage(); currentY = 50; }
    });
    currentY += 10;
  } else {
    // LLM failed / unavailable
    doc.moveTo(50, currentY).lineTo(545, currentY).strokeColor(borderLight).lineWidth(1).stroke();
    currentY += 15;
    doc.fontSize(11).font("Helvetica-Bold").fillColor(primaryColor).text("2. AI MEDICAL REPORT STATUS", 50, currentY);
    currentY += 18;
    
    let errorStatusMsg = "Medical report generation failed or timed out.";
    if (report.reportStatus === "failed_validation") {
      errorStatusMsg = "Medical report failed safety validation checks.";
    }
    
    doc.fontSize(9).font("Helvetica-Bold").fillColor("#dc2626").text(errorStatusMsg, 50, currentY);
    doc.font("Helvetica").fillColor(textColor).text("Note: Raw AI model inference results are verified and remain accessible.", 50, currentY + 14);
    currentY += 45;
  }

  if (currentY > 700) { doc.addPage(); currentY = 50; }

  // 5. Disclaimer Box
  doc.rect(50, currentY, 495, 45).fill("#fef2f2").strokeColor("#fca5a5").lineWidth(1).stroke();
  doc.fillColor("#b91c1c").font("Helvetica-Bold").fontSize(8).text("IMPORTANT CLINICAL NOTICE & DISCLAIMER", 60, currentY + 8);
  
  const disclaimerText = "This report is generated using artificial intelligence and is intended to assist qualified healthcare professionals. It does not constitute a definitive medical diagnosis and should not replace professional clinical evaluation.";
  doc.fillColor("#991b1b").font("Helvetica").fontSize(7.5).text(disclaimerText, 60, currentY + 18, { width: 475 });

  // 6. Footer (Page numbers — bufferPages:true required for switchToPage to work)
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(pages.start + i);
    doc.fillColor("#94a3b8").fontSize(7.5).font("Helvetica").text(
      `Jeevansh AI - Confidential Medical Report  |  Page ${i + 1} of ${pages.count}`,
      50,
      800,
      { align: "center", width: 495 }
    );
  }

  doc.flushPages();
  doc.end();
}

module.exports = { generateReportPdf };
