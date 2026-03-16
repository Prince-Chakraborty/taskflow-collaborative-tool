import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from 'next-themes';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TaskFlow - Real-Time Collaborative Management',
  description: 'A real-time collaborative project management tool with Kanban boards',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Toaster 
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: '12px', fontWeight: '500' },
              error: { duration: 5000 },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
