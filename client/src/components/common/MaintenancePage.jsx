import { AlertTriangle, Clock } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-6">
          <AlertTriangle size={40} className="text-amber-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">We'll be back soon</h1>
        <p className="text-gray-600 mb-4">
          The site is currently under maintenance. Please check back later.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
          <Clock size={16} />
          <span>We're working on improvements</span>
        </div>
      </div>
    </div>
  );
}