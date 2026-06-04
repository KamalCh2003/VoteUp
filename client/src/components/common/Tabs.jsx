import clsx from 'clsx';

export default function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex gap-1 p-1 rounded-xl bg-[var(--glass)] border border-[var(--gb)] mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={clsx(
            'flex-1 py-2 rounded-lg text-xs font-medium transition',
            activeTab === tab.key
              ? 'bg-[var(--a)] text-white'
              : 'text-[var(--t2)] hover:text-[var(--t)]'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}