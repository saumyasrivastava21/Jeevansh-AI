const Disease = require("../models/DiseaseModel");
const { ApiResponse, ApiError } = require("../utils/apiResponse");

const getDiseases = async (req, res, next) => {
  try {
    const diseases = await Disease.find({});
    res.json(new ApiResponse(200, diseases, "Diseases fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const getDiseaseById = async (req, res, next) => {
  try {
    const disease = await Disease.findById(req.params.id);
    if (disease) {
      res.json(new ApiResponse(200, disease, "Disease fetched successfully"));
    } else {
      next(new ApiError(404, "Disease not found"));
    }
  } catch (error) {
    next(error);
  }
};

module.exports = { getDiseases, getDiseaseById };
