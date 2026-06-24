import Crop from '../models/Crop.js';
import Recommendation from '../models/Recommendation.js';
import asyncHandler from '../utils/asyncHandler.js';
export const getDashboard = asyncHandler(async (req, res) => { const [activeCrops, recommendations] = await Promise.all([Crop.countDocuments({ farmer: req.user._id, status: { $in: ['sown', 'growing'] } }), Recommendation.countDocuments({ farmer: req.user._id })]); res.json({ success: true, data: { stats: { activeCrops, healthScore: 82, recommendationCount: recommendations }, weather: { temperature: 29, condition: 'Partly cloudy', rainfall: 18 }, activities: [{ title: 'Dashboard viewed', createdAt: new Date() }] } }); });
