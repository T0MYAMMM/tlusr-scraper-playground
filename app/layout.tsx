import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

import { SiteHeader } from '@/components/layout/site-header';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const sans = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Tlusr Scraper — Pipeline Dashboard', template: '%s · Tlusr Scraper' },
  description:
    'Dashboard, pipeline visualizer, and article browser for the Tlusr Scraping System — Crawler → Scraper → Parser.',
};

export const viewport: Viewport = { themeColor: '#0a0a0c' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={cn('dark', sans.variable, mono.variable)} suppressHydrationWarning>
      <body className="min-h-screen font-sans">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10 bg-grid-subtle [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[480px] bg-glow-cyan opacity-70"
        />

        <TooltipProvider delayDuration={200}>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-white/[0.06] py-6 text-center text-xs text-muted-foreground">
              Tlusr Scraping System · Crawler → Scraper → Parser pipeline · MIT
            </footer>
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
