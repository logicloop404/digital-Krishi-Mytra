import mongoose from 'mongoose';
const schemeSchema = new mongoose.Schema({ title: { type: String, required: true, unique: true }, category: String, benefit: String, description: String, eligibility: [String], tags: [String], applicationUrl: String, active: { type: Boolean, default: true } }, { timestamps: true });
export default mongoose.model('GovernmentScheme', schemeSchema);
