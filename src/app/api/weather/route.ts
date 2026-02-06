import { NextRequest, NextResponse } from 'next/server';
import { fetchWeather } from '@/lib/weather';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const lat = parseFloat(searchParams.get('lat') || '0');
        const lon = parseFloat(searchParams.get('lon') || '0');

        if (!lat || !lon) {
            return NextResponse.json({ error: '位置情報が必要です' }, { status: 400 });
        }

        const weather = await fetchWeather(lat, lon);

        if (!weather) {
            return NextResponse.json({ error: '天気情報の取得に失敗しました' }, { status: 500 });
        }

        return NextResponse.json({ weather });
    } catch (error) {
        console.error('Weather fetch error:', error);
        return NextResponse.json({ error: '天気情報の取得に失敗しました' }, { status: 500 });
    }
}
