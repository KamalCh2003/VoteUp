// src/components/common/GlassCard.jsx
export default function GlassCard({ children, className, ...props }) {
  return (
    <div
      className={`bg-white/80 border border-gray-200 rounded-2xl p-5 backdrop-blur-sm shadow-sm ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
}