export interface QueueCounts {
  pending: number;
  processing: number;
  done: number;
  dead: number;
}

export interface SystemStatus {
  queues: {
    crawler_to_scraper: QueueCounts;
    scraper_to_parser: QueueCounts;
  };
  total_articles: number;
  total_sites: string[];
  last_updated: string;
}

export interface Article {
  id: string;
  url: string;
  canonical_url: string | null;
  source_domain: string;
  title: string | null;
  subtitle: string | null;
  summary: string | null;
  content: string | null;
  content_markdown: string | null;
  author: string | null;
  authors: string[];
  publish_date: string | null;
  updated_date: string | null;
  language: string | null;
  categories: string[];
  tags: string[];
  images: ImageReference[];
  crawl_timestamp: string;
  parsed_at: string;
}

export interface ImageReference {
  url: string;
  caption: string | null;
  alt: string | null;
}

export interface ParseDiagnostics {
  timings_ms: Record<string, number>;
  aggregate_confidence: number | null;
  distiller_used: string | null;
  llm_calls: number;
  llm_tokens: number;
  notes: string[];
}

export interface ArticleFile {
  id: string;
  site: string;
  date: string;
  article: Article;
  diagnostics: ParseDiagnostics | null;
}

export interface ArticleListItem {
  id: string;
  site: string;
  date: string;
  title: string | null;
  url: string;
  author: string | null;
  language: string | null;
  content_length: number;
  confidence: number | null;
  parsed_at: string;
}

export interface SiteConfig {
  site_name: string;
  base_url: string | null;
  start_urls: string[];
  engine: string;
  strategy: string;
  requests_per_minute: number;
  timeout_seconds: number;
  filename: string;
  raw_yaml: string;
}

export type PipelineNodeId =
  | 'crawler'
  | 'queue_c2s'
  | 'scraper'
  | 'queue_s2p'
  | 'parser'
  | 'output';

export interface PipelineNodeMeta {
  id: PipelineNodeId;
  label: string;
  role: 'worker' | 'queue' | 'output';
  tier: 'crawl' | 'queue' | 'scrape' | 'parse' | 'output';
  description: string;
  details: string[];
}
