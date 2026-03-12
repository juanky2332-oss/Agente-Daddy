import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${request.nextUrl.origin}/api/calendar/callback`;

    if (!clientId) {
        return NextResponse.json(
            { error: 'La configuración de Google Calendar está incompleta (.env.local no tiene GOOGLE_CLIENT_ID).' },
            { status: 500 }
        );
    }

    const scope = 'https://www.googleapis.com/auth/calendar.events';
    const responseType = 'code';
    const accessType = 'offline';
    const prompt = 'consent';

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=${accessType}&prompt=${prompt}`;

    return NextResponse.redirect(url);
}
