import { AnimatePresence, motion } from 'framer-motion';
import { Server, Zap, Download, Trash2, FileJson, FileText } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { ResultCard } from './ResultCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';
export function ResultsPanel() {
  const isLoading = useDashboardStore((s) => s.isLoading);
  const results = useDashboardStore((s) => s.results);
  const error = useDashboardStore((s) => s.error);
  const url = useDashboardStore((s) => s.url);
  const protocol = useDashboardStore((s) => s.protocol);
  const clearResults = useDashboardStore((s) => s.clearResults);
  const handleExportJSON = () => {
    if (results.length === 0) return;
    const fullUrl = protocol + url;
    const dataStr = JSON.stringify({
      url: fullUrl,
      timestamp: new Date().toISOString(),
      results: results.map(({ icon, ...rest }) => rest),
    }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    const filename = `edge-inspector-results-${url.replace(/[^a-z0-9]/gi, '_')}-${new Date().getTime()}.json`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
    toast.success("Results exported to JSON.");
  };
  const handleExportCSV = () => {
    if (results.length === 0) return;
    const headers = ['Test ID', 'Test Name', 'Status', 'Description', 'Details'];
    const rows = results.map(r => [
      `"${r.id}"`,
      `"${r.name}"`,
      `"${r.status}"`,
      `"${r.description.replace(/"/g, '""')}"`,
      `"${JSON.stringify(r.details).replace(/"/g, '""')}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const filename = `edge-inspector-results-${url.replace(/[^a-z0-9]/gi, '_')}-${new Date().getTime()}.csv`;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Results exported to CSV.");
  };
  const isActionDisabled = isLoading || results.length === 0 || results.some(r => r.status === 'pending');
  const renderContent = () => {
    if (error) {
      return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Alert variant="destructive">
            <AlertTitle>An Error Occurred</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </motion.div>
      );
    }
    if (results.length === 0 && !isLoading) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center flex flex-col items-center justify-center h-full p-8 border-2 border-dashed rounded-lg"
        >
          <Server className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-2xl font-semibold">Welcome to Edge Inspector</h3>
          <p className="mt-2 text-muted-foreground max-w-md">
            Enter a URL and select tests from the control panel to begin your analysis. Results will appear here in real-time.
          </p>
        </motion.div>
      );
    }
    return (
      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {results.map((result) => (
            <ResultCard key={result.id} result={result} />
          ))}
        </AnimatePresence>
      </div>
    );
  };
  return (
    <div className="h-full">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Zap className="h-7 w-7 text-primary" />
          <h2 className="text-3xl font-bold font-display">Results Panel</h2>
        </div>
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" disabled={isActionDisabled}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently clear all test results from the panel. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={clearResults}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" disabled={isActionDisabled}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={handleExportJSON}>
                <FileJson className="mr-2 h-4 w-4" />
                <span>Export to JSON</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportCSV}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Export to CSV</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {renderContent()}
    </div>
  );
}