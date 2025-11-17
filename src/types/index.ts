import { LucideIcon } from 'lucide-react';
export type TestStatus = 'ok' | 'warning' | 'fail' | 'pending';
export interface TestResult {
  id: string;
  name: string;
  status: TestStatus;
  description: string;
  details: Record<string, any>;
  icon: React.ElementType;
}
export interface TestDefinition {
  id: string;
  name: string;
  description: string;
}
export const CORE_TESTS: TestDefinition[] = [
  { id: 'http-inspector', name: 'HTTP Inspector', description: 'Inspects status, headers, and protocol.' },
  { id: 'cache-hit-miss', name: 'Cache Analysis', description: 'Checks cache-related headers.' },
  { id: 'dns-resolver', name: 'DNS Resolver', description: 'Performs DoH query for A/AAAA/CNAME records.' },
  { id: 'latency-benchmark', name: 'Latency Benchmark', description: 'Measures TTFB and fetch duration multiple times.' },
  { id: 'tls-security', name: 'TLS / HTTPS Check', description: 'Checks TLS version and certificate validity.' },
  { id: 'redirect-test', name: 'Redirect Test', description: 'Follows redirect chains and detects loops.' },
  { id: 'security-headers', name: 'Security Headers', description: 'Checks for HSTS, CSP, X-Frame-Options, etc.' },
  { id: 'response-body', name: 'Response Body', description: 'Analyzes the size of the response body.' },
  { id: 'robots-sitemap', name: 'Robots.txt / Sitemap', description: 'Checks for the existence of robots.txt and sitemap.xml.' },
  { id: 'mixed-content', name: 'Mixed Content Test', description: 'Scans for insecure http:// assets on an https:// page.' },
];