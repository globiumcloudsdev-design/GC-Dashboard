import mongoose from "mongoose";

export const CampaignStatus = {
  DRAFT: "draft",
  SCHEDULED: "scheduled",
  SENDING: "sending",
  SENT: "sent",
  FAILED: "failed",
};

const CampaignSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(CampaignStatus),
      default: CampaignStatus.DRAFT,
    },
    scheduledAt: {
      type: Date,
    },
    sentAt: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipients: {
      total: { type: Number, default: 0 },
      sent: { type: Number, default: 0 },
      failed: { type: Number, default: 0 },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CampaignSchema.index({ status: 1 });
CampaignSchema.index({ createdBy: 1 });
CampaignSchema.index({ scheduledAt: 1 });

const Campaign =
  mongoose.models.Campaign ||
  mongoose.model("Campaign", CampaignSchema);

export default Campaign;
