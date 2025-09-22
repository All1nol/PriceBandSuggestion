import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
	try {
		const { id } = await context.params;
		const logs = await prisma.auditLog.findMany({
			where: { solicitationId: id },
			orderBy: { createdAt: "desc" },
		});
		return Response.json({ logs });
	} catch (error) {
		console.error(error);
		return Response.json({ error: "Failed to fetch audit" }, { status: 500 });
	}
}


