import { NextRequest, NextResponse } from 'next/server';
import { syncAppToGoogle, syncGoogleToApp } from '@/lib/calendar-sync';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const timeMin = searchParams.get('timeMin');
    const timeMax = searchParams.get('timeMax');

    if (!timeMin || !timeMax) {
        return NextResponse.json({ error: 'Faltan parámetros timeMin y timeMax' }, { status: 400 });
    }

    try {
        const items = await syncGoogleToApp(timeMin, timeMax);
        return NextResponse.json({ items });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const { transaction } = await request.json();

        if (!transaction) {
            return NextResponse.json({ error: 'No transaction provided' }, { status: 400 });
        }

        const result = await syncAppToGoogle(transaction);
        return NextResponse.json({ success: !!result, data: result });
    } catch (e: any) {
        console.error('Calendar Sync POST Error:', e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
