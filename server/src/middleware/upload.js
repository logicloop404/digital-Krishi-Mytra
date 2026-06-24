import multer from 'multer';
import AppError from '../utils/AppError.js';
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, callback) => callback(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) });
export const singleLeafImage = (req, res, next) => upload.single('image')(req, res, (error) => { if (error) return next(new AppError(error.message, 400)); if (!req.file) return next(new AppError('A JPG, PNG, or WEBP image is required', 400)); next(); });
