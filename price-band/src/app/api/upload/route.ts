import { NextRequest } from "next/server";
import prisma from "@/app/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		const file = formData.get("file");
		if (!file || !(file instanceof File)) {
			return Response.json({ error: "No file provided" }, { status: 400 });
		}

		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Persist to public/uploads
		const fs = await import("fs");
		const path = await import("path");
		const uploadsDir = path.join(process.cwd(), "public", "uploads");
		if (!fs.existsSync(uploadsDir)) {
			fs.mkdirSync(uploadsDir, { recursive: true });
		}
		const timestamp = Date.now();
		const safeName = file.name.replace(/[^a-z0-9_.-]/gi, "_");
		const filePath = path.join(uploadsDir, `${timestamp}-${safeName}`);
		fs.writeFileSync(filePath, buffer);

		const created = await prisma.solicitation.create({
			data: {
				filename: file.name,
				filePath,
				status: "uploaded",
				rawText: null,
			},
		});

		return Response.json({ id: created.id, filename: created.filename });
	} catch (error) {
		console.error(error);
		return Response.json({ error: "Upload failed" }, { status: 500 });
	}
}


