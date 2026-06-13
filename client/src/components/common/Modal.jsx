export default function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white backdrop-blur-sm">
      <div className="bg-[var(--bg3)] border border-[var(--gb)] rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-in fade-in zoom-in">
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="text-[var(--t3)] hover:text-[var(--t)] text-lg">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}