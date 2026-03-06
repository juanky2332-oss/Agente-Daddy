import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!code) {
        return NextResponse.json({ error: "No se proporcionó código de autorización" }, { status: 400 });
    }

    if (!clientId || !clientSecret) {
        return NextResponse.json({ error: "Faltan credenciales de Google (Client ID / Client Secret)" }, { status: 500 });
    }

    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const redirectUri = `${protocol}://${host}/api/calendar/callback`;

    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Error desde Google:', data);
            return NextResponse.json({ error: 'Error intercambiando el código', details: data }, { status: 500 });
        }

        // TODO: En un sistema real, guardaríamos el data.refresh_token y data.access_token en la base de datos de Supabase para este usuario.
        // Aquí pasaremos el token a través del cliente temporalmente como prueba de concepto.

        console.log("Tokens recibidos con éxito.");

        // Redirigimos de vuelta a los ajustes pasando el token (para prototipo local)
        const redirectUrl = new URL('/settings', request.url);
        redirectUrl.searchParams.set('calendar', 'connected');
        if (data.access_token) {
            redirectUrl.searchParams.set('g_token', data.access_token);
        }
        return NextResponse.redirect(redirectUrl);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Error en la conexión a Google" }, { status: 500 });
    }
}
