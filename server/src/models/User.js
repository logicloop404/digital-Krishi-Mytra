import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  phone: { type: String, trim: true },
  role: { type: String, enum: ['farmer', 'admin'], default: 'farmer' },
  region: { type: String, trim: true },
  landArea: { type: Number, min: 0, default: 0 },
  soilType: { type: String, trim: true },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GovernmentScheme' }],
}, { timestamps: true });
userSchema.pre('save', async function hashPassword(next) { if (!this.isModified('password')) return next(); this.password = await bcrypt.hash(this.password, 12); next(); });
userSchema.methods.comparePassword = function comparePassword(candidate) { return bcrypt.compare(candidate, this.password); };
export default mongoose.model('User', userSchema);
