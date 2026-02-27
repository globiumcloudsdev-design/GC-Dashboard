import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    // Both User._id and Agent._id values can appear here.
    // We store them as plain ObjectIds (no refPath) because they can come
    // from two different collections.  The read-status API resolves names
    // by querying both User and Agent collections.
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    deletedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    type: {
      type: String,
      enum: ["info", "warning", "success", "error", "announcement"],
      default: "info",
    },
    targetType: {
      type: String,
      enum: ["all", "user", "agent", "specific"],
      required: true,
    },
    targetUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "targetModel",
      },
    ],
    targetModel: {
      type: String,
      enum: ["User", "Agent"],
      required: function () {
        return this.targetType === "specific";
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Admin user who created it
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);