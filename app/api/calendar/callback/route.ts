import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'No code provided' }, { status: 400 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${request.nextUrl.origin}/api/calendar/callback`;

    if (!clientId || !clientSecret) {
        return NextResponse.json({ error: 'Configuración OAuth incompleta (Faltan GOOGLE_CLIENT_ID o SECRET en .env.local)' }, { status: 500 });
    }

    try {
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            })
        });

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok) {
            return NextResponse.json({ error: 'Error intercambiando el código', details: tokenData }, { status: 400 });
        }

        if (tokenData.refresh_token) {
            const envPath = path.join(process.cwd(), '.env.local');
            try {
                let envContent = '';
                if (fs.existsSync(envPath)) {
                    envContent = fs.readFileSync(envPath, 'utf-8');
                }

                if (envContent.includes('GOOGLE_REFRESH_TOKEN=')) {
                    // Reemplazar si ya existe
                    envContent = envContent.replace(/GOOGLE_REFRESH_TOKEN=.*/g, `GOOGLE_REFRESH_TOKEN="${tokenData.refresh_token}"`);
                } else {
                    // Añadir si no existe
                    envContent += `\n# Automaticaly Added by OAuth\nGOOGLE_REFRESH_TOKEN="${tokenData.refresh_token}"\n`;
                }

                fs.writeFileSync(envPath, envContent);

                // Forzar un redirect al settings para que vea el check verde
                return NextResponse.redirect(new URL('/dashboard/settings', request.url));
            } catch (err) {
                console.error('Error escribiendo archivo .env.local:', err);
                return NextResponse.json({ error: 'OAuth con exito, pero no pude escribir en .env.local', refresh_token: tokenData.refresh_token }, { status: 500 });
            }
        }

        return NextResponse.json({
            message: "No se recibió refresh_token.",
            instruction: "Quizás debas revocar el acceso a la app en las opciones de Google y volver a conectarte para obtener uno nuevo."
        });

    } catch (e) {
        console.error('Calendar Callback Exception:', e);
        return NextResponse.json({ error: 'Excepción del servidor' }, { status: 500 });
    }
}
