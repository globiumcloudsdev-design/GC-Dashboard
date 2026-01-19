import { NextResponse } from "next/server";
import Campaign from "@/Models/Campaign";
import connectDB from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";

/**
 * GET - Fetch single campaign
 */
export async function GET(req, { params }) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    const { id } = await params;
    const campaign = await Campaign.findById(id).populate(
      "createdBy",
      "firstName lastName email"
    );

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: campaign,
    });
  } catch (err) {
    console.error("GET /api/campaigns/[id] error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update campaign
 */
export async function PUT(req, { params }) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    const { title, subject, content, scheduledAt, status } = await req.json();

    const { id } = await params;
    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Don't allow editing sent campaigns
    if (campaign.status === "sent") {
      return NextResponse.json(
        { success: false, error: "Cannot edit sent campaigns" },
        { status: 400 }
      );
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (subject) updateData.subject = subject;
    if (content) updateData.content = content;
    if (scheduledAt) updateData.scheduledAt = scheduledAt;
    if (status) updateData.status = status;

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("createdBy", "firstName lastName email");

    return NextResponse.json({
      success: true,
      data: updatedCampaign,
    });
  } catch (err) {
    console.error("PUT /api/campaigns/[id] error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete campaign
 */
export async function DELETE(req, { params }) {
  try {
    await connectDB();

    const token = req.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });

    const { id } = await params;
    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: "Campaign not found" },
        { status: 404 }
      );
    }

    await Campaign.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Campaign deleted successfully",
    });
  } catch (err) {
    console.error("DELETE /api/campaigns/[id] error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
