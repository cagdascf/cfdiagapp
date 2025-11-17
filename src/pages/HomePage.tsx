import { Shield, Heart, FileSearch, FileWarning } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { AppLayout } from '@/components/layout/AppLayout';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ControlPanel } from '@/components/dashboard/ControlPanel';
import { ResultsPanel } from '@/components/dashboard/ResultsPanel';
import { useDashboardStore } from '@/store/dashboardStore';
import { CORE_TESTS, TestResult } from '@/types';
import { runAllTests } from '@/services/apiService';
import {
  ShieldCheck,
  Network,
  Globe,
  Timer,
  Lock,
  ArrowRightLeft,
  FileText,
  Layers,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
const iconMap: { [key: string]: React.ElementType } = {
  'http-inspector': Network,
  'cache-hit-miss': Layers,
  'dns-resolver': Globe,
  'latency-benchmark': Timer,
  'tls-security': Lock,
  'redirect-test': ArrowRightLeft,
  'security-headers': ShieldCheck,
  'response-body': FileText,
  'robots-sitemap': FileSearch,
  'mixed-content': FileWarning,
};
export function HomePage() {
  const protocol = useDashboardStore((s) => s.protocol);
  const setProtocol = useDashboardStore((s) => s.setProtocol);
  const url = useDashboardStore((s) => s.url);
  const setUrl = useDashboardStore((s) => s.setUrl);
  const selectedCoreTests = useDashboardStore((s) => s.selectedCoreTests);
  const startTests = useDashboardStore((s) => s.startTests);
  const setResults = useDashboardStore((s) => s.setResults);
  const setError = useDashboardStore((s) => s.setError);
  const isLoading = useDashboardStore((s) => s.isLoading);
  const handleStartTests = async () => {
    if (!url) {
      toast.error('Please enter a URL to start the tests.');
      return;
    }
    const fullUrl = protocol + url;
    const initialPendingResults: TestResult[] = Array.from(selectedCoreTests).map(testId => {
      const testDef = CORE_TESTS.find(def => def.id === testId);
      return {
        id: testId,
        name: testDef?.name || 'Unknown Test',
        status: 'pending',
        description: 'Test is running...',
        details: {},
        icon: iconMap[testId] || Shield,
      };
    });
    startTests(initialPendingResults);
    toast.info('Starting tests...', { description: `Analyzing ${fullUrl}` });
    try {
      const finalResults = await runAllTests(fullUrl, Array.from(selectedCoreTests));
      const allFinalResultsWithIcons = finalResults.map(r => ({
        ...r,
        icon: iconMap[r.id] || Shield,
      }));
      setResults(allFinalResultsWithIcons);
      toast.success('All tests completed!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(errorMessage);
      toast.error('Failed to run tests', { description: errorMessage });
    }
  };
  return (
    <AppLayout>
      <ThemeToggle />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8 md:py-10 lg:py-12">
          <header className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <Shield className="h-10 w-10 text-primary" />
              <h1 className="text-5xl font-bold font-display tracking-tight">Edge Inspector</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              An interactive, real-time troubleshooting dashboard to diagnose website performance and security issues directly from the Cloudflare Edge.
            </p>
          </header>
          <section className="mb-12 max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Select
                    value={protocol}
                    onValueChange={(value: 'https://' | 'http://') => setProtocol(value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Protocol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="https://">https://</SelectItem>
                      <SelectItem value="http://">http://</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="url"
                    placeholder="example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isLoading}
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2 px-1">
                  Enter the domain and path you want to inspect.
                </p>
              </CardContent>
            </Card>
          </section>
          <main className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 xl:col-span-3">
              <ControlPanel onStartTests={handleStartTests} />
            </div>
            <div className="lg:col-span-8 xl:col-span-9">
              <ResultsPanel />
            </div>
          </main>
          <footer className="text-center mt-16 text-sm text-muted-foreground">
            <p className="flex items-center justify-center gap-1.5">
              Built with <Heart className="h-4 w-4 text-red-500" /> at Cloudflare
            </p>
          </footer>
        </div>
      </div>
      <Toaster richColors />
    </AppLayout>
  );
}