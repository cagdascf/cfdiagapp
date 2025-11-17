import { TestResult } from '@/types';
export const runAllTests = async (fullUrl: string, coreTests: string[]): Promise<TestResult[]> => {
  const response = await fetch('/api/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      url: fullUrl,
      coreTests: coreTests,
    }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: `API request failed with status ${response.status}` }));
    throw new Error(errorData.error || `API request failed with status ${response.status}`);
  }
  const finalResults: TestResult[] = await response.json();
  return finalResults;
};