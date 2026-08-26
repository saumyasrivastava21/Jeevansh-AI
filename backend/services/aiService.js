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
  
  const endpoint = `${aiServiceUrl}/predict/${diseaseType}`;
  
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

module.exports = { predictDisease };
