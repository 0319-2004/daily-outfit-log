import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
        }

        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: '画像が必要です' }, { status: 400 });
        }

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(image, {
            folder: 'daily-outfit-log',
            public_id: `${session.user.id}_${Date.now()}`,
            resource_type: 'image',
        });

        return NextResponse.json({
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'アップロードに失敗しました' }, { status: 500 });
    }
}
