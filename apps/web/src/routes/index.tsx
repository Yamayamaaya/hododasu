import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">Hododasu</h1>
        <p className="text-xl text-gray-600 mb-8">
          重み付き割り勘を簡単に計算し、LINEで個別送信
        </p>
        <div className="space-y-4">
          <Link
            to="/new"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            新規作成
          </Link>
          <div className="mt-8">
            <Link
              to="/how"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              計算方法について
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

