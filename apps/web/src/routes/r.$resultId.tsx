import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSessionByResultId } from '../lib/api';
import { addViewHistory } from '../lib/history';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Home } from 'lucide-react';

export const Route = createFileRoute('/r/$resultId')({
  component: ResultPage,
});

function ResultPage() {
  const { resultId } = Route.useParams();

  const { data: session, isLoading } = useQuery({
    queryKey: ['session', 'result', resultId],
    queryFn: () => getSessionByResultId(resultId),
  });

  // セッション情報が取得できたら履歴に追加
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
      <div className="py-4 sm:py-12 px-3 sm:px-4 bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="py-4 sm:py-12 px-3 sm:px-4 bg-gradient-to-br from-background to-muted/20">
        <div className="max-w-4xl mx-auto">
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
    <div className="py-4 sm:py-12 px-3 sm:px-4 bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-4xl">{session.title || '無題のセッション'}</CardTitle>
            <CardDescription className="text-sm sm:text-lg">
              合計金額:{' '}
              <span className="text-xl sm:text-2xl font-bold text-primary">
                {session.totalAmount.toLocaleString()}円
              </span>
            </CardDescription>
          </CardHeader>
        </Card>

        {hasResults ? (
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">計算結果</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              {session.participants.map((p) => {
                if (p.shareAmount === null) return null;
                return (
                  <div key={p.id} className="bg-muted/30 hover:bg-muted/50 transition-colors rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-base sm:text-lg">{p.name}</span>
                          <Badge variant="secondary" className="text-xs">傾斜: {p.weight}</Badge>
                        </div>
                        <div className="text-xl sm:text-3xl font-bold text-primary">
                          {p.shareAmount.toLocaleString()}円
                        </div>
                      </div>
                  </div>
                );
              })}
              <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t">
                <div className="flex justify-between items-center text-lg sm:text-xl font-bold">
                  <span>合計</span>
                  <span className="text-primary text-xl sm:text-2xl">
                    {totalShare.toLocaleString()}円
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg border-0">
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-center text-sm sm:text-base text-muted-foreground py-6 sm:py-8">
                計算結果がまだありません
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
