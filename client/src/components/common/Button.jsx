import clsx from 'clsx';

export default function Button({ children, variant = 'primary', className, ...props }) {
  const base = 'px-4 py-2 rounded-full text-sm font-medium transition';
  const variants = {
    primary: 'bg-[var(--a)] text-white hover:opacity-90',
    secondary: 'border border-[var(--gb)] text-[var(--t)] hover:border-[var(--a)]',
    danger: 'bg-[var(--a3bg)] text-[var(--a3)] border border-[var(--a3)]/30',
  };
  return <button className={clsx(base, variants[variant], className)} {...props}>{children}</button>;
}