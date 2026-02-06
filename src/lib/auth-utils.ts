// Authentication helper utilities
import { prisma } from './prisma';

export async function userPostedToday(userId: string): Promise<boolean> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    const post = await prisma.post.findFirst({
        where: {
            userId,
            timestamp: {
                gte: startOfDay,
                lte: endOfDay,
            },
        },
    });

    return !!post;
}

export async function areFriends(userId1: string, userId2: string): Promise<boolean> {
    const friendship = await prisma.friendship.findFirst({
        where: {
            OR: [
                {
                    requesterId: userId1,
                    addresseeId: userId2,
                    status: 'accepted',
                },
                {
                    requesterId: userId2,
                    addresseeId: userId1,
                    status: 'accepted',
                },
            ],
        },
    });

    return !!friendship;
}

export async function getFriendIds(userId: string): Promise<string[]> {
    const friendships = await prisma.friendship.findMany({
        where: {
            OR: [
                { requesterId: userId, status: 'accepted' },
                { addresseeId: userId, status: 'accepted' },
            ],
        },
    });

    const friendIds = friendships.map(f =>
        f.requesterId === userId ? f.addresseeId : f.requesterId
    );

    return friendIds;
}

export const FRIEND_LIMIT = 30;
