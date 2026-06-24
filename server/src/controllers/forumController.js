import ForumPost from '../models/ForumPost.js';
import Comment from '../models/Comment.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getPosts = asyncHandler(async (req, res) => {
  const posts = await ForumPost.find({ isModerated: false }).populate('author', 'name region').sort({ createdAt: -1 }).limit(30).lean();
  const ids = posts.map((post) => post._id);
  const countRows = await Comment.aggregate([{ $match: { post: { $in: ids } } }, { $group: { _id: '$post', count: { $sum: 1 } } }]);
  const counts = Object.fromEntries(countRows.map((row) => [row._id.toString(), row.count]));
  res.json({ success: true, data: { posts: posts.map((post) => ({ ...post, commentsCount: counts[post._id.toString()] || 0 })) } });
});

export const createPost = asyncHandler(async (req, res) => {
  const post = await ForumPost.create({ ...req.body, author: req.user._id });
  const populated = await post.populate('author', 'name region');
  res.status(201).json({ success: true, data: { post: populated } });
});

export const toggleUpvote = asyncHandler(async (req, res) => {
  const post = await ForumPost.findById(req.params.id);
  if (!post) throw new AppError('Discussion not found', 404);
  const index = post.upvotedBy.findIndex((id) => id.equals(req.user._id));
  if (index >= 0) {
    post.upvotedBy.splice(index, 1);
    post.upvotes -= 1;
  } else {
    post.upvotedBy.push(req.user._id);
    post.upvotes += 1;
  }
  await post.save();
  res.json({ success: true, data: { upvotes: post.upvotes } });
});

export const getPostDetails = asyncHandler(async (req, res) => {
  const post = await ForumPost.findById(req.params.id).populate('author', 'name region');
  if (!post) throw new AppError('Discussion not found', 404);
  const comments = await Comment.find({ post: post._id }).populate('author', 'name region').sort({ createdAt: 1 });
  res.json({ success: true, data: { post, comments } });
});

export const createComment = asyncHandler(async (req, res) => {
  const post = await ForumPost.findById(req.params.id);
  if (!post) throw new AppError('Discussion not found', 404);
  const comment = await Comment.create({
    post: post._id,
    author: req.user._id,
    body: req.body.body
  });
  const populated = await comment.populate('author', 'name region');
  res.status(201).json({ success: true, data: { comment: populated } });
});
