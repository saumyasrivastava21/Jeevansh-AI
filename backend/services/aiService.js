const fs = require("fs");
const path = require("path");

/**
 * Forwards an uploaded local image file to the FastAPI microservice for AI prediction.
 * @param {string} filePath - Absolute path to the saved local image file.
 * @param {string} diseaseType - Disease identifier (e.g., 'skin-cancer', 'pneumonia').
 * @returns {Promise<object>} Prediction response from the FastAPI service.
 */
async function predictDisease(filePath, diseaseType) {
  const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
  
  // Read file into buffer and wrap in a native Blob
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: "image/jpeg" });
  
  // Package as multipart form data
  const formData = new FormData();
  formData.append("image", blob, path.basename(filePath));
  
  const endpoint = `${aiServiceUrl}/predict/${diseaseType}?explain=false`;
  
  console.log(`[AI-Service Client] Routing image to FastAPI endpoint: ${endpoint}`);
  
  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[AI-Service Client] FastAPI error response: ${errorText}`);
    throw new Error(`Inference service request failed with status ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Calls FastAPI to generate the explainability Grad-CAM heatmap.
 * @param {string} filePath - Absolute path to the saved local image file.
 * @param {string} diseaseType - Disease identifier.
 * @returns {Promise<object>} Heatmap response from the FastAPI service.
 */
async function getGradcamHeatmap(filePath, diseaseType) {
  const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
  
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer], { type: "image/jpeg" });
  
  const formData = new FormData();
  formData.append("image", blob, path.basename(filePath));
  
  const endpoint = `${aiServiceUrl}/explain/${diseaseType}`;
  
  console.log(`[AI-Service Client] Routing explainability to FastAPI endpoint: ${endpoint}`);
  
  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[AI-Service Client] FastAPI explain error response: ${errorText}`);
    throw new Error(`Explainability service request failed with status ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Calls FastAPI Agentic AI report generation endpoint.
 * @param {Array} predictions - Verified prediction metadata.
 * @param {object} patientContext - Patient metadata (name, age, gender).
 * @returns {Promise<object>} Generated report response from the FastAPI service.
 */
async function generateMedicalReport(predictions, patientContext) {
  const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
  const endpoint = `${aiServiceUrl}/api/v1/reports/generate`;

  console.log(`[AI-Service Client] Routing report request to FastAPI endpoint: ${endpoint}`);

  const payload = {
    patient_context: patientContext,
    predictions: predictions
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[AI-Service Client] FastAPI report generator error response: ${errorText}`);
    throw new Error(`Report generation service failed with status ${response.status}`);
  }

  return await response.json();
}

module.exports = { predictDisease, generateMedicalReport, getGradcamHeatmap };
