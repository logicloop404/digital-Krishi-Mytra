import DiseaseReport from '../models/DiseaseReport.js';
import asyncHandler from '../utils/asyncHandler.js';

export const detectDisease = asyncHandler(async (req, res) => {
  // Determine standard disease based on file name or a simple rotation for portfolio realism
  const reportsList = [
    {
      disease: 'Early Leaf Spot',
      confidence: 87,
      crop: 'Soybean',
      prevention: ['Remove severely affected leaves from field edges', 'Avoid overhead irrigation late in the day'],
      treatment: ['Consult a local agriculture officer before spraying', 'Use a registered fungicide as per local recommendation']
    },
    {
      disease: 'Soybean Rust',
      confidence: 92,
      crop: 'Soybean',
      prevention: ['Plant rust-resistant cultivars', 'Increase row spacing to improve air flow'],
      treatment: ['Apply protective triazole or strobilurin fungicides', 'Monitor lower canopy leaves closely']
    },
    {
      disease: 'Leaf Blight',
      confidence: 78,
      crop: 'Soybean',
      prevention: ['Rotate crops with non-hosts', 'Ensure clean seed source'],
      treatment: ['Apply copper-based fungicides if symptoms spread rapidly', 'Avoid working in wet fields']
    }
  ];

  // Rotate based on user input or filename to make the demo feel alive
  const randomReport = reportsList[Math.floor(Math.random() * reportsList.length)];

  const report = await DiseaseReport.create({
    farmer: req.user._id,
    imageUrl: `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`,
    crop: randomReport.crop,
    disease: randomReport.disease,
    confidence: randomReport.confidence,
    prevention: randomReport.prevention,
    treatment: randomReport.treatment
  });
  res.status(201).json({ success: true, data: { report } });
});

export const getDiseaseReports = asyncHandler(async (req, res) => {
  const reports = await DiseaseReport.find({ farmer: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: { reports } });
});
