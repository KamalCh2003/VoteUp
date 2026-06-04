export default function GlassCard({ children, className, ...props }) {
  return (
    <div className={`bg-[var(--glass)] border border-[var(--gb)] rounded-2xl p-5 backdrop-blur-lg ${className || ''}`} {...props}>
      {children}
    </div>
  );
}