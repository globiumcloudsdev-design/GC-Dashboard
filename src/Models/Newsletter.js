import mongoose from "mongoose";

export const NewsletterStatus = {
  ACTIVE: "active",
  UNSUBSCRIBED: "unsubscribed",
  BOUNCED: "bounced",
};

const NewsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: Object.values(NewsletterStatus),
      default: NewsletterStatus.ACTIVE,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
    },
    source: {
      type: String,
      default: "website_footer",
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient email lookups
NewsletterSchema.index({ email: 1 });
NewsletterSchema.index({ status: 1 });

const Newsletter =
  mongoose.models.Newsletter ||
  mongoose.model("Newsletter", NewsletterSchema);

export default Newsletter;
