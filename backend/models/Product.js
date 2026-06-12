const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, default: "Brand", trim: true },
    available: { type: String, default: 'Yes' },
    testing: { type: String, default: 'Unit tests + UI flow' },
  },
  { timestamps: true }
);

productSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);
