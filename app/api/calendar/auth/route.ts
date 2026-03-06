import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
        return NextResponse.json({
            error: "Falta configurar GOOGLE_CLIENT_ID en el archivo .env.local",
            instructions: "1. Ve a Google Cloud Console. 2. Crea un proyecto. 3. Ve a APIs y Servicios > Credenciales. 4. Crea OAuth Client ID (Web application). 5. Añade localhost:3000 como origen y localhost:3000/api/calendar/callback como redirect URI."
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
