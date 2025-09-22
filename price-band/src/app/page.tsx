import SolicitationWorkflow from "./components/SolicitationWorkflow";

export default function Home() {
  return (
    <main className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">SalesPatriot - Price Band Suggestion</h1>
      <SolicitationWorkflow />
    </main>
  );
}
