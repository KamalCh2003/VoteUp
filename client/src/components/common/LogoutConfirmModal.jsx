// src/components/common/LogoutConfirmModal.jsx
import { LogOut, X } from 'lucide-react';

export default function LogoutConfirmModal({ open, onClose, onConfirm }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-sm mx-4 bg-white border border-gray-200 rounded-3xl shadow-xl p-6 animate-in zoom-in-95">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 transition text-gray-500 hover:text-gray-700"
        >
          <X size={18} />
        </button>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 border border-red-200">
            <LogOut size={24} className="text-red-600" />
          </div>

          <h2 className="text-lg font-semibold text-gray-800">
            Confirm Logout
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Are you sure you want to log out of your account?
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-sm"
          >
            <LogOut size={16} />
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
}