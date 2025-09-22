import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
	const { id } = await context.params;
	const solicitation = await prisma.solicitation.findUnique({
		where: { id },
		include: { extractedData: true, suggestions: { orderBy: { createdAt: "desc" }, take: 1 } },
	});
	if (!solicitation) return Response.json({ error: "Not found" }, { status: 404 });
	return Response.json({ solicitation });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await context.params;
		const body = await request.json();
		const updated = await prisma.solicitation.update({ where: { id }, data: body });
		await prisma.auditLog.create({ data: { solicitationId: id, action: "edited", details: JSON.stringify(body) } });
		return Response.json({ solicitation: updated });
	} catch (error) {
		console.error(error);
		return Response.json({ error: "Update failed" }, { status: 500 });
	}
}


