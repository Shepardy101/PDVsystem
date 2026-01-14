
import React, { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 rounded-lg focus:outline-none disabled:opacity-30 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]";
  
  const variants = {
    primary: "bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20 hover:border-accent ",
    secondary: "bg-white/5 text-slate-300 border border-white/10 hover:border-accent/50 hover:text-accent",
    danger: "bg-red-500/5 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white",
    ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3.5 text-base"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="mr-2 opacity-80">{icon}</span>}
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
}

// Wrap Input with forwardRef to allow passing a ref to the internal input element
export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, icon, className = '', ...props }, ref) => {
  return (
    <div className="w-full space-y-2">
      {label && <label className="block text-[10px] uppercase tracking-widest font-semibold text-slate-500 ml-1">{label}</label>}
      <div className="relative group">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-accent transition-colors">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`w-full bg-dark-900/40 border border-white/5 rounded-lg py-3 ${icon ? 'pl-10' : 'px-4'} pr-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-accent/40 focus:ring-4 focus:ring-accent/5 transition-all font-sans ${className}`}
          {...props}
        />
      </div>
    </div>
  );
});

Input.displayName = 'Input';

interface SwitchProps {
  enabled: boolean;
  onChange: (val: boolean) => void;
  label?: string;
}

export const Switch: React.FC<SwitchProps> = ({ enabled, onChange, label }) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      {label && <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-300 transition-colors">{label}</span>}
      <div 
        onClick={() => onChange(!enabled)}
        className={`relative w-10 h-5 rounded-full transition-all duration-300 border ${enabled ? 'bg-accent/20 border-accent/40' : 'bg-white/5 border-white/10'}`}
      >
        <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full transition-all duration-300 ${enabled ? 'left-6 bg-accent shadow-[0_0_8px_#00e0ff]' : 'left-1 bg-slate-600'}`} />
      </div>
    </label>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = 'lg' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-dark-950/70 backdrop-blur-md" onClick={onClose} />
      <div className={`relative glass-panel rounded-2xl w-full ${sizeClasses[size]} shadow-glass animate-in zoom-in-95 duration-300 flex flex-col max-h-[95vh] overflow-hidden`}>
        <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0">
          <h3 className="text-lg font-medium text-slate-200 tracking-tight">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 min-h-0">
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-white/5 bg-white/2 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`glass-card rounded-xl p-5 hover:border-white/10 transition-all duration-300 ${className}`}>
    {children}
  </div>
);

export const Badge: React.FC<{ variant?: 'success' | 'warning' | 'danger' | 'info'; children: React.ReactNode }> = ({ variant = 'info', children }) => {
  const styles = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border-red-500/20',
    info: 'bg-accent/10 text-accent border-accent/20'
  };
  return (
    <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${styles[variant]}`}>
      {children}
    </span>
  );
};
