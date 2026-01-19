import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Blog from "@/Models/Blog";
import { verifyToken } from "@/lib/jwt";

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });

    const blog = await Blog.findById(id).populate("author", "firstName lastName email");
    if (!blog) return NextResponse.json({ success: false, message: "Blog not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    console.error("GET /api/blogs/[id] error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const body = await request.json();
    const { id, title, slug, excerpt, content, category, status, featuredImage, readingTime, publishedAt, attachments = [] } = body;
    if (!id) return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });

    const updateData = {
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
      updatedBy: decoded.userId
    };

    const blog = await Blog.findByIdAndUpdate(id, updateData, { new: true });

    if (!blog) return NextResponse.json({ success: false, message: "Blog not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    console.error("PUT /api/blogs/[id] error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 });
    const decoded = verifyToken(token);
    if (!decoded) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, message: "ID is required" }, { status: 400 });

    await Blog.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: "Blog deleted" });
  } catch (error) {
    console.error("DELETE /api/blogs/[id] error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
