import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSessionByResultId } from '../lib/api';
import { addViewHistory } from '../lib/history';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Home } from 'lucide-react';

export const Route = createFileRoute('/r/$resultId')({
  component: ResultPage,
});

function formatRoundingDigit(roundingDigit: number): string {
  if (roundingDigit === 0.1) return '0.1の位（1円単位）';
  if (roundingDigit === 1) return '1の位（10円単位）';
  if (roundingDigit === 10) return '10の位（100円単位）';
  if (roundingDigit === 100) return '100の位（1000円単位）';
  return `${roundingDigit}の位`;
}

function ResultPage() {
  const { resultId } = Route.useParams();

  const { data: session, isLoading } = useQuery({
    queryKey: ['session', 'result', resultId],
    queryFn: () => getSessionByResultId(resultId),
  });

  useEffect(() => {
    if (session) {
      addViewHistory({
        type: 'result',
        id: resultId,
        title: session.title || '無題のセッション',
        timestamp: Date.now(),
        path: `/r/${resultId}`,
      });
    }
  }, [session, resultId]);

  if (isLoading) {
    return (
      <div className="px-4 py-6 sm:py-10">
        <div className="max-w-lg sm:max-w-3xl mx-auto space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="px-4 py-6 sm:py-10">
        <div className="max-w-lg sm:max-w-3xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>セッションが見つかりません</span>
              <Link to="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Home className="h-4 w-4" />
                  トップに戻る
                </Button>
              </Link>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const totalShare = session.participants.reduce((sum, p) => sum + (p.shareAmount || 0), 0);
  const hasResults = session.participants.some((p) => p.shareAmount !== null);

  return (
    <div className="px-4 py-6 sm:py-10">
      <div className="max-w-lg sm:max-w-3xl mx-auto space-y-6">
        {/* Session header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">
            {session.title || '無題のセッション'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            合計: <span className="font-semibold text-foreground">{session.totalAmount.toLocaleString()}円</span>
          </p>
        </div>

        {hasResults ? (
          <section>
            <h2 className="text-base font-semibold mb-3">計算結果</h2>
            <div className="space-y-3">
              {session.participants.map((p) => {
                if (p.shareAmount === null) return null;
                const isOrganizer = p.name === '幹事';
                return (
                  <div
                    key={p.id}
                    className="bg-card rounded-xl shadow-sm border p-4"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base">{p.name}</span>
                        {!isOrganizer && (
                          <Badge variant="secondary" className="text-xs">
                            傾斜: {p.weight}
                          </Badge>
                        )}
                        {isOrganizer && (
                          <Badge variant="outline" className="text-xs">
                            幹事分
                          </Badge>
                        )}
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-primary">
                        {p.shareAmount.toLocaleString()}円
                      </div>
                    </div>
                    {isOrganizer && session.roundingMethod && session.roundingUnit && (
                      <div className="text-xs text-muted-foreground bg-muted/50 rounded p-2 mt-2">
                        {session.roundingMethod === 'round_up'
                          ? `※ 切り上げにより発生した差額を受け取ります（${formatRoundingDigit(session.roundingUnit)}）`
                          : session.roundingMethod === 'round_down'
                            ? `※ 切り下げにより発生した差額を負担します（${formatRoundingDigit(session.roundingUnit)}）`
                            : `※ 四捨五入により発生した差額を処理します（${formatRoundingDigit(session.roundingUnit)}）`}
                      </div>
                    )}
                  </div>
                );
              })}
              <div className="flex justify-between items-center border-t pt-3 mt-3 text-base font-bold">
                <span>合計</span>
                <span className="text-primary text-lg">
                  {totalShare.toLocaleString()}円
                </span>
              </div>
            </div>
          </section>
        ) : (
          <div className="text-center text-sm text-muted-foreground py-8">
            計算結果がまだありません
          </div>
        )}
      </div>
    </div>
  );
}
