import type { PriceSuggestion } from "@/app/lib/services/pricing";

export default function SuggestionPanel({ suggestion }: { suggestion: PriceSuggestion | null }) {
	if (!suggestion) return null;
	return (
		<div className="border rounded p-3 text-sm">
			<h3 className="font-semibold mb-2">Suggestion</h3>
			<pre className="whitespace-pre-wrap break-words bg-gray-900 text-gray-100 border border-white/10 p-2 rounded overflow-auto">
				{JSON.stringify(suggestion, null, 2)}
			</pre>
		</div>
	);
}


