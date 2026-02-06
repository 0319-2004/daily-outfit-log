// Weather data fetcher and formatter
// Uses OpenWeatherMap API

export interface WeatherData {
    temp: number;
    condition: string;
    icon: string;
    conditionJa: string;
}

const WEATHER_CONDITION_MAP: Record<string, string> = {
    'Clear': '晴れ',
    'Clouds': '曇り',
    'Rain': '雨',
    'Drizzle': '小雨',
    'Snow': '雪',
    'Thunderstorm': '雷雨',
    'Mist': '霧',
    'Fog': '霧',
    'Haze': '霞',
};

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData | null> {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
        console.error('OPENWEATHER_API_KEY not set');
        return null;
    }

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }

        const data = await response.json();

        const condition = data.weather[0]?.main || 'Unknown';
        const conditionJa = WEATHER_CONDITION_MAP[condition] || '不明';

        return {
            temp: Math.round(data.main.temp),
            condition,
            conditionJa,
            icon: data.weather[0]?.icon || '01d',
        };
    } catch (error) {
        console.error('Failed to fetch weather:', error);
        return null;
    }
}

export function formatWeatherForDisplay(weather: WeatherData): string {
    return `${weather.conditionJa} ${weather.temp}°C`;
}
