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

        // Ocultar require de webpack para evitar transformaciones de ESM
        const pdfParseModule = eval(`require('pdf-parse')`);
        const pdfParse = (typeof pdfParseModule === 'function') ? pdfParseModule : (pdfParseModule.PDFParse || pdfParseModule.default);

        if (typeof pdfParse !== 'function') {
            console.error('[PDF-EXTRACT] No se encontró función. Keys:', Object.keys(pdfParseModule));
            return NextResponse.json({ error: 'No se pudo inicializar el motor de PDF. Revisa la consola del servidor.' }, { status: 500 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No se encontró archivo adjunto.' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();

        let data;
        try {
            if (typeof pdfParse === 'function') {
                try {
                    // Estilo tradicional
                    data = await pdfParse(Buffer.from(arrayBuffer));
                } catch (e: any) {
                    if (e.message.includes('cannot be invoked without \'new\'')) {
                        // Estilo v2.4.5 (Clase)
                        // Muchos forks procesan directamente al instanciar y retornan promesa
                        const p = new pdfParse(Buffer.from(arrayBuffer));
                        data = await (p.parse ? p.parse(Buffer.from(arrayBuffer)) : p);
                    } else {
                        throw e;
                    }
                }
            } else {
                throw new Error('No se encontró el motor de PDF');
            }
        } catch (innerError: any) {
            console.error('[PDF-EXTRACT-CRITICAL]', innerError);
            throw innerError;
        }

        return NextResponse.json({ text: data.text });
    } catch (e: any) {
        console.error('PDF Parse Error:', e);
        return NextResponse.json({ error: e.message || 'Error interno extrayendo PDF' }, { status: 500 });
    }
}
