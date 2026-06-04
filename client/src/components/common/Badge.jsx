export default function Badge({ children, color = 'var(--a)', bg }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ color, background: bg || `${color}20` }}>
      {children}
    </span>
  );
}