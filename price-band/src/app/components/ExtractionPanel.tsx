export default function ExtractionPanel({ extracted }: { extracted: any }) {
	if (!extracted) return null;
	return (
		<div className="border rounded p-3 text-sm">
			<h3 className="font-semibold mb-2">Extracted</h3>
			<pre className="whitespace-pre-wrap break-words">{JSON.stringify(extracted, null, 2)}</pre>
		</div>
	);
}


