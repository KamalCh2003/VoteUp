export default function SearchBox({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative mb-4">
      <i className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--t3)] text-sm">🔍</i>
      <input
        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--gb)] bg-[var(--glass)] text-sm text-[var(--t)] placeholder-[var(--t3)] focus:border-[var(--a)] outline-none transition"
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}