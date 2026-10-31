import Sidebar from '@/app/components/Sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 bg-gradient-to-b from-white to-blue-200 p-6">{children}</main>
    </div>
  );
}

