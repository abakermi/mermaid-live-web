import type { Metadata } from "next";
import { Analytics } from '@vercel/analytics/next';

import "./globals.css";
import ClientWrapper from '@/components/ClientWrapper';

export const metadata: Metadata = {
  title: "Mermaid Live Editor - Create Diagrams Online",
  description: "A real-time editor for creating and modifying diagrams using Mermaid.js. Create flowcharts, sequence diagrams, class diagrams, and more with instant preview.",
  keywords: [
    "mermaid",
    "diagram editor",
    "flowchart",
    "sequence diagram",
    "class diagram",
    "state diagram",
    "gantt chart",
    "pie chart",
    "er diagram",
    "user journey",
    "git graph",
    "markdown diagrams"
  ],
  authors: [{ name: "Abdelhak Akermi" }],
  openGraph: {
    title: "Mermaid Live Editor",
    description: "Create and edit diagrams in real-time using Mermaid.js",
    type: "website",
    locale: "en_US",
    url: "https://mermaid-live-web.vercel.app",
    siteName: "Mermaid Live Editor",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClientWrapper>
          {children}
    
        </ClientWrapper>
        <Analytics />
      </body>
    </html>
  );
}
