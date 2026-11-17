import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TriAttendance · Account Manager Portal',
  description: 'Enterprise Location-Verified Attendance Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-surface-bg text-gray-900 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
