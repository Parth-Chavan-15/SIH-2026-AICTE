import React from 'react';
import { RefreshCw } from 'lucide-react';

export interface LoadingStateProps {
  title?: string;
  subtitle?: string;
  spinnerColor?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  title = 'Loading statutory applications docket…',
  subtitle = 'Retrieving tenant-isolated records from NIYAMSETU ledger',
  spinnerColor = 'text-blue-600',
  className = 'p-12 text-center'
}) => {
  return (
    <div className={className}>
      <RefreshCw className={`w-8 h-8 ${spinnerColor} animate-spin mx-auto mb-3`} />
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
};

export default LoadingState;
