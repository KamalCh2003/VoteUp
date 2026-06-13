// src/components/common/StatCard.jsx
export default function StatCard({ icon, value, label, color }) {
  return (
    <div className="bg-white border border-gray-500 rounded-xl p-3 text-center shadow-sm">
      <div className="text-lg mb-1" style={{ color: color || '#6b7280' }}>{icon}</div>
      <div className="text-lg font-semibold" style={{ color: color || '#1f2937' }}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}