import GovernmentScheme from '../models/GovernmentScheme.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getSchemes = asyncHandler(async (req, res) => {
  const { search = '', page = 1, limit = 12 } = req.query;
  const query = {
    active: true,
    ...(search && {
      $or: ['title', 'category', 'description'].map((field) => ({
        [field]: { $regex: search, $options: 'i' }
      }))
    })
  };
  const [schemes, total] = await Promise.all([
    GovernmentScheme.find(query).skip((page - 1) * limit).limit(Number(limit)).sort({ createdAt: -1 }),
    GovernmentScheme.countDocuments(query)
  ]);
  res.json({
    success: true,
    data: {
      schemes,
      pagination: {
        page: Number(page),
        total,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

export const toggleBookmark = asyncHandler(async (req, res) => {
  const scheme = await GovernmentScheme.findById(req.params.id);
  if (!scheme) throw new AppError('Scheme not found', 404);

  const user = await User.findById(req.user._id);
  if (!user.bookmarks) {
    user.bookmarks = [];
  }
  const index = user.bookmarks.indexOf(scheme._id);
  if (index >= 0) {
    user.bookmarks.splice(index, 1);
  } else {
    user.bookmarks.push(scheme._id);
  }
  await user.save();
  res.json({ success: true, data: { bookmarks: user.bookmarks } });
});

export const getBookmarkedSchemes = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('bookmarks');
  res.json({ success: true, data: { schemes: user.bookmarks || [] } });
});
