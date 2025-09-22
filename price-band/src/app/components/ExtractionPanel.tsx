import type { ExtractedFields } from "@/app/lib/services/extraction";

export default function ExtractionPanel({ extracted }: { extracted: ExtractedFields | null }) {
	if (!extracted) return null;
	return (
		<div className="border rounded p-3 text-sm">
			<h3 className="font-semibold mb-2">Extracted</h3>
			<pre className="whitespace-pre-wrap break-words bg-gray-900 text-gray-100 border border-white/10 p-2 rounded overflow-auto">
				{JSON.stringify(extracted, null, 2)}
			</pre>
		</div>
	);
}


