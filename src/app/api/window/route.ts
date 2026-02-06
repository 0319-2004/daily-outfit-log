import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getTodaysWindow } from '@/lib/windowScheduler';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
        }

        const window = await getTodaysWindow(session.user.id);

        return NextResponse.json({ window });
    } catch (error) {
        console.error('Get window error:', error);
        return NextResponse.json({ error: '投稿時間の取得に失敗しました' }, { status: 500 });
    }
}
