import Recommendation from '../models/Recommendation.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
const catalog = [{ crop: 'Soybean', soils: ['Black soil', 'Alluvial soil'], seasons: ['Kharif'], water: ['Moderate', 'High'], yield: '1.8-2.2 t/ha', profit: '₹48,000', risk: 'Low', color: '#2f8b57' }, { crop: 'Tur (Pigeon pea)', soils: ['Black soil', 'Red soil'], seasons: ['Kharif'], water: ['Low', 'Moderate'], yield: '1.2-1.6 t/ha', profit: '₹54,000', risk: 'Medium', color: '#d86634' }, { crop: 'Cotton', soils: ['Black soil', 'Alluvial soil'], seasons: ['Kharif'], water: ['Moderate', 'High'], yield: '1.6-2.0 t/ha', profit: '₹62,000', risk: 'Medium', color: '#387a95' }, { crop: 'Chickpea', soils: ['Black soil', 'Alluvial soil'], seasons: ['Rabi'], water: ['Low', 'Moderate'], yield: '1.4-1.8 t/ha', profit: '₹45,000', risk: 'Low', color: '#b27838' }];

export const createRecommendation = asyncHandler(async (req, res) => {
  const { soilType, season, waterAvailability } = req.body;
  const crops = catalog.map((item) => {
    const score = 55 + (item.soils.includes(soilType) ? 20 : 0) + (item.seasons.includes(season) ? 15 : 0) + (item.water.includes(waterAvailability) ? 10 : 0);
    return { crop: item.crop, suitability: Math.min(score, 96), yield: item.yield, profit: item.profit, risk: item.risk, color: item.color };
  }).sort((a, b) => b.suitability - a.suitability).slice(0, 3);
  const recommendation = await Recommendation.create({ farmer: req.user._id, inputs: req.body, crops });
  res.status(201).json({ success: true, data: { recommendation, recommendations: crops } });
});

export const getRecommendations = asyncHandler(async (req, res) => {
  const recommendations = await Recommendation.find({ farmer: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: { recommendations } });
});

export const saveRecommendation = asyncHandler(async (req, res) => {
  const recommendation = await Recommendation.findOne({ _id: req.params.id, farmer: req.user._id });
  if (!recommendation) throw new AppError('Recommendation not found', 404);
  recommendation.saved = !recommendation.saved;
  await recommendation.save();
  res.json({ success: true, data: { recommendation } });
});
