'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Github, Radio, LayoutDashboard, Workflow, FileText, Settings, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const NAV = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/pipeline', label: 'Pipeline', icon: Workflow },
  { href: '/articles', label: 'Articles', icon: FileText },
  { href: '/configs', label: 'Configs', icon: Settings },
  { href: '/docs', label: 'Docs', icon: BookOpen },
] as const;

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center gap-6 px-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-md border border-cyan-400/30 bg-cyan-400/10 shadow-[0_0_24px_-8px_rgba(34,211,238,0.7)] transition-colors group-hover:border-cyan-400/50">
            <Radio className="h-3.5 w-3.5 text-cyan-300" />
          </span>
          <span className="font-semibold tracking-tight">
            <span className="gradient-text">Tlusr</span>
            <span className="text-zinc-400"> Scraper</span>
          </span>
          <Badge variant="muted" className="ml-1 hidden sm:inline-flex">
            v0.2.0
          </Badge>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-xs font-medium transition-colors',
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 -z-10 rounded-md border border-white/[0.08] bg-white/[0.04]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a
              href="https://github.com/T0MYAMMM/tlusr-scraping-system"
              target="_blank"
              rel="noreferrer"
            >
              <Github className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
