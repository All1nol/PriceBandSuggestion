import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";
import { extractFromPdfBuffer } from "@/app/lib/services/extraction";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(_request: NextRequest, { params }: { params: { id: string } }) {
	try {
		const solicitation = await prisma.solicitation.findUnique({ where: { id: params.id } });
		if (!solicitation) {
			return Response.json({ error: "Not found" }, { status: 404 });
		}

		const fs = await import("fs");
		if (!fs.existsSync(solicitation.filePath)) {
			return Response.json({ error: "File missing on server" }, { status: 404 });
		}

		const buffer = fs.readFileSync(solicitation.filePath);
		const extracted = await extractFromPdfBuffer(buffer);

		await prisma.extractedData.upsert({
			where: { solicitationId: solicitation.id },
			create: {
				solicitationId: solicitation.id,
				nsn: extracted.nsn,
				quantity: extracted.quantity,
				deliveryDays: extracted.deliveryDays,
				description: extracted.description,
				confidenceScore: extracted.confidenceScore,
			},
			update: {
				nsn: extracted.nsn,
				quantity: extracted.quantity,
				deliveryDays: extracted.deliveryDays,
				description: extracted.description,
				confidenceScore: extracted.confidenceScore,
			},
		});

		await prisma.solicitation.update({
			where: { id: solicitation.id },
			data: { status: "extracted" },
		});

		await prisma.auditLog.create({
			data: {
				solicitationId: solicitation.id,
				action: "extracted",
				details: JSON.stringify({ extracted }),
			},
		});

		return Response.json({ extracted });
	} catch (error) {
		console.error(error);
		return Response.json({ error: "Extraction failed" }, { status: 500 });
	}
}


