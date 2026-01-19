import { NextResponse } from "next/server";
import Campaign from "@/Models/Campaign";
import Newsletter from "@/Models/Newsletter";
import connectDB from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";
import { sendEmail, emailTemplates } from "@/lib/email";

/**
 * POST - Send campaign to all active subscribers
 */
export async function POST(req, { params }) {
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

    // Check if already sent
    if (campaign.status === "sent") {
      return NextResponse.json(
        { success: false, error: "Campaign already sent" },
        { status: 400 }
      );
    }

    // Update status to sending
    campaign.status = "sending";
    await campaign.save();

    // Get all active subscribers
    const subscribers = await Newsletter.find({ status: "active" });

    let sentCount = 0;
    let failedCount = 0;

    // Send to each subscriber
    for (const subscriber of subscribers) {
      try {
        const emailTemplate = emailTemplates.campaignEmail(
          campaign.subject,
          campaign.content,
          subscriber.email,
          campaign.title
        );
        
        await sendEmail({
          to: subscriber.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text
        });
        sentCount++;
      } catch (error) {
        console.error(`Failed to send to ${subscriber.email}:`, error);
        failedCount++;
      }
    }

    // Update campaign with results
    campaign.status = "sent";
    campaign.sentAt = new Date();
    campaign.recipients.sent = sentCount;
    campaign.recipients.failed = failedCount;
    await campaign.save();

    return NextResponse.json({
      success: true,
      data: {
        sent: sentCount,
        failed: failedCount,
        total: subscribers.length,
      },
    });
  } catch (err) {
    console.error("POST /api/campaigns/[id]/send error:", err);
    
    // Update campaign status to failed
    try {
      await Campaign.findByIdAndUpdate(id, { status: "failed" });
    } catch (updateErr) {
      console.error("Failed to update campaign status:", updateErr);
    }

    return NextResponse.json(
      { success: false, error: "Failed to send campaign" },
      { status: 500 }
    );
  }
}
