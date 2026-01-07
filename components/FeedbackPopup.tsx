import React from 'react';
import { Check, AlertCircle, Info, Loader2, X } from 'lucide-react';

interface PopupAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

interface FeedbackPopupProps {
  open: boolean;
  type?: 'success' | 'error' | 'info' | 'loading';
  title: string;
  message?: string;
  icon?: React.ReactNode;
  actions?: PopupAction[];
  onClose: () => void;
}

const iconMap = {
  success: <Check size={32} className="text-emerald-500" />,
  error: <AlertCircle size={32} className="text-red-500" />,
  info: <Info size={32} className="text-accent" />,
  loading: <Loader2 size={32} className="text-accent animate-spin" />,
};

export const FeedbackPopup: React.FC<FeedbackPopupProps> = ({
  open,
  type = 'info',
  title,
  message,
  icon,
  actions = [],
  onClose,
}) => {
  const [visible, setVisible] = React.useState(open);
  React.useEffect(() => {
    if (open) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 400); // Wait for fade-out animation
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setVisible(false);
    }
  }, [open, onClose]);

  if (!visible) return null;
  return (
    <div className={`fixed bottom-8 right-8 z-[200] cyber-toast bg-dark-900/90 border border-accent/20 rounded-2xl p-6 shadow-lg max-w-sm backdrop-blur-xl transition-all duration-500 ${open ? 'animate-in slide-in-from-right-10 opacity-100' : 'animate-out slide-out-to-right-10 opacity-0'}`}> 
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : type === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-accent/10 text-accent'}`}>
          {icon || iconMap[type]}
        </div>
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-widest assemble-text">{title}</h4>
          {message && <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-tight">{message}</p>}
        </div>
      </div>
      {actions && actions.length > 0 && (
        <div className="flex gap-3 w-full justify-center mt-4">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className={`px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow ${
                action.variant === 'danger'
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : action.variant === 'secondary'
                  ? 'bg-slate-700 text-white hover:bg-accent/20'
                  : action.variant === 'ghost'
                  ? 'bg-transparent text-slate-300 hover:bg-accent/10'
                  : 'bg-accent text-white hover:bg-accent/80'
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
      <div className={`absolute bottom-0 left-0 h-1 ${type === 'success' ? 'bg-emerald-500/40' : type === 'error' ? 'bg-red-500/40' : 'bg-accent/40'} border-animation`} />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-500 hover:text-accent p-2"
        title="Fechar"
      >
        <X size={20} />
      </button>
    </div>
  );
};
