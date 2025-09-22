import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { calculatePriceBand } from "@/app/lib/services/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const solicitation = await prisma.solicitation.findUnique({ where: { id: params.id } });
		if (!solicitation) return Response.json({ error: "Not found" }, { status: 404 });

		const extracted = await prisma.extractedData.findUnique({ where: { solicitationId: solicitation.id } });
		if (!extracted) return Response.json({ error: "No extracted data" }, { status: 400 });

		const suggestion = calculatePriceBand({
			nsn: extracted.nsn ?? undefined,
			quantity: extracted.quantity ?? undefined,
			deliveryDays: extracted.deliveryDays ?? undefined,
			description: extracted.description ?? undefined,
			confidenceScore: extracted.confidenceScore ?? 0,
		});

		const created = await prisma.priceSuggestion.create({
			data: {
				solicitationId: solicitation.id,
				priceLow: suggestion.priceLow,
				priceHigh: suggestion.priceHigh,
				confidencePercent: suggestion.confidencePercent,
				rationale: JSON.stringify(suggestion.rationale),
				baseCost: suggestion.baseCost,
				marginFactor: suggestion.marginFactor,
			},
		});

		await prisma.solicitation.update({ where: { id: solicitation.id }, data: { status: "suggested" } });
		await prisma.auditLog.create({
			data: {
				solicitationId: solicitation.id,
				action: "suggested",
				details: JSON.stringify({ suggestion: created }),
			},
		});

		return Response.json({ suggestion: created });
	} catch (error) {
		console.error(error);
		return Response.json({ error: "Suggestion failed" }, { status: 500 });
	}
}


