import { Play, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useDashboardStore } from '@/store/dashboardStore';
import { CORE_TESTS } from '@/types';
export function ControlPanel({ onStartTests }: { onStartTests: () => void }) {
  const url = useDashboardStore((s) => s.url);
  const selectedCoreTests = useDashboardStore((s) => s.selectedCoreTests);
  const toggleCoreTest = useDashboardStore((s) => s.toggleCoreTest);
  const selectAllCoreTests = useDashboardStore((s) => s.selectAllCoreTests);
  const deselectAllCoreTests = useDashboardStore((s) => s.deselectAllCoreTests);
  const isLoading = useDashboardStore((s) => s.isLoading);
  const isStartDisabled = !url || selectedCoreTests.size === 0 || isLoading;
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="h-5 w-5" /> Core Tests
          </CardTitle>
          <CardDescription>Select the diagnostics to run.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-end gap-4 mb-4">
            <Button variant="link" size="sm" onClick={selectAllCoreTests} disabled={isLoading} className="p-0 h-auto">
              Select All
            </Button>
            <Button variant="link" size="sm" onClick={deselectAllCoreTests} disabled={isLoading} className="p-0 h-auto text-destructive hover:text-destructive/80">
              Deselect All
            </Button>
          </div>
          <div className="space-y-4">
            {CORE_TESTS.map((test) => (
              <div key={test.id} className="flex items-start space-x-3">
                <Checkbox
                  id={`core-${test.id}`}
                  checked={selectedCoreTests.has(test.id)}
                  onCheckedChange={() => toggleCoreTest(test.id)}
                  disabled={isLoading}
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor={`core-${test.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {test.name}
                  </label>
                  <p className="text-sm text-muted-foreground">{test.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Button size="lg" className="w-full text-base" onClick={onStartTests} disabled={isStartDisabled}>
        <Play className="mr-2 h-5 w-5" />
        Start Tests
      </Button>
    </div>
  );
}