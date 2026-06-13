// src/components/common/Button.jsx
import clsx from 'clsx';

export default function Button({ children, variant = 'primary', className, ...props }) {
  const base = 'px-4 py-2 rounded-full text-sm font-medium transition inline-flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-violet-600 text-white hover:bg-violet-700 shadow-sm',
    secondary: 'border border-gray-300 text-gray-700 hover:border-violet-500 hover:text-violet-600 bg-white',
    danger: 'bg-red-100 text-red-700 border border-red-200 hover:bg-red-200',
  };
  
  return (
    <button className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}