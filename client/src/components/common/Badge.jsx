export default function Badge({ children, color = 'violet', variant = 'soft' }) {
  const colorMap = {
    violet: { soft: 'bg-violet-100 text-violet-700', solid: 'bg-violet-600 text-white' },
    emerald: { soft: 'bg-emerald-100 text-emerald-700', solid: 'bg-emerald-600 text-white' },
    red: { soft: 'bg-red-100 text-red-700', solid: 'bg-red-600 text-white' },
    amber: { soft: 'bg-amber-100 text-amber-700', solid: 'bg-amber-600 text-white' },
    blue: { soft: 'bg-blue-100 text-blue-700', solid: 'bg-blue-600 text-white' },
    gray: { soft: 'bg-gray-100 text-gray-700', solid: 'bg-gray-600 text-white' },
  };
  const classes = colorMap[color]?.[variant] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${classes}`}>
      {children}
    </span>
  );
}