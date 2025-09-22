export type ExtractedFields = {
	nsn?: string;
	quantity?: number;
	deliveryDays?: number;
	description?: string;
	confidenceScore: number;
};

export async function extractFromPdfBuffer(buffer: Buffer): Promise<ExtractedFields> {
	const { default: pdfParse } = await import("pdf-parse");
	const parsed = await pdfParse(buffer);
	const text = parsed.text || "";

	const nsnMatch = text.match(/\b(\d{4}-\d{2}-\d{3}-\d{4})\b/);
	const quantityMatch = text.match(/\bqty\s*[:=]?\s*(\d{1,7})\b/i) || text.match(/\bquantity\s*[:=]?\s*(\d{1,7})\b/i);
	const deliveryMatch = text.match(/\b(delivery|lead)\s*(?:days|time)?\s*[:=]?\s*(\d{1,5})\b/i);

	const compact = text.replace(/\s+/g, " ").trim();
	const description = compact.slice(0, 200) || undefined;

	let score = 0;
	if (nsnMatch) score += 0.35;
	if (quantityMatch) score += 0.35;
	if (deliveryMatch) score += 0.2;
	if (description) score += 0.1;

	return {
		nsn: nsnMatch?.[1],
		quantity: quantityMatch ? Number(quantityMatch[1]) : undefined,
		deliveryDays: deliveryMatch ? Number(deliveryMatch[2] ?? deliveryMatch[1]) : undefined,
		description,
		confidenceScore: Math.max(0, Math.min(1, score)),
	};
}


