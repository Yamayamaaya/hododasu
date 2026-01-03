import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/how')({
  component: HowPage,
});

function HowPage() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <a href="/" className="text-blue-600 hover:underline">
            ← トップに戻る
          </a>
        </div>

        <h1 className="text-3xl font-bold mb-8">計算方法について</h1>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">重み付き割り勘の計算方法</h2>
            <p className="text-gray-700 mb-4">
              Hododasuでは、各参加者に設定された「重み」に基づいて負担額を計算します。
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">計算手順</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>
                各参加者の基本負担額を計算します。
                <div className="ml-6 mt-2 p-3 bg-gray-50 rounded">
                  <code>
                    基本負担額 = (合計金額 × 参加者の重み) ÷ 全参加者の重みの合計
                  </code>
                </div>
              </li>
              <li>
                基本負担額の小数部を切り捨てます。
              </li>
              <li>
                切り捨て後の合計と元の合計金額の差（端数）を計算します。
              </li>
              <li>
                端数を、小数部が大きい順に各参加者に1円ずつ配布します。
              </li>
            </ol>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">計算例</h3>
            <div className="bg-gray-50 rounded p-4">
              <p className="mb-2 font-semibold">例：合計金額 1,000円、参加者3人</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>参加者A: 重み 1</li>
                <li>参加者B: 重み 2</li>
                <li>参加者C: 重み 3</li>
              </ul>
              <div className="mt-4 space-y-2 text-sm">
                <p>重みの合計: 6</p>
                <p>参加者Aの基本負担額: (1,000 × 1) ÷ 6 = 166.66...円 → 切り捨て: 166円</p>
                <p>参加者Bの基本負担額: (1,000 × 2) ÷ 6 = 333.33...円 → 切り捨て: 333円</p>
                <p>参加者Cの基本負担額: (1,000 × 3) ÷ 6 = 500.00...円 → 切り捨て: 500円</p>
                <p className="mt-2">切り捨て後の合計: 999円</p>
                <p>端数: 1,000 - 999 = 1円</p>
                <p className="mt-2 font-semibold">結果:</p>
                <ul className="list-disc list-inside ml-4">
                  <li>参加者A: 166円（小数部0.66...）</li>
                  <li>参加者B: 333円 + 1円 = 334円（小数部0.33...、端数配布）</li>
                  <li>参加者C: 500円（小数部0.00...）</li>
                </ul>
                <p className="mt-2 font-semibold">合計: 166 + 334 + 500 = 1,000円 ✓</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3">重みについて</h3>
            <p className="text-gray-700">
              重みは、各参加者の負担の割合を表します。重みが大きいほど、負担額も大きくなります。
              デフォルトは1で、全員が均等に負担する場合は全員の重みを1に設定してください。
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

