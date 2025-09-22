export type PriceSuggestion = {
	priceLow: number;
	priceHigh: number;
	confidencePercent: number;
	rationale: string[];
	baseCost: number;
	marginFactor: number;
};

type Inputs = {
	nsn?: string;
	quantity?: number;
	deliveryDays?: number;
	description?: string;
	confidenceScore: number;
};

export function calculatePriceBand(inputs: Inputs): PriceSuggestion {
	const { quantity = 1, deliveryDays, description, confidenceScore } = inputs;
	const complexityFactor = description && /repair|assembly|precision|aerospace/i.test(description) ? 1.4 : 1.0;
	const urgencyFactor = deliveryDays && deliveryDays < 15 ? 1.2 : 1.0;
	const baseUnitCost = 50 * complexityFactor * urgencyFactor;
	const baseCost = baseUnitCost * Math.max(1, quantity);
	const marginFactor = 0.15 + (1 - Math.min(1, Math.max(0, confidenceScore))) * 0.25;
	const spread = 0.1 + (1 - confidenceScore) * 0.2;
	const priceLow = Math.round(baseCost * (1 + marginFactor) * (1 - spread));
	const priceHigh = Math.round(baseCost * (1 + marginFactor) * (1 + spread));
	const rationale: string[] = [];
	if (complexityFactor > 1) rationale.push("Complexity/keywords increased base cost");
	if (urgencyFactor > 1) rationale.push("Tight delivery increased cost");
	rationale.push(`Quantity considered: ${quantity}`);
	rationale.push(`Confidence score: ${Math.round(confidenceScore * 100)}%`);
	const confidencePercent = Math.round(60 + confidenceScore * 35);
	return { priceLow, priceHigh, confidencePercent, rationale, baseCost: Math.round(baseCost), marginFactor: Number(marginFactor.toFixed(2)) };
}


