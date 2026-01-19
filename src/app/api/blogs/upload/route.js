import { NextResponse } from "next/server";
import { cloudinaryService } from "@/lib/cloudinary";

export async function POST(request) {
  try {
    const body = await request.json();
    const files = body.files || [];
    if (!files.length) return NextResponse.json({ success: false, message: "No files provided" }, { status: 400 });

    const results = [];
    for (const f of files) {
      // expect { name, data } where data is base64 string (data: 'data:image/png;base64,...')
      const base64 = f.data.split(",")[1];
      const buffer = Buffer.from(base64, "base64");
      const res = await cloudinaryService.uploadImage(buffer, "blogs");
      results.push({ url: res.secure_url, publicId: res.public_id, filename: f.name });
    }

    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    console.error("POST /api/blogs/upload error:", error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
