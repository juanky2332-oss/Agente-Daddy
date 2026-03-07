import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        // Polyfills for pdf-parse in Node environment at runtime
        if (typeof global.DOMMatrix === 'undefined') {
            (global as any).DOMMatrix = class DOMMatrix { };
        }
        if (typeof global.ImageData === 'undefined') {
            (global as any).ImageData = class ImageData { };
        }
        if (typeof global.Path2D === 'undefined') {
            (global as any).Path2D = class Path2D { };
        }

        const pdfParse = require('pdf-parse');

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
