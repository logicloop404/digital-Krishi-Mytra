import Crop from '../models/Crop.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getCrops = asyncHandler(async (req, res) => {
  const crops = await Crop.find({ farmer: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: { crops } });
});

export const createCrop = asyncHandler(async (req, res) => {
  const crop = await Crop.create({
    ...req.body,
    farmer: req.user._id,
  });
  res.status(201).json({ success: true, data: { crop } });
});

export const updateCrop = asyncHandler(async (req, res) => {
  const crop = await Crop.findOneAndUpdate(
    { _id: req.params.id, farmer: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!crop) throw new AppError('Crop not found', 404);
  res.json({ success: true, data: { crop } });
});

export const deleteCrop = asyncHandler(async (req, res) => {
  const crop = await Crop.findOneAndDelete({ _id: req.params.id, farmer: req.user._id });
  if (!crop) throw new AppError('Crop not found', 404);
  res.json({ success: true, message: 'Crop deleted successfully' });
});
