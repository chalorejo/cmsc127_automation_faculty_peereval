import React from 'react';
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const icons = {
  info: <Info className="w-5 h-5 text-slate-900" />,
  success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  error: <XCircle className="w-5 h-5 text-rose-500" />,
};

const actionColors = {
  info: 'text-slate-900',
  success: 'text-slate-900',
  warning: 'text-slate-900',
  error: 'text-rose-500',
};

const Toast = ({ type = 'info', title, message, actionText = 'Action', onAction, onClose }) => {
  return (
    <div className="flex bg-white rounded-lg shadow-lg border border-slate-100 overflow-hidden min-w-[320px] max-w-[400px]">
      <div className="flex-1 flex items-start gap-3 p-4">
        <div className="mt-0.5 flex-shrink-0">
          {icons[type]}
        </div>
        <div className="flex flex-col gap-1 min-w-0">
          <h4 className="font-semibold text-sm text-slate-900 leading-tight">
            {title || type.charAt(0).toUpperCase() + type.slice(1)}
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            {message || 'The quick brown fox jumps over a lazy dog.'}
          </p>
        </div>
      </div>
      
      <div className="flex flex-col border-l border-slate-100 w-[80px]">
        <button
          onClick={onAction}
          className={cn(
            "flex-1 px-3 text-xs font-medium hover:bg-slate-50 transition-colors border-b border-slate-100",
            actionColors[type]
          )}
        >
          {actionText}
        </button>
        <button
          onClick={onClose}
          className="flex-1 px-3 text-xs font-medium text-slate-500 hover:bg-slate-50 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default Toast;
