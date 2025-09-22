"use client";

import { useState } from "react";

export default function SolicitationWorkflow() {
	const [id, setId] = useState<string | null>(null);
	const [extracted, setExtracted] = useState<any>(null);
	const [suggestion, setSuggestion] = useState<any>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function upload(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		const formData = new FormData(form);
		setBusy(true);
		setError(null);
		try {
			const res = await fetch("/api/upload", { method: "POST", body: formData });
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Upload failed");
			setId(data.id);
			setExtracted(null);
			setSuggestion(null);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setBusy(false);
		}
	}

	async function extract() {
		if (!id) return;
		setBusy(true);
		setError(null);
		try {
			const res = await fetch(`/api/solicitations/${id}/extract`, { method: "POST" });
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Extraction failed");
			setExtracted(data.extracted);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setBusy(false);
		}
	}

	async function suggest() {
		if (!id) return;
		setBusy(true);
		setError(null);
		try {
			const res = await fetch(`/api/solicitations/${id}/suggest`, { method: "POST" });
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
				<form onSubmit={upload} className="flex items-center gap-3">
					<input name="file" type="file" accept="application/pdf" required className="border p-2 rounded" />
					<button disabled={busy} className="bg-black text-white px-3 py-2 rounded disabled:opacity-50">Upload</button>
				</form>
				{id && <p className="text-sm mt-2">Created Solicitation ID: {id}</p>}
			</section>

			<section className="rounded-md border p-4">
				<h2 className="text-lg font-semibold mb-3">2. Extract Fields</h2>
				<button disabled={!id || busy} onClick={extract} className="bg-blue-600 text-white px-3 py-2 rounded disabled:opacity-50">Extract</button>
				{extracted && (
					<pre className="mt-3 whitespace-pre-wrap break-words text-sm bg-gray-100 p-2 rounded">{JSON.stringify(extracted, null, 2)}</pre>
				)}
			</section>

			<section className="rounded-md border p-4">
				<h2 className="text-lg font-semibold mb-3">3. Price Suggestion</h2>
				<button disabled={!id || busy} onClick={suggest} className="bg-green-600 text-white px-3 py-2 rounded disabled:opacity-50">Suggest Price Band</button>
				{suggestion && (
					<pre className="mt-3 whitespace-pre-wrap break-words text-sm bg-gray-100 p-2 rounded">{JSON.stringify(suggestion, null, 2)}</pre>
				)}
			</section>

			{error && <p className="text-red-600">{error}</p>}
		</div>
	);
}


