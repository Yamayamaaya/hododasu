import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

export const Route = createFileRoute('/how')({
  component: HowPage,
});

function HowPage() {
  return (
    <div className="py-4 sm:py-12 px-3 sm:px-4 bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        <Link to="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            トップに戻る
          </Button>
        </Link>

        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-4xl">計算方法について</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 sm:space-y-8">
            <section className="space-y-3 sm:space-y-4">
              <h2 className="text-xl sm:text-2xl font-semibold">傾斜付き割り勘の計算方法</h2>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Hododasuでは、各参加者に設定された「傾斜」に基づいて負担額を計算します。
              </p>
            </section>

            <section className="space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold">計算手順</h3>
              <ol className="list-decimal list-inside space-y-3 sm:space-y-4 text-sm sm:text-base text-foreground">
                <li className="leading-relaxed">
                  各参加者の基本負担額を計算します。
                  <div className="mt-2 sm:mt-3 ml-4 sm:ml-6 bg-muted/50 rounded-lg p-3 sm:p-4">
                    <code className="text-sm font-mono">
                      基本負担額 = (合計金額 × 参加者の傾斜) ÷ 全参加者の傾斜の合計
                    </code>
                  </div>
                </li>
                <li className="text-sm sm:text-base leading-relaxed">基本負担額の小数部を切り捨てます。</li>
                <li className="text-sm sm:text-base leading-relaxed">
                  切り捨て後の合計と元の合計金額の差（端数）を計算します。
                </li>
                <li className="text-sm sm:text-base leading-relaxed">
                  端数を、小数部が大きい順に各参加者に1円ずつ配布します。
                </li>
              </ol>
            </section>

            <section className="space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold">計算例</h3>
              <div className="bg-muted/50 rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <p className="text-sm sm:text-base font-semibold">例：合計金額 1,000円、参加者3人</p>
                  <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                    <li>参加者A: 傾斜 100</li>
                    <li>参加者B: 傾斜 200</li>
                    <li>参加者C: 傾斜 300</li>
                  </ul>
                  <div className="mt-3 sm:mt-4 space-y-2 text-xs sm:text-sm leading-relaxed">
                    <p>傾斜の合計: 600</p>
                    <p>参加者Aの基本負担額: (1,000 × 100) ÷ 600 = 166.66...円 → 切り捨て: 166円</p>
                    <p>参加者Bの基本負担額: (1,000 × 200) ÷ 600 = 333.33...円 → 切り捨て: 333円</p>
                    <p>参加者Cの基本負担額: (1,000 × 300) ÷ 600 = 500.00...円 → 切り捨て: 500円</p>
                    <p className="mt-2">切り捨て後の合計: 999円</p>
                    <p>端数: 1,000 - 999 = 1円</p>
                    <p className="mt-2 font-semibold">結果:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li>参加者A: 166円（小数部0.66...）</li>
                      <li>参加者B: 333円 + 1円 = 334円（小数部0.33...、端数配布）</li>
                      <li>参加者C: 500円（小数部0.00...）</li>
                    </ul>
                    <p className="mt-2 font-semibold">合計: 166 + 334 + 500 = 1,000円 ✓</p>
                  </div>
              </div>
            </section>

            <section className="space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold">傾斜について</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                傾斜は、各参加者の負担の割合を表します。傾斜が大きいほど、負担額も大きくなります。
                デフォルトは100で、全員が均等に負担する場合は全員の傾斜を100に設定してください。
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

