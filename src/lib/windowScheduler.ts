// Daily window scheduling logic
import { prisma } from './prisma';

export interface DailyWindow {
    id: string;
    userId: string;
    date: string;
    scheduledTime: Date;
    expiresAt: Date;
    createdAt: Date;
}

export function generateRandomTime(): Date {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Random time between 10:00 and 22:00
    const minHour = 10;
    const maxHour = 22;
    const randomHour = Math.floor(Math.random() * (maxHour - minHour)) + minHour;
    const randomMinute = Math.floor(Math.random() * 60);

    const scheduledTime = new Date(today);
    scheduledTime.setHours(randomHour, randomMinute, 0, 0);

    return scheduledTime;
}

export async function getTodaysWindow(userId: string): Promise<DailyWindow | null> {
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // Check if window already exists for today
    let window = await prisma.dailyWindow.findUnique({
        where: {
            userId_date: {
                userId,
                date: today,
            },
        },
    });

    // If no window exists, create one
    if (!window) {
        const scheduledTime = generateRandomTime();
        const expiresAt = new Date(scheduledTime.getTime() + 3 * 60 * 1000); // +3 minutes

        window = await prisma.dailyWindow.create({
            data: {
                userId,
                date: today,
                scheduledTime,
                expiresAt,
            },
        });
    }

    return window;
}

export function isWithinWindow(window: DailyWindow): boolean {
    const now = new Date();
    return now >= window.scheduledTime && now <= window.expiresAt;
}

export function isLatePost(window: DailyWindow): boolean {
    const now = new Date();
    return now > window.expiresAt;
}
