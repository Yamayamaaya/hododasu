import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="text-center max-w-2xl mx-auto w-full">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
          Hododasu
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 px-2">
          重み付き割り勘を簡単に計算し、LINEで個別送信
        </p>
        <div className="space-y-4">
          <Link
            to="/new"
            className="inline-block w-full sm:w-auto bg-blue-600 text-white px-6 sm:px-8 py-3 sm:py-3.5 rounded-lg text-base sm:text-lg font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation"
          >
            新規作成
          </Link>
          <div className="mt-6 sm:mt-8">
            <Link
              to="/how"
              className="text-blue-600 hover:text-blue-700 active:text-blue-800 underline text-sm sm:text-base"
            >
              計算方法について
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
