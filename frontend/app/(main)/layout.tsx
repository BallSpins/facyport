import Navbar from '../components/Navbar';

export const metadata = {
  title: 'Facyport',
  description: 'Platform Pelaporan Fasilitas Kampus',
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-b from-white to-blue-200 min-h-screen text-gray-900 flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
    </div>
  );
}
