const mongoose = require("mongoose");
const Report = require("../models/ReportModel");

async function checkReports() {
  const mongoUri = "mongodb://localhost:27017/jeevansh";
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  const reports = await Report.find({}).sort({ createdAt: -1 });
  console.log(`Total reports in DB: ${reports.length}`);
  console.log("=========================================");
  for (const r of reports) {
    console.log(`- ID: ${r._id} | Disease: ${r.disease} | hasFinding: ${r.hasFinding} | prediction: ${r.prediction} | confidence: ${r.confidence}% | reportStatus: ${r.reportStatus} | error: ${r.reportError || "None"}`);
  }
  await mongoose.disconnect();
}

checkReports().catch(console.error);
