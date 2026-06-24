import mongoose from 'mongoose';
const cropSchema = new mongoose.Schema({ farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, name: { type: String, required: true }, season: String, status: { type: String, enum: ['planned', 'sown', 'growing', 'harvested'], default: 'planned' }, area: { type: Number, min: 0 }, healthScore: { type: Number, min: 0, max: 100, default: 75 } }, { timestamps: true });
export default mongoose.model('Crop', cropSchema);
