import mongoose from 'mongoose';
const commentSchema = new mongoose.Schema({ post: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumPost', required: true }, author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, body: { type: String, required: true, maxlength: 2000 } }, { timestamps: true });
export default mongoose.model('Comment', commentSchema);
