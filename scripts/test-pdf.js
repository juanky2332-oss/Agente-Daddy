const pdfParseModule = require('pdf-parse');
const pdfParse = pdfParseModule.PDFParse || pdfParseModule.default || (typeof pdfParseModule === 'function' ? pdfParseModule : null);

console.log('Using function:', typeof pdfParse);
const buffer = Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\ntrailer\n<<>>\n%%EOF');

if (pdfParse) {
    pdfParse(buffer).then(res => {
        console.log('Success!', res.text);
    }).catch(err => {
        console.log('Call failed:', err.message);
    });
} else {
    console.log('No function found');
}
