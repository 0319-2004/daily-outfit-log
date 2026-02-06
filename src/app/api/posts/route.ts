import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { userPostedToday, getFriendIds } from '@/lib/auth-utils';
import { getTodaysWindow, isLatePost } from '@/lib/windowScheduler';
import { getTimeband, getDayType } from '@/lib/timeband';

// GET /api/posts - Get friend's posts for today (requires user posted today)
export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
        }

        const userId = session.user.id;

        // Check if user posted today
        const posted = await userPostedToday(userId);
        if (!posted) {
            return NextResponse.json(
                { error: '今日の投稿が必要です' },
                { status: 403 }
            );
        }

        // Get friend IDs
        const friendIds = await getFriendIds(userId);

        // Get today's posts from friends (including self)
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        const posts = await prisma.post.findMany({
            where: {
                userId: { in: [...friendIds, userId] },
                timestamp: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        username: true,
                    },
                },
            },
            orderBy: { timestamp: 'desc' },
        });

        return NextResponse.json({ posts });
    } catch (error) {
        console.error('Get posts error:', error);
        return NextResponse.json({ error: '投稿の取得に失敗しました' }, { status: 500 });
    }
}

// POST /api/posts - Create a new post
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
        }

        const userId = session.user.id;

        // Check if user already posted today
        const alreadyPosted = await userPostedToday(userId);
        if (alreadyPosted) {
            return NextResponse.json(
                { error: '本日は既に投稿済みです' },
                { status: 400 }
            );
        }

        const body = await req.json();
        const { imageUrl, weatherData } = body;

        if (!imageUrl || !weatherData) {
            return NextResponse.json(
                { error: '画像と天気情報が必要です' },
                { status: 400 }
            );
        }

        // Get today's window to check if late
        const window = await getTodaysWindow(userId);
        const isLate = window ? isLatePost(window) : false;

        // Create post with context
        const now = new Date();
        const post = await prisma.post.create({
            data: {
                userId,
                imageUrl,
                weatherData: JSON.stringify(weatherData),
                timeband: getTimeband(now),
                dayType: getDayType(now),
                isLate,
                timestamp: now,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        username: true,
                    },
                },
            },
        });

        return NextResponse.json({ post });
    } catch (error) {
        console.error('Create post error:', error);
        return NextResponse.json({ error: '投稿に失敗しました' }, { status: 500 });
    }
}
