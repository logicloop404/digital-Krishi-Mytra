import mongoose from 'mongoose';
const recommendationSchema = new mongoose.Schema({ farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, inputs: { soilType: String, landArea: Number, waterAvailability: String, season: String, region: String }, crops: [{ crop: String, suitability: Number, yield: String, profit: String, risk: String }], saved: { type: Boolean, default: false } }, { timestamps: true });
export default mongoose.model('Recommendation', recommendationSchema);
