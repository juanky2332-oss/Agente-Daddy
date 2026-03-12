import { getGoogleAccessToken } from './google-auth';
import { Transaction } from './types';

export async function syncAppToGoogle(transaction: Transaction) {
    const token = await getGoogleAccessToken();
    if (!token) return null;

    const event = {
        summary: `${transaction.type === 'income' ? '💰' : '💸'} ${transaction.description}`,
        description: `Transacción en Agente Daddy\nImporte: ${transaction.amount}€\nEstado: ${transaction.is_confirmed ? 'Confirmado' : 'Pendiente'}`,
        start: { date: transaction.date },
        end: { date: transaction.date },
    };

    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
    });

    if (!res.ok) {
        console.error('Error creating Google Calendar event:', await res.text());
        return null;
    }

    return await res.json();
}

export async function syncGoogleToApp(timeMin: string, timeMax: string) {
    const token = await getGoogleAccessToken();
    if (!token) return [];

    const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true`;

    const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) return [];

    const data = await res.json();
    return data.items || [];
}
