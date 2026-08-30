const mongoose = require("mongoose");
const Report = require("../models/ReportModel");

async function checkReport() {
  const mongoUri = "mongodb://localhost:27017/jeevansh";
  await mongoose.connect(mongoUri);
  console.log("Connected to MongoDB");

  const reports = await Report.find({ _id: "6a8fc2bb92ca2b55916b5b3d" });
  if (reports.length === 0) {
    console.log("No reports found in DB");
  } else {
    const r = reports[0];
    console.log("Latest Report details:");
    console.log("----------------------");
    console.log("ID:", r._id);
    console.log("Disease Name:", r.diseaseName);
    console.log("hasFinding:", r.hasFinding);
    console.log("prediction:", r.prediction);
    console.log("confidence:", r.confidence);
    console.log("reportStatus:", r.reportStatus);
    console.log("reportError:", r.reportError);
    console.log("reportModel:", r.reportModel);
    console.log("medicalReport:", JSON.stringify(r.medicalReport, null, 2));
  }
  await mongoose.disconnect();
}

checkReport().catch(console.error);
