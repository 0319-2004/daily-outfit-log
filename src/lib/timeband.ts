// Time band categorization utilities
// 朝 (Morning): 6:00-11:59
// 昼 (Afternoon): 12:00-17:59
// 夜 (Evening): 18:00-23:59
// 深夜 (Late night): 0:00-5:59

export type Timeband = '朝' | '昼' | '夜' | '深夜';
export type DayType = '平日' | '週末';

export function getTimeband(date: Date): Timeband {
    const hour = date.getHours();

    if (hour >= 6 && hour < 12) return '朝';
    if (hour >= 12 && hour < 18) return '昼';
    if (hour >= 18 && hour < 24) return '夜';
    return '深夜';
}

export function getDayType(date: Date): DayType {
    const day = date.getDay();
    // 0 = Sunday, 6 = Saturday
    return (day === 0 || day === 6) ? '週末' : '平日';
}

export function formatJapaneseDate(date: Date): string {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
}

export function formatJapaneseTime(date: Date): string {
    const hour = date.getHours();
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${hour}:${minute}`;
}
