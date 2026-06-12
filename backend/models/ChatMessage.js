const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema(
  {
    userMessage: { type: String, required: true, trim: true },
    botReply: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

chatMessageSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.models.ChatMessage || mongoose.model('ChatMessage', chatMessageSchema);
