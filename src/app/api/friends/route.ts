import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { FRIEND_LIMIT, getFriendIds } from '@/lib/auth-utils';

// GET /api/friends - Get all friends and pending requests
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
        }

        const userId = session.user.id;

        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    { requesterId: userId },
                    { addresseeId: userId },
                ],
            },
            include: {
                requester: {
                    select: { id: true, username: true, displayName: true },
                },
                addressee: {
                    select: { id: true, username: true, displayName: true },
                },
            },
        });

        const friends = friendships
            .filter(f => f.status === 'accepted')
            .map(f => {
                const friend = f.requesterId === userId ? f.addressee : f.requester;
                return { ...friend, friendshipId: f.id };
            });

        const pending = friendships
            .filter(f => f.status === 'pending')
            .map(f => ({
                friendshipId: f.id,
                type: f.requesterId === userId ? 'sent' : 'received',
                user: f.requesterId === userId ? f.addressee : f.requester,
            }));

        return NextResponse.json({ friends, pending, limit: FRIEND_LIMIT });
    } catch (error) {
        console.error('Get friends error:', error);
        return NextResponse.json({ error: '友達一覧の取得に失敗しました' }, { status: 500 });
    }
}

// POST /api/friends - Send friend request
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
        }

        const userId = session.user.id;
        const body = await req.json();
        const { username } = body;

        if (!username) {
            return NextResponse.json({ error: 'ユーザー名が必要です' }, { status: 400 });
        }

        // Find target user
        const targetUser = await prisma.user.findUnique({
            where: { username },
        });

        if (!targetUser) {
            return NextResponse.json({ error: 'ユーザーが見つかりません' }, { status: 404 });
        }

        if (targetUser.id === userId) {
            return NextResponse.json({ error: '自分自身に友達申請はできません' }, { status: 400 });
        }

        // Check friend limit
        const currentFriends = await getFriendIds(userId);
        if (currentFriends.length >= FRIEND_LIMIT) {
            return NextResponse.json(
                { error: `友達の上限（${FRIEND_LIMIT}人）に達しています` },
                { status: 400 }
            );
        }

        // Check if friendship already exists
        const existing = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { requesterId: userId, addresseeId: targetUser.id },
                    { requesterId: targetUser.id, addresseeId: userId },
                ],
            },
        });

        if (existing) {
            return NextResponse.json(
                { error: '既に友達申請が存在します' },
                { status: 400 }
            );
        }

        // Create friend request
        const friendship = await prisma.friendship.create({
            data: {
                requesterId: userId,
                addresseeId: targetUser.id,
                status: 'pending',
            },
            include: {
                addressee: {
                    select: { id: true, username: true, displayName: true },
                },
            },
        });

        return NextResponse.json({ friendship });
    } catch (error) {
        console.error('Send friend request error:', error);
        return NextResponse.json({ error: '友達申請に失敗しました' }, { status: 500 });
    }
}
