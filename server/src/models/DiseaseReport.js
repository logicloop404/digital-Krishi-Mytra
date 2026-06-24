import mongoose from 'mongoose';
const diseaseReportSchema = new mongoose.Schema({ farmer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, imageUrl: String, crop: String, disease: String, confidence: Number, prevention: [String], treatment: [String] }, { timestamps: true });
export default mongoose.model('DiseaseReport', diseaseReportSchema);
