import { Hono } from "hono";
import { Env } from './core-utils';
import { TestResult } from '../src/types';
const USER_AGENT = 'Edge Inspector - Cloudflare Worker/1.0';
const createResult = (id: string, name: string, status: TestResult['status'], description: string, details: TestResult['details']): TestResult => ({
  id,
  name,
  status,
  description,
  details,
  icon: null as any,
});
// --- Core Test Implementations ---
const runHttpInspector = async (url: string): Promise<TestResult> => {
  const name = 'HTTP Inspector';
  try {
    const response = await fetch(url, { method: 'GET', redirect: 'manual', headers: { 'User-Agent': USER_AGENT } });
    const cfRay = response.headers.get('cf-ray') || 'N/A';
    const colo = response.cf?.colo || (cfRay !== 'N/A' && cfRay.includes('-') ? cfRay.split('-').pop() || 'N/A' : 'N/A');
    return createResult('http-inspector', name, 'ok', `Request completed with status ${response.status}.`, {
      url: response.url,
      status: response.status,
      http_protocol: response.cf?.httpProtocol || 'N/A',
      content_type: response.headers.get('content-type') || 'N/A',
      cf_ray: cfRay,
      colo: colo,
      server: response.headers.get('server') || 'N/A',
    });
  } catch (e) {
    return createResult('http-inspector', name, 'fail', 'Failed to fetch the URL.', { error: (e as Error).message });
  }
};
const runCacheHitMiss = async (url: string): Promise<TestResult> => {
  const name = 'Cache Hit/Miss';
  try {
    await fetch(url, { method: 'GET', headers: { 'User-Agent': USER_AGENT } }); // Prime cache
    const response = await fetch(url, { method: 'GET', headers: { 'User-Agent': USER_AGENT } });
    const cacheStatus = response.headers.get('cf-cache-status') || 'N/A';
    const status = cacheStatus === 'HIT' ? 'ok' : 'warning';
    const descriptions: Record<string, string> = {
      HIT: "Content was served directly from Cloudflare's cache.",
      MISS: "Content was not in cache and was fetched from the origin server.",
      DYNAMIC: "Content is not configured to be cached and was served from the origin.",
      BYPASS: "Caching was explicitly bypassed for this request.",
      EXPIRED: "Content was expired in cache and had to be revalidated with the origin.",
      STALE: "Stale content was served from cache while revalidating in the background.",
      REVALIDATED: "Content was revalidated with the origin and served from cache.",
      UPDATING: "Stale content was served while updating to a newer version in the background.",
    };
    const description = descriptions[cacheStatus] || `Cloudflare cache status: ${cacheStatus}.`;
    return createResult('cache-hit-miss', name, status, description, {
      cf_cache_status: cacheStatus,
      cf_ray: response.headers.get('cf-ray') || 'N/A',
      age: response.headers.get('age') || 'N/A',
      expires: response.headers.get('expires') || 'N/A',
      cache_control: response.headers.get('cache-control') || 'N/A',
      server: response.headers.get('server') || 'N/A',
      cf_team: response.headers.get('cf-team') === 'true' ? 'Yes' : 'No',
    });
  } catch (e) {
    return createResult('cache-hit-miss', name, 'fail', 'Failed to fetch the URL.', { error: (e as Error).message });
  }
};
const runDnsResolver = async (url: string): Promise<TestResult> => {
  const name = 'DNS Resolver';
  try {
    const hostname = new URL(url).hostname;
    const dohUrl = (type: string) => `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=${type}`;
    const fetchDns = async (type: string) => {
      const response = await fetch(dohUrl(type), { headers: { 'accept': 'application/dns-json' } });
      const data = await response.json() as { Answer?: { data: string }[] };
      return data.Answer?.map(a => a.data) || [];
    };
    const [a_records, aaaa_records, cname_records] = await Promise.all([fetchDns('A'), fetchDns('AAAA'), fetchDns('CNAME')]);
    const foundRecords = [a_records, aaaa_records, cname_records].some(r => r.length > 0);
    const description = foundRecords ? `Successfully resolved DNS records for ${hostname}.` : `No A, AAAA, or CNAME records found for ${hostname}.`;
    return createResult('dns-resolver', name, 'ok', description, {
      hostname,
      a_records: a_records,
      aaaa_records: aaaa_records,
      cname_records: cname_records,
    });
  } catch (e) {
    return createResult('dns-resolver', name, 'fail', 'Failed to resolve DNS.', { error: (e as Error).message });
  }
};
const runLatencyBenchmark = async (url: string): Promise<TestResult> => {
  const name = 'Latency Benchmark';
  try {
    const timings: number[] = [];
    for (let i = 0; i < 3; i++) {
      const start = Date.now();
      await fetch(url, { method: 'GET', headers: { 'User-Agent': USER_AGENT } });
      timings.push(Date.now() - start);
    }
    const average_ms = timings.reduce((a, b) => a + b, 0) / timings.length;
    const start = Date.now();
    const response = await fetch(url, { method: 'GET', headers: { 'User-Agent': USER_AGENT } });
    const ttfb_ms = Date.now() - start;
    await response.text(); // Consume the body to get total time
    const total_duration_ms = Date.now() - start;
    return createResult('latency-benchmark', name, 'ok', `Average latency: ${average_ms.toFixed(0)}ms.`, {
      test1: `${timings[0]}ms`,
      test2: `${timings[1]}ms`,
      test3: `${timings[2]}ms`,
      average_ms: `${average_ms.toFixed(0)}ms`,
      ttfb_ms: `${ttfb_ms}ms`,
      total_duration_ms: `${total_duration_ms}ms`,
      body_download_ms: `${total_duration_ms - ttfb_ms}ms`,
    });
  } catch (e) {
    return createResult('latency-benchmark', name, 'fail', 'Failed to measure latency.', { error: (e as Error).message });
  }
};
const runTlsSecurity = async (url: string): Promise<TestResult> => {
  const name = 'TLS / HTTPS Check';
  try {
    if (!url.startsWith('https://')) {
      return createResult('tls-security', name, 'warning', 'Test only applicable for HTTPS URLs.', {});
    }
    const hostname = new URL(url).hostname;
    const apiUrl = `https://check-tls.globalsign.com/api/v1/${hostname}`;
    const apiResponse = await fetch(apiUrl, { headers: { 'User-Agent': USER_AGENT, 'Host': 'check-tls.globalsign.com' } });
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      return createResult('tls-security', name, 'fail', `Failed to retrieve TLS info. API returned status ${apiResponse.status}.`, { error: errorText });
    }
    const data = await apiResponse.json() as any;
    if (data.status !== 'ok') {
      return createResult('tls-security', name, 'fail', 'API reported an issue with the TLS check.', {
        api_status: data.status,
        errors: data.errors || 'Unknown API error',
      });
    }
    const cert = data.response?.certificate;
    const tlsVersion = data.response?.tls_version;
    return createResult('tls-security', name, 'ok', `Successfully retrieved TLS and certificate information. TLS Version: ${tlsVersion}.`, {
      tls_version: tlsVersion || 'N/A',
      valid_certificate: cert ? '✓ Yes' : '✗ No',
      certificate_subject: cert?.subject?.common_name || 'N/A',
      certificate_issuer: cert?.issuer?.common_name || 'N/A',
      valid_from: cert?.valid_from ? new Date(cert.valid_from).toUTCString() : 'N/A',
      valid_to: cert?.valid_to ? new Date(cert.valid_to).toUTCString() : 'N/A',
    });
  } catch (e) {
    return createResult('tls-security', name, 'fail', 'Failed to establish a secure connection or parse API response.', {
      error: (e as Error).message,
      valid_certificate: '✗ No',
    });
  }
};
const runRedirectTest = async (url: string): Promise<TestResult> => {
  const name = 'Redirect Test';
  let currentUrl = url;
  const chain = [currentUrl];
  try {
    for (let i = 0; i < 10; i++) {
      const response = await fetch(currentUrl, { redirect: 'manual', headers: { 'User-Agent': USER_AGENT } });
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) return createResult('redirect-test', name, 'fail', 'Redirect response with no location header.', { chain });
        currentUrl = new URL(location, currentUrl).toString();
        if (chain.includes(currentUrl)) {
          chain.push(currentUrl + ' (Loop Detected)');
          return createResult('redirect-test', name, 'fail', 'Redirect loop detected.', { chain });
        }
        chain.push(currentUrl);
      } else {
        const count = chain.length - 1;
        const description = count > 0 ? `Followed ${count} redirects.` : 'No redirects found.';
        return createResult('redirect-test', name, 'ok', description, {
          final_status: response.status,
          final_url: currentUrl,
          redirects: count === 0 ? 'None' : `${count} redirect${count > 1 ? 's' : ''}`,
        });
      }
    }
    return createResult('redirect-test', name, 'fail', 'Exceeded maximum redirects (10).', { chain });
  } catch (e) {
    return createResult('redirect-test', name, 'fail', 'Failed during redirect test.', { error: (e as Error).message });
  }
};
const runSecurityHeaders = async (url: string): Promise<TestResult> => {
  const name = 'Security Headers';
  try {
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    const headers = response.headers;
    const checks = {
      strict_transport_security: headers.get('strict-transport-security') || 'N/A',
      content_security_policy: headers.get('content-security-policy') || 'N/A',
      x_frame_options: headers.get('x-frame-options') || 'N/A',
      x_content_type_options: headers.get('x-content-type-options') || 'N/A',
      referrer_policy: headers.get('referrer-policy') || 'N/A',
      x_xss_protection: headers.get('x-xss-protection') || 'N/A',
      permissions_policy: headers.get('permissions-policy') || 'N/A',
    };
    const missingCount = Object.values(checks).filter(v => v === 'N/A').length;
    const totalCount = Object.keys(checks).length;
    const presentCount = totalCount - missingCount;
    const status = missingCount === 0 ? 'ok' : 'warning';
    const description = `${presentCount}/${totalCount} recommended headers present.`;
    return createResult('security-headers', name, status, description, checks);
  } catch (e) {
    return createResult('security-headers', name, 'fail', 'Failed to check headers.', { error: (e as Error).message });
  }
};
const runResponseBody = async (url: string): Promise<TestResult> => {
  const name = 'Response Body';
  try {
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    const body = await response.arrayBuffer();
    const decoder = new TextDecoder('utf-8');
    const previewText = decoder.decode(body.slice(0, 1024));
    const truncatedPreview = previewText.substring(0, 100);
    return createResult('response-body', name, 'ok', `Response body size is ${body.byteLength} bytes.`, {
      size: `${body.byteLength} bytes`,
      preview: `${truncatedPreview}${previewText.length > 100 ? '...' : ''}`,
    });
  } catch (e) {
    return createResult('response-body', name, 'fail', 'Failed to analyze response body.', { error: (e as Error).message });
  }
};
const runRobotsSitemap = async (url: string): Promise<TestResult> => {
  const name = 'Robots.txt / Sitemap';
  try {
    const origin = new URL(url).origin;
    const robotsUrl = `${origin}/robots.txt`;
    const sitemapUrl = `${origin}/sitemap.xml`;
    const [robotsRes, sitemapRes] = await Promise.all([
      fetch(robotsUrl, { method: 'HEAD', headers: { 'User-Agent': USER_AGENT } }),
      fetch(sitemapUrl, { method: 'HEAD', headers: { 'User-Agent': USER_AGENT } }),
    ]);
    const robotsOk = robotsRes.ok;
    const sitemapOk = sitemapRes.ok;
    const robotsContentType = robotsRes.headers.get('content-type') || '';
    const sitemapContentType = sitemapRes.headers.get('content-type') || '';
    const isRobotsContentTypeCorrect = robotsContentType.includes('text/plain');
    const isSitemapContentTypeCorrect = sitemapContentType.includes('application/xml') || sitemapContentType.includes('text/xml');
    const details = {
      'robots.txt Found': robotsOk ? '✓ Yes' : '✗ No',
      'robots.txt Content-Type': robotsOk ? `${robotsContentType} (${isRobotsContentTypeCorrect ? 'Correct' : 'Incorrect'})` : 'N/A',
      'sitemap.xml Found': sitemapOk ? '✓ Yes' : '✗ No',
      'sitemap.xml Content-Type': sitemapOk ? `${sitemapContentType} (${isSitemapContentTypeCorrect ? 'Correct' : 'Incorrect'})` : 'N/A',
    };
    const issues: string[] = [];
    if (!robotsOk) issues.push('robots.txt not found');
    else if (!isRobotsContentTypeCorrect) issues.push('robots.txt has incorrect Content-Type');
    if (!sitemapOk) issues.push('sitemap.xml not found');
    else if (!isSitemapContentTypeCorrect) issues.push('sitemap.xml has incorrect Content-Type');
    const status = issues.length === 0 ? 'ok' : 'warning';
    const description = issues.length > 0 ? `Issues found: ${issues.join(', ')}.` : 'robots.txt and sitemap.xml appear to be correctly configured.';
    return createResult('robots-sitemap', name, status, description, details);
  } catch (e) {
    return createResult('robots-sitemap', name, 'fail', 'Failed to check for files.', { error: (e as Error).message });
  }
};
const runMixedContentTest = async (url: string): Promise<TestResult> => {
  const name = 'Mixed Content Test';
  try {
    if (!url.startsWith('https://')) {
      return createResult('mixed-content', name, 'warning', 'Test only applicable for HTTPS URLs.', {});
    }
    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
    const html = await response.text();
    const insecureMatches = html.matchAll(/(?:src|href)\s*=\s*["'](http:\/\/.*?)["']/gi);
    const insecureElements = Array.from(insecureMatches, match => match[0]);
    const count = insecureElements.length;
    const status = count > 0 ? 'fail' : 'ok';
    return createResult('mixed-content', name, status, `Found ${count} insecure elements.`, {
      insecure_elements_found: count,
      elements: insecureElements.slice(0, 10), // Show up to 10 examples
    });
  } catch (e) {
    return createResult('mixed-content', name, 'fail', 'Failed to scan for mixed content.', { error: (e as Error).message });
  }
};
const coreTestFunctions: Record<string, (url: string) => Promise<TestResult>> = {
  'http-inspector': runHttpInspector,
  'cache-hit-miss': runCacheHitMiss,
  'dns-resolver': runDnsResolver,
  'latency-benchmark': runLatencyBenchmark,
  'tls-security': runTlsSecurity,
  'redirect-test': runRedirectTest,
  'security-headers': runSecurityHeaders,
  'response-body': runResponseBody,
  'robots-sitemap': runRobotsSitemap,
  'mixed-content': runMixedContentTest,
};
export function userRoutes(app: Hono<{ Bindings: Env }>) {
  app.post('/api/test', async (c) => {
    try {
      const body = await c.req.json();
      const { url, coreTests = [] } = body;
      if (!url || !/^(https?:\/\/)/i.test(url)) {
        return c.json({ error: 'A valid URL starting with http:// or https:// is required.' }, 400);
      }
      const allPromises: Promise<TestResult>[] = [];
      coreTests.forEach((testId: string) => {
        if (coreTestFunctions[testId]) {
          allPromises.push(coreTestFunctions[testId](url));
        }
      });
      const results = await Promise.allSettled(allPromises);
      const finalResults = results.map(res => {
        if (res.status === 'fulfilled') {
          return res.value;
        }
        return createResult('unknown', 'Unknown Test', 'fail', 'Test runner failed.', { error: (res.reason as Error).message });
      });
      return c.json(finalResults);
    } catch (err) {
      console.error('Error in /api/test:', err);
      return c.json({ error: 'An internal error occurred.' }, 500);
    }
  });
}