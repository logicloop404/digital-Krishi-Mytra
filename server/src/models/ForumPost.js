import mongoose from 'mongoose';
const forumPostSchema = new mongoose.Schema({ author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, title: { type: String, required: true, maxlength: 180 }, body: { type: String, required: true, maxlength: 5000 }, category: { type: String, required: true }, upvotes: { type: Number, default: 0 }, upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], isModerated: { type: Boolean, default: false } }, { timestamps: true });
export default mongoose.model('ForumPost', forumPostSchema);
