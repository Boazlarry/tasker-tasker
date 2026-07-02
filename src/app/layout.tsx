import { Inter } from "next/font/google";
import type { Metadata } from 'next';
import "./globals.css";
import { ThemeProvider } from '../context/ThemeContext';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Tasker Tasker',
  description: 'Local-first Jira work console for older Jira environments.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
