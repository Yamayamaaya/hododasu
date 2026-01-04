import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
                <li className="text-sm sm:text-base leading-relaxed">
                  各参加者の基本負担額を、指定した端数処理方法（切り上げ/切り下げ/四捨五入）と「処理する位（桁）」（デフォルト:
                  0.1の位）で処理します。
                </li>
                <li className="text-sm sm:text-base leading-relaxed">
                  端数処理後の合計と元の合計金額の差（端数）を計算します。
                </li>
                <li className="text-sm sm:text-base leading-relaxed">
                  端数は「幹事分」として自動的に処理されます。
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>切り上げの場合: 幹事が差額を受け取ります（負担額が減ります）</li>
                    <li>切り下げの場合: 幹事が差額を負担します（負担額が増えます）</li>
                    <li>四捨五入の場合: 差額が発生した場合は幹事が処理します</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section className="space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold">計算例</h3>
              <div className="bg-muted/50 rounded-lg p-4 sm:p-6 space-y-3 sm:space-y-4">
                <p className="text-sm sm:text-base font-semibold">
                  例：合計金額 1,000円、参加者3人、端数処理: 四捨五入、位: 0.1の位（= 1円単位）
                </p>
                <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm">
                  <li>参加者A: 傾斜 100</li>
                  <li>参加者B: 傾斜 200</li>
                  <li>参加者C: 傾斜 300</li>
                </ul>
                <div className="mt-3 sm:mt-4 space-y-2 text-xs sm:text-sm leading-relaxed">
                  <p>傾斜の合計: 600</p>
                  <p>参加者Aの基本負担額: (1,000 × 100) ÷ 600 = 166.66...円</p>
                  <p>参加者Bの基本負担額: (1,000 × 200) ÷ 600 = 333.33...円</p>
                  <p>参加者Cの基本負担額: (1,000 × 300) ÷ 600 = 500.00...円</p>
                  <p className="mt-2">0.1の位で四捨五入（= 1円単位）:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>参加者A: 166.66... → 167円</li>
                    <li>参加者B: 333.33... → 333円</li>
                    <li>参加者C: 500.00... → 500円</li>
                  </ul>
                  <p className="mt-2">四捨五入後の合計: 167 + 333 + 500 = 1,000円</p>
                  <p className="mt-2 font-semibold">結果:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>参加者A: 167円（端数処理後）</li>
                    <li>参加者B: 333円（端数処理後）</li>
                    <li>参加者C: 500円（端数処理後）</li>
                    <li>幹事: 0円（差額なし）</li>
                  </ul>
                  <p className="mt-2 font-semibold">合計: 167 + 333 + 500 = 1,000円 ✓</p>
                </div>
              </div>
            </section>

            <section className="space-y-3 sm:space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold">端数処理について</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                端数処理方法は、各参加者の基本負担額をどのように処理するかを指定します。
              </p>
              <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-muted-foreground ml-4">
                <li>
                  <strong>切り上げ</strong>:
                  指定した位で切り上げます。端数が発生した場合、幹事が差額を受け取ります（負担額が減ります）。
                </li>
                <li>
                  <strong>切り下げ</strong>:
                  指定した位で切り下げます。端数が発生した場合、幹事が差額を負担します（負担額が増えます）。
                </li>
                <li>
                  <strong>四捨五入</strong>:
                  指定した位で四捨五入します。端数が発生した場合、幹事が処理します（デフォルト）。
                </li>
              </ul>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-3">
                端数処理の位は、処理する「位（桁）」を選択します（0.1 / 1 / 10 / 100）。
                例えば、10を指定すると「10の位」で処理され（=100円単位に丸まる）、0.1を指定すると「0.1の位」で処理されます（=1円単位）。
                デフォルトは 0.1 の位です。
              </p>
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
