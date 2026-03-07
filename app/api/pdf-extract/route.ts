import { NextResponse } from 'next/server';
const pdfParse = require('pdf-parse');

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No se encontró archivo adjunto.' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const data = await pdfParse(buffer);

        return NextResponse.json({ text: data.text });
    } catch (e: any) {
        console.error('PDF Parse Error:', e);
        return NextResponse.json({ error: e.message || 'Error interno extrayendo PDF' }, { status: 500 });
    }
}
