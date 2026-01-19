import mongoose from "mongoose";

const attachmentSchema = new mongoose.Schema(
  {
    url: String,
    publicId: String,
    filename: String,
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    excerpt: { type: String, trim: true, maxlength: 300 },
    content: { type: String, required: true },
    featuredImage: { type: String },
    category: { type: String, default: 'General' },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    publishedAt: { type: Date },
    viewCount: { type: Number, default: 0 },
    readingTime: { type: Number, default: 5 },
    attachments: [attachmentSchema],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Blog || mongoose.model("Blog", blogSchema);
