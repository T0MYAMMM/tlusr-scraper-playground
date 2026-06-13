import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { ArticleDetail } from '@/components/articles/article-detail';
import { getArticleById } from '@/lib/server-data';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await getArticleById(id);
  return { title: data?.article?.title ?? 'Article' };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getArticleById(id);
  if (!data) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
      <Link
        href="/articles"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-cyan-300 transition-colors"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to Articles
      </Link>
      <ArticleDetail data={data} />
    </div>
  );
}
