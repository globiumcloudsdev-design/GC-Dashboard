import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Blog from "@/Models/Blog";
import { verifyToken } from "@/lib/jwt";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";
    const tag = searchParams.get("tag");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const filter = { isActive: true };
    if (q) filter.$or = [ { title: { $regex: q, $options: "i" } }, { content: { $regex: q, $options: "i" } } ];
    if (tag) filter.tags = tag;

    const total = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .populate("author", "firstName lastName email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return NextResponse.json({ success: true, data: { blogs, total, page, limit } });
  } catch (error) {
    console.error("GET /api/blogs error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const body = await request.json();
    const { title, slug, excerpt, content, category, status, featuredImage, readingTime, publishedAt, attachments = [] } = body;
    if (!title || !slug || !content) {
      return NextResponse.json({ success: false, message: "Title, slug and content are required" }, { status: 400 });
    }

    const existing = await Blog.findOne({ slug });
    if (existing) return NextResponse.json({ success: false, message: "Slug already exists" }, { status: 400 });

    const blog = await Blog.create({ 
      title, 
      slug, 
      excerpt,
      content, 
      category,
      status,
      featuredImage,
      readingTime,
      publishedAt,
      attachments, 
      createdBy: decoded.userId, 
      author: decoded.userId 
    });

    return NextResponse.json({ success: true, data: blog }, { status: 201 });
  } catch (error) {
    console.error("POST /api/blogs error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
