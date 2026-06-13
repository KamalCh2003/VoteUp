// src/components/common/Tabs.jsx
import clsx from 'clsx';

export default function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="flex gap-1 p-1 rounded-xl bg-white border border-gray-200 shadow-sm mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={clsx(
            'flex-1 py-2 rounded-lg text-xs font-medium transition',
            activeTab === tab.key
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}