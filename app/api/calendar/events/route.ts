import { NextRequest, NextResponse } from 'next/server';
import { getGoogleAccessToken } from '@/lib/google-auth';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const timeMin = searchParams.get('timeMin');
        const timeMax = searchParams.get('timeMax');

        if (!timeMin || !timeMax) {
            return NextResponse.json({ error: 'Faltan parámetros timeMin o timeMax' }, { status: 400 });
        }

        const token = await getGoogleAccessToken();

        if (!token) {
            // Si el servidor no está configurado, devolvemos silenciosamente 0 eventos
            return NextResponse.json({ items: [] });
        }

        const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&maxResults=100&singleEvents=true&orderBy=startTime`;

        const res = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            console.error('Error fetching calendar events in backend:', await res.text());
            return NextResponse.json({ items: [] });
        }

        const data = await res.json();
        return NextResponse.json(data);

    } catch (e: any) {
        console.error('Calendar Events Exception:', e);
        return NextResponse.json({ items: [] });
    }
}
