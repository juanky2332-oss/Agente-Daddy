// ============================================================
// TELEGRAM BOT — Notification Stub
// ============================================================

export async function sendTelegramNotification(
    botToken: string,
    chatId: string,
    message: string
): Promise<void> {
    if (!botToken || !chatId || process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
        console.log('[Telegram MOCK] Message:', message);
        return;
    }
    // TODO: Real Telegram Bot API call
    // await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }),
    // });
}

// ============================================================
// GOOGLE CALENDAR — OAuth Stub
// ============================================================

export async function connectGoogleCalendar(): Promise<string> {
    // TODO: Implement Google OAuth 2.0 flow
    // 1. Redirect user to Google OAuth consent screen
    // 2. Exchange code for access token
    // 3. Store refresh token in Supabase
    console.log('[Google Calendar MOCK] OAuth connect initiated');
    return 'mock-calendar-id';
}

export async function createCalendarEvent(
    calendarId: string,
    accessToken: string,
    event: { title: string; date: string; description: string }
): Promise<string> {
    if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
        console.log('[Google Calendar MOCK] Event created:', event);
        return 'mock-event-id';
    }
    // TODO: Real Google Calendar API call
    // await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`, { ... });
    return 'mock-event-id';
}
