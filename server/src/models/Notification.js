import mongoose from 'mongoose';
const notificationSchema = new mongoose.Schema({ recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, title: String, body: String, type: { type: String, default: 'info' }, read: { type: Boolean, default: false }, link: String }, { timestamps: true });
export default mongoose.model('Notification', notificationSchema);
