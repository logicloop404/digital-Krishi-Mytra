import User from '../models/User.js';
import GovernmentScheme from '../models/GovernmentScheme.js';
import ForumPost from '../models/ForumPost.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getAnalytics = asyncHandler(async (_req, res) => {
  const [users, schemes, moderatedPosts] = await Promise.all([
    User.countDocuments(),
    GovernmentScheme.countDocuments({ active: true }),
    ForumPost.countDocuments({ isModerated: true }),
  ]);
  res.json({ success: true, data: { users, schemes, moderatedPosts } });
});

export const listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 20, 100);
  const [users, total] = await Promise.all([
    User.find().select('name email role region createdAt').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(),
  ]);
  res.json({ success: true, data: { users, pagination: { page, total, pages: Math.ceil(total / limit) } } });
});
