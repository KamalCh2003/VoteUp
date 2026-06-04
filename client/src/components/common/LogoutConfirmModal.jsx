import { LogOut, X } from 'lucide-react';

export default function LogoutConfirmModal({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-sm mx-4 bg-[#0B1020] border border-white/10 rounded-3xl shadow-2xl p-6 animate-in zoom-in-95">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/10 transition text-gray-400 hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/20">
            <LogOut size={24} className="text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Confirm Logout</h2>
          <p className="mt-2 text-sm text-gray-400">
            Are you sure you want to log out of your account?
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition flex items-center justify-center gap-2"
          >
            <LogOut size={16} />
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
}