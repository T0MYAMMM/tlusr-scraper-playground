import type { Metadata } from 'next';
import { FileText } from 'lucide-react';
import { ArticlesWorkspace } from './workspace';

export const metadata: Metadata = { title: 'Articles' };

export default function ArticlesPage() {
  return (
    <div className="mx-auto max-w-[1440px] space-y-6 px-6 py-8">
      <div>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-cyan-400" />
          <h1 className="text-2xl font-bold gradient-text">Articles</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse and search all parsed articles
        </p>
      </div>
      <ArticlesWorkspace />
    </div>
  );
}
