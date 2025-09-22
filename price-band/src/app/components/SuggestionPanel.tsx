export default function SuggestionPanel({ suggestion }: { suggestion: any }) {
	if (!suggestion) return null;
	return (
		<div className="border rounded p-3 text-sm">
			<h3 className="font-semibold mb-2">Suggestion</h3>
			<pre className="whitespace-pre-wrap break-words">{JSON.stringify(suggestion, null, 2)}</pre>
		</div>
	);
}


