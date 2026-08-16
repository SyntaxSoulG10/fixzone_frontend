import Link from 'next/link';
import { FiLock } from 'react-icons/fi';

export default function AccessDenied() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiLock className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-500 mb-6">
          You do not have permission to view this page. If you believe this is an error, please contact an administrator.
        </p>
        <Link 
          href="/dashboard"
          className="inline-block bg-[#FF8C42] hover:bg-[#F97316] text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
