import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, username, displayName, password } = body;

        // Validation
        if (!email || !username || !displayName || !password) {
            return NextResponse.json(
                { error: 'すべてのフィールドを入力してください' },
                { status: 400 }
            );
        }

        // Check if email already exists
        const existingEmail = await prisma.user.findUnique({
            where: { email },
        });

        if (existingEmail) {
            return NextResponse.json(
                { error: 'このメールアドレスは既に使用されています' },
                { status: 400 }
            );
        }

        // Check if username already exists
        const existingUsername = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUsername) {
            return NextResponse.json(
                { error: 'このユーザー名は既に使用されています' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                username,
                displayName,
                hashedPassword,
            },
        });

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                displayName: user.displayName,
            },
        });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: '登録に失敗しました' },
            { status: 500 }
        );
    }
}
