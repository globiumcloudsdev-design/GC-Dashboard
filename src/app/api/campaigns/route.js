import { NextResponse } from "next/server";
import Campaign from "@/Models/Campaign";
import Newsletter from "@/Models/Newsletter";
import connectDB from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";
import { sendEmail } from "@/lib/email";

/**
 * GET - Fetch all campaigns
 */
export async function GET(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    const campaigns = await Campaign.find()
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: campaigns,
    });
  } catch (err) {
    console.error("GET /api/campaigns error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * POST - Create a new campaign
 */
export async function POST(req) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    const { title, subject, content, scheduledAt } = await req.json();

    if (!title || !subject || !content) {
      return NextResponse.json(
        { success: false, error: "Title, subject, and content are required" },
        { status: 400 }
      );
    }

    // Count active subscribers
    const subscriberCount = await Newsletter.countDocuments({ status: "active" });

    const campaign = await Campaign.create({
      title,
      subject,
      content,
      createdBy: decoded.userId,
      scheduledAt: scheduledAt || null,
      status: scheduledAt ? "scheduled" : "draft",
      recipients: {
        total: subscriberCount,
        sent: 0,
        failed: 0,
      },
    });

    const populatedCampaign = await Campaign.findById(campaign._id).populate(
      "createdBy",
      "firstName lastName email"
    );

    return NextResponse.json({
      success: true,
      data: populatedCampaign,
    });
  } catch (err) {
    console.error("POST /api/campaigns error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
