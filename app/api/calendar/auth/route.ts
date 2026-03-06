import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
        return NextResponse.json({
            error: "Falta configurar GOOGLE_CLIENT_ID",
            instructions: "Si usas Vercel, añade GOOGLE_CLIENT_ID en la pestaña Settings > Environment Variables. Si estás en local, añádela a .env.local."
        }, { status: 500 });
    }

    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUri = `${protocol}://${host}/api/calendar/callback`;
    const scope = 'https://www.googleapis.com/auth/calendar.events';

    // Using simple redirect for OAuth 2.0 flow
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;

    return NextResponse.redirect(oauthUrl);
}
