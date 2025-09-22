declare module "pdf-parse" {
	interface PdfParseResult {
		text: string;
		info?: unknown;
		metadata?: unknown;
		version?: string;
		numpages?: number;
	}
	function pdfParse(input: Buffer | Uint8Array | ArrayBuffer): Promise<PdfParseResult>;
	export default pdfParse;
}


