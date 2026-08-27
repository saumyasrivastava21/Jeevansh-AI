const Report = require("../models/ReportModel");
const { generateMedicalReport } = require("./aiService");

/**
 * Generates the medical report asynchronously in the background and persists it to MongoDB.
 * @param {string} reportId - The MongoDB document ID of the report.
 */
async function generateAndPersistReport(reportId) {
  console.log(`[Background Report Service] Starting report generation for ID: ${reportId}`);
  try {
    const report = await Report.findById(reportId);
    if (!report) {
      console.error(`[Background Report Service] Report not found: ${reportId}`);
      return;
    }

    // Map stored database fields back to the FastAPI report generator payload
    const predictionsPayload = [
      {
        diseaseId: report.diseaseId,
        diseaseName: report.diseaseName,
        taskType: report.taskType,
        hasFinding: report.hasFinding,
        prediction: report.prediction,
        confidence: report.confidence ? report.confidence / 100 : null,
        probabilities: report.probabilities,
        detections: (report.detections || []).map(d => ({
          label: d.label,
          confidence: d.confidence / 100,
          percentage: d.percentage,
          bbox: d.bbox
        })),
        modelArchitecture: report.taskType === "classification" ? "MobileNetV3-Large" : "YOLO11",
        modelName: report.aiModel,
        modelVersion: report.aiModelVersion,
        heatmapImage: report.heatmapImage
      }
    ];

    const patientContext = {
      name: report.patientName,
      age: null,
      gender: null
    };

    console.log(`[Background Report Service] Querying LLM for ID: ${reportId}`);
    const llmResponse = await generateMedicalReport(predictionsPayload, patientContext);

    if (llmResponse.success) {
      report.medicalReport = llmResponse.report;
      report.reportModel = llmResponse.reportModel;
      report.reportStatus = "completed";
      report.reportVersion = llmResponse.report.reportVersion || "1.0.0";
      report.reportGeneratedAt = new Date(llmResponse.generatedAt);
      report.reportError = null;
      console.log(`[Background Report Service] Generation succeeded and passed safety validation for ID: ${reportId}`);
    } else {
      console.error(`[Background Report Service] Report generation returned failure for ID: ${reportId}: ${llmResponse.message}`);
      report.reportStatus = llmResponse.validationPassed === false ? "failed_validation" : "failed";
      report.reportError = llmResponse.message || "Unknown LLM error";
    }

    await report.save();
    console.log(`[Background Report Service] Saved updated report document for ID: ${reportId} with status: ${report.reportStatus}`);
  } catch (err) {
    console.error(`[Background Report Service] Error generating report for ID: ${reportId}: ${err.message}`);
    try {
      const report = await Report.findById(reportId);
      if (report) {
        if (err.message.includes("422")) {
          report.reportStatus = "failed_validation";
        } else {
          report.reportStatus = "failed";
        }
        report.reportError = err.message;
        await report.save();
        console.log(`[Background Report Service] Saved error status for ID: ${reportId} as: ${report.reportStatus}`);
      }
    } catch (saveErr) {
      console.error(`[Background Report Service] Failed to save error status for ID: ${reportId}: ${saveErr.message}`);
    }
  }
}

module.exports = { generateAndPersistReport };
