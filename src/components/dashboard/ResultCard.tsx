import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Loader, ChevronDown, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { TestResult } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
const statusConfig = {
  ok: {
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    borderColor: 'border-green-200 dark:border-green-800',
    label: 'OK',
  },
  warning: {
    icon: AlertTriangle,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    label: 'Warning',
  },
  fail: {
    icon: XCircle,
    color: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
    borderColor: 'border-red-200 dark:border-red-800',
    label: 'Fail',
  },
  pending: {
    icon: Loader,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    borderColor: 'border-gray-200 dark:border-gray-700',
    label: 'Pending',
  },
};
interface ResultCardProps {
  result: TestResult;
}
const formatDetailValue = (value: any) => {
  if (Array.isArray(value)) {
    if (value.length === 0) return 'None';
    if (value.every(item => typeof item === 'string')) {
      return (
        <ul className="list-disc list-inside space-y-1">
          {value.map((item, index) => (
            <li key={index} className="break-all">{item}</li>
          ))}
        </ul>
      );
    }
    return value.join(', ');
  }
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }
  if (value === '✓ Yes') {
    return <span className="flex items-center gap-1"><Check className="h-4 w-4 text-green-600 inline-block" /> Yes</span>;
  }
  if (value === '✗ No') {
    return <span className="flex items-center gap-1"><X className="h-4 w-4 text-red-600 inline-block" /> No</span>;
  }
  return value ?? 'N/A';
};
export function ResultCard({ result }: ResultCardProps) {
  const config = statusConfig[result.status];
  const Icon = result.icon;
  if (result.status === 'pending') {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-6 w-16 rounded-md" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mt-2" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </CardContent>
      </Card>
    );
  }
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Collapsible>
        <Card className={cn('transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4', config.borderColor)}>
          <CollapsibleTrigger className="w-full text-left">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 group">
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <CardTitle className="text-base font-semibold">{result.name}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn('font-semibold', config.color)}>{config.label}</Badge>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{result.description}</p>
            </CardContent>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-6 pb-4">
              <div className="mt-4 border-t border-border pt-4">
                <h4 className="text-sm font-semibold mb-2">Details</h4>
                <div className="grid grid-cols-1 gap-y-2 text-sm">
                  {Object.entries(result.details).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-sans text-foreground break-words">{formatDetailValue(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </motion.div>
  );
}