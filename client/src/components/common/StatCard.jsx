export default function StatCard({ icon, value, label, color }) {
  return (
    <div className="bg-[var(--glass)] border border-[var(--gb)] rounded-xl p-3 text-center">
      <div className="text-lg mb-1" style={{ color }}>{icon}</div>
      <div className="text-lg font-semibold" style={{ color }}>{value}</div>
      <div className="text-xs text-[var(--t2)] mt-1">{label}</div>
    </div>
  );
}