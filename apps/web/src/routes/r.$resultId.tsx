import { createFileRoute } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { getSessionByResultId } from '../lib/api';

export const Route = createFileRoute('/r/$resultId')({
  component: ResultPage,
});

function ResultPage() {
  const { resultId } = Route.useParams();

  const { data: session, isLoading } = useQuery({
    queryKey: ['session', 'result', resultId],
    queryFn: () => getSessionByResultId(resultId),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">読み込み中...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">セッションが見つかりません</p>
          <a href="/" className="text-blue-600 hover:underline">
            トップに戻る
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h1 className="text-3xl font-bold mb-4">{session.title}</h1>
          <div className="text-gray-600 mb-6">
            合計金額:{' '}
            <span className="text-2xl font-bold text-gray-900">
              {session.totalAmount.toLocaleString()}円
            </span>
          </div>
        </div>

        {/* 計算結果表示 */}
        {session.participants.some((p) => p.shareAmount !== null) ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6">計算結果</h2>
            <div className="space-y-4">
              {session.participants.map((p) => {
                if (p.shareAmount === null) return null;
                return (
                  <div
                    key={p.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-lg">{p.name}</span>
                        <span className="text-gray-600 ml-2">(重み: {p.weight})</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {p.shareAmount.toLocaleString()}円
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="mt-6 pt-4 border-t-2 border-gray-300">
                <div className="flex justify-between text-xl font-bold">
                  <span>合計</span>
                  <span className="text-blue-600">
                    {session.participants
                      .reduce((sum, p) => sum + (p.shareAmount || 0), 0)
                      .toLocaleString()}
                    円
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
            計算結果がまだありません
          </div>
        )}
      </div>
    </div>
  );
}
