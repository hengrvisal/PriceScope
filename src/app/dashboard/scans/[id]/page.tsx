import { ScanView } from "@/components/scan-view";

export default async function ScanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="max-w-5xl mx-auto p-6">
      <ScanView scanId={id} />
    </main>
  );
}
