import { useEffect, useState } from "react";

type AuditLog = {
	id: string;
	solicitationId: string;
	action: string;
	details: string;
	createdAt: string;
};

export default function AuditPanel({ id }: { id: string | null }) {
	const [logs, setLogs] = useState<AuditLog[]>([]);
	useEffect(() => {
		let active = true;
		async function load() {
			if (!id) return;
			const res = await fetch(`/api/solicitations/${id}/audit`);
			if (!res.ok) return;
			const data = await res.json();
			if (!active) return;
			setLogs(data.logs ?? []);
		}
		load();
		return () => {
			active = false;
		};
	}, [id]);

	if (!id) return null;
	return (
		<div className="border rounded p-3 text-sm">
			<h3 className="font-semibold mb-2">Audit Logs</h3>
			<pre className="whitespace-pre-wrap break-words">{JSON.stringify(logs, null, 2)}</pre>
		</div>
	);
}


