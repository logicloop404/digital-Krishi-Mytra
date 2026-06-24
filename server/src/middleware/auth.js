import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, _res, next) => { const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null; if (!token) throw new AppError('Authentication required', 401); const decoded = jwt.verify(token, process.env.JWT_SECRET); const user = await User.findById(decoded.id); if (!user) throw new AppError('User no longer exists', 401); req.user = user; next(); });
export const authorize = (...roles) => (req, _res, next) => roles.includes(req.user.role) ? next() : next(new AppError('You do not have permission for this action', 403));
