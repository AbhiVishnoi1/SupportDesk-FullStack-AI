const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, default: "Anonymous", trim: true },
    email: { type: String, required: true, trim: true },
    rating: { type: Number, default: 5 },
    ticketId: { type: String, default: "" },
    message: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

feedbackSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);
