export async function getGoogleAccessToken() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        console.error('Falta GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET o GOOGLE_REFRESH_TOKEN en .env.local');
        return null;
    }

    try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token',
            }),
        });

        if (!response.ok) {
            console.error('Error refrescando token:', await response.text());
            return null;
        }

        const data = await response.json();
        return data.access_token;
    } catch (e) {
        console.error('Excepción al obtener access_token:', e);
        return null;
    }
}
