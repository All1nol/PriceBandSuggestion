import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { filename, filePath } = body ?? {};
		if (!filename || !filePath) {
			return Response.json({ error: "filename and filePath required" }, { status: 400 });
		}
		const created = await prisma.solicitation.create({ data: { filename, filePath, status: "uploaded" } });
		return Response.json({ id: created.id });
	} catch (error) {
		console.error(error);
		return Response.json({ error: "Failed to create solicitation" }, { status: 500 });
	}
}


