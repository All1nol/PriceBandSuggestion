"use client";

import { useState } from "react";

type UploadState = {
	id?: string;
	filename?: string;
};

export default function Workflow() {
	const [upload, setUpload] = useState<UploadState>({});
	const [extracted, setExtracted] = useState<any>(null);
	const [suggestion, setSuggestion] = useState<any>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		const formData = new FormData(form);
		setBusy(true);
		setError(null);
		try {
			const res = await fetch("/api/upload", { method: "POST", body: formData });
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Upload failed");
			setUpload({ id: data.id, filename: data.filename });
			setExtracted(null);
			setSuggestion(null);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setBusy(false);
		}
	}

	async function handleExtract() {
		if (!upload.id) return;
		setBusy(true);
		setError(null);
		try {
			const res = await fetch(`/api/solicitations/${upload.id}/extract`, { method: "POST" });
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Extraction failed");
			setExtracted(data.extracted);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setBusy(false);
		}
	}

	async function handleSuggest() {
		if (!upload.id) return;
		setBusy(true);
		setError(null);
		try {
			const res = await fetch(`/api/solicitations/${upload.id}/suggest`, { method: "POST" });
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Suggestion failed");
			setSuggestion(data.suggestion);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="w-full max-w-3xl mx-auto flex flex-col gap-6">
			<section className="rounded-md border p-4">
				<h2 className="text-lg font-semibold mb-3">1. Upload RFQ PDF</h2>
				<form onSubmit={handleUpload} className="flex items-center gap-3">
					<input name="file" type="file" accept="application/pdf" required className="border p-2 rounded" />
					<button disabled={busy} className="bg-black text-white px-3 py-2 rounded disabled:opacity-50">Upload</button>
				</form>
				{upload.id && <p className="text-sm mt-2">Uploaded: {upload.filename}</p>}
			</section>

			<section className="rounded-md border p-4">
				<h2 className="text-lg font-semibold mb-3">2. Extract Fields</h2>
				<button disabled={!upload.id || busy} onClick={handleExtract} className="bg-blue-600 text-white px-3 py-2 rounded disabled:opacity-50">Extract</button>
				{extracted && (
					<pre className="mt-3 whitespace-pre-wrap break-words text-sm bg-gray-100 p-2 rounded">{JSON.stringify(extracted, null, 2)}</pre>
				)}
			</section>

			<section className="rounded-md border p-4">
				<h2 className="text-lg font-semibold mb-3">3. Price Suggestion</h2>
				<button disabled={!upload.id || busy} onClick={handleSuggest} className="bg-green-600 text-white px-3 py-2 rounded disabled:opacity-50">Suggest Price Band</button>
				{suggestion && (
					<pre className="mt-3 whitespace-pre-wrap break-words text-sm bg-gray-100 p-2 rounded">{JSON.stringify(suggestion, null, 2)}</pre>
				)}
			</section>

			{error && <p className="text-red-600">{error}</p>}
		</div>
	);
}


