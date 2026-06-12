const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
    product: { type: String, required: true, trim: true },
    productImage: { type: String, default: "" },
    productName: { type: String, required: true, trim: true },
    modelNumber: { type: String, required: true, trim: true },
    purchaseDate: { type: String, default: "" },
    warrantyStatus: { type: String, enum: ["Active", "Expired"], default: "Active" },
    issueTitle: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Open", "In Progress", "Resolved"], default: "Open" },
    priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
    customerEmail: { type: String, default: "guest@supportdesk.local", trim: true },
  },
  { timestamps: true }
);

ticketSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.models.Ticket || mongoose.model("Ticket", ticketSchema);
