export default function StatusCard({ status }: { status: string }) {
	return (
		<div className="border rounded p-3 text-sm">
			<span className="font-semibold">Status:</span> {status}
		</div>
	);
}


