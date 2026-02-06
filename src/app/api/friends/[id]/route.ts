import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
        }

        const userId = session.user.id;
        const resolvedParams = await params;
        const friendshipId = resolvedParams.id;
        const body = await req.json();
        const { action } = body; // 'accept' or 'reject'

        if (!action || !['accept', 'reject'].includes(action)) {
            return NextResponse.json({ error: '無効なアクションです' }, { status: 400 });
        }

        // Find friendship
        const friendship = await prisma.friendship.findUnique({
            where: { id: friendshipId },
        });

        if (!friendship) {
            return NextResponse.json({ error: '友達申請が見つかりません' }, { status: 404 });
        }

        // Only addressee can accept/reject
        if (friendship.addresseeId !== userId) {
            return NextResponse.json({ error: '権限がありません' }, { status: 403 });
        }

        if (action === 'accept') {
            const updated = await prisma.friendship.update({
                where: { id: friendshipId },
                data: { status: 'accepted' },
            });
            return NextResponse.json({ friendship: updated });
        } else {
            await prisma.friendship.delete({
                where: { id: friendshipId },
            });
            return NextResponse.json({ message: '友達申請を拒否しました' });
        }
    } catch (error) {
        console.error('Friend action error:', error);
        return NextResponse.json({ error: '操作に失敗しました' }, { status: 500 });
    }
}
