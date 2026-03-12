const pdfParseModule = require('pdf-parse');
const PDFParse = pdfParseModule.PDFParse || pdfParseModule.default || pdfParseModule;

const buffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');

async function run() {
    console.log('Detected type:', typeof PDFParse);
    try {
        console.log('Testing simple call...');
        const res = await PDFParse(buffer);
        console.log('Success simple call:', res.text);
    } catch (e) {
        console.log('Simple call failed:', e.message);
        try {
            console.log('Testing new PDFParse().parse(buffer)...');
            const res = await new PDFParse().parse(buffer);
            console.log('Success new parse:', res.text);
        } catch (e2) {
            console.log('New parse failed:', e2.message);
            try {
                console.log('Testing new PDFParse(buffer)...');
                const res = await new PDFParse(buffer);
                console.log('Success new constructor:', res.text);
            } catch (e3) {
                console.log('New constructor failed:', e3.message);
            }
        }
    }
}
run();
