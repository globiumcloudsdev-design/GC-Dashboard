import { NextResponse } from 'next/server';
import { cloudinaryService } from '@/lib/cloudinary';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    // Determine folder based on type if needed, default to 'agent-documents'
    const folder = formData.get('folder') || 'agent-documents';

    const result = await cloudinaryService.uploadImage(file, folder);
    
    return NextResponse.json({ 
      success: true, 
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        resource_type: result.resource_type
      } 
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, message: 'Upload failed' }, { status: 500 });
  }
}
