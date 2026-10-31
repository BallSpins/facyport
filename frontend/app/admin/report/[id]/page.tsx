import { Suspense } from 'react';
import ReportDetailClient from './ReportDetailClient';

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-gradient-to-b from-white to-blue-200">
          <p className="text-gray-600 font-semibold text-base animate-pulse">
            Memuat detail laporan...
          </p>
        </div>
      }
    >
      <ReportDetailClient params={params} />
    </Suspense>
  );
}
