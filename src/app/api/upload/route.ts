import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (request.body === null) {
      return NextResponse.json({ error: "No body" }, { status: 400 });
  }

  // Expecting the file in the body directly or via formData. 
  // But Vercel Blob examples often use the file body directly or formData.
  // The client sends formData.
  
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const blob = await put(file.name, file, {
    access: 'public',
  });

  return NextResponse.json({
      success: true,
      filepath: blob.url, // Return the full URL as 'filepath' compatibility
      filename: file.name
  });
}
