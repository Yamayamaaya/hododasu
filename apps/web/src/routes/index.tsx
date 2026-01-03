import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getViewHistory, ViewHistory } from '../lib/history';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  const [history, setHistory] = useState<ViewHistory[]>([]);

  useEffect(() => {
    setHistory(getViewHistory());
  }, []);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'たった今';
    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;

    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex items-center justify-center px-3 sm:px-4 py-4 sm:py-8 bg-gradient-to-br from-background to-muted/20">
      <div className="text-center max-w-2xl mx-auto w-full space-y-4 sm:space-y-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-3 sm:space-y-4 pb-4 sm:pb-6">
            <div className="flex justify-center mb-2 sm:mb-4">
              <img src="/logo.png" alt="ホドダス" className="h-16 sm:h-24 md:h-32 object-contain" />
            </div>
            <CardDescription className="text-sm sm:text-lg md:text-xl text-muted-foreground px-2">
              傾斜付き割り勘を簡単に計算し、LINEで個別送信
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            <Link to="/new" className="block">
              <Button
                size="lg"
                className="w-full sm:w-auto text-sm sm:text-lg px-6 sm:px-8 py-4 sm:py-6"
              >
                新規作成
              </Button>
            </Link>
            <div className="pt-3 sm:pt-4">
              <Link to="/how">
                <Button variant="link" className="text-xs sm:text-base">
                  計算方法について
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {history.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">最近の閲覧</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-left">
                {history.map((item) => (
                  <li key={`${item.type}-${item.id}`}>
                    <Link
                      to={item.path}
                      className="block p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground">
                              {item.type === 'edit' ? '編集' : '結果'}
                            </span>
                            <span className="text-sm sm:text-base font-medium truncate">
                              {item.title}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(item.timestamp)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
