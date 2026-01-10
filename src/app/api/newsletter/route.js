import { NextResponse } from "next/server";
import Newsletter from '@/Models/Newsletter';
import connectDB from "@/lib/mongodb";
import { sendEmail, emailTemplates } from "@/lib/email";

/**
 * ✅ CORS Headers — used for every response
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Allow all origins (for testing or public API)
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * ✅ Handle Preflight (OPTIONS) Request
 */
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

/**
 * ✅ POST — Subscribe to newsletter
 */
export async function POST(req) {
  try {
    await connectDB();

    const { email } = await req.json();

    // Validate email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: "Valid email is required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ email: email.toLowerCase() });

    if (existingSubscriber) {
      if (existingSubscriber.status === 'active') {
        return NextResponse.json(
          { success: false, error: "Email already subscribed" },
          { status: 409, headers: corsHeaders }
        );
      } else {
        // Reactivate subscription
        existingSubscriber.status = 'active';
        existingSubscriber.subscribedAt = new Date();
        existingSubscriber.unsubscribedAt = undefined;
        await existingSubscriber.save();
      }
    } else {
      // Create new subscriber
      await Newsletter.create({
        email: email.toLowerCase(),
        status: 'active',
        source: 'website_footer',
      });
    }

    // Send confirmation email
    try {
      const confirmationTemplate = emailTemplates.newsletterConfirmation(email);
      await sendEmail({
        to: email,
        subject: confirmationTemplate.subject,
        html: confirmationTemplate.html,
        text: confirmationTemplate.text,
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the subscription if email fails
    }

    return NextResponse.json(
      { success: true, message: "Successfully subscribed to newsletter" },
      { status: 201, headers: corsHeaders }
    );
  } catch (err) {
    console.error("POST /api/newsletter error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * ✅ GET — Fetch newsletter subscribers (admin only)
 */
export async function GET() {
  try {
    await connectDB();

    const subscribers = await Newsletter.find()
      .sort({ subscribedAt: -1 })
      .select('email status subscribedAt source');

    return NextResponse.json(
      { success: true, count: subscribers.length, data: subscribers },
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error("GET /api/newsletter error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch subscribers" },
      { status: 500, headers: corsHeaders }
    );
  }
}
