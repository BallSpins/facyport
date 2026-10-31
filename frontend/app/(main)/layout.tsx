
import Navbar from '../components/Navbar';
import Template from '../template';

export const metadata = {
  title: 'Facyport',
  description: 'Platform Pelaporan Fasilitas Kampus',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className="bg-gradient-to-b from-white to-blue-200 min-h-screen text-gray-900 overflow-x-hidden">
        <Navbar />
        <Template>
          {children}
        </Template>
      </body>
    </html>
  );
}