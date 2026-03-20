import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ClipboardList, Calculator, Send } from 'lucide-react';
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
        {/* リピーター向け：すぐ始められるエリア */}
        <Card className="border-0 shadow-lg">
          <CardContent className="py-6 sm:py-8 space-y-4">
            <div className="flex justify-center">
              <img src="/logo.png" alt="ホドダス" className="h-14 sm:h-20 md:h-24 object-contain" />
            </div>
            <Link to="/new" className="block">
              <Button
                size="lg"
                className="w-full sm:w-auto text-sm sm:text-lg px-6 sm:px-8 py-4 sm:py-6"
              >
                割り勘を計算する
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* 初見向け：サービス説明エリア */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4 sm:pb-6">
            <h2 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight">
              割り勘の計算と連絡
              <br />
              もっと手軽に。
            </h2>
            <CardDescription className="text-sm sm:text-base md:text-lg text-muted-foreground px-2 pt-2">
              均等割りはもちろん、負担多め・少なめもOK。
              <br className="hidden sm:inline" />
              計算結果はLINEで一人ずつ送れます。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-3 gap-3 sm:gap-6 px-2 sm:px-4">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 text-primary">
                  <ClipboardList className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-xs sm:text-sm font-medium">金額/参加者を入力</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 text-primary">
                  <Calculator className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-xs sm:text-sm font-medium">自動で計算</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 text-primary">
                  <Send className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className="text-xs sm:text-sm font-medium">LINEで個別送信</span>
              </div>
            </div>
            <div className="pt-2">
              <Link to="/how">
                <Button variant="link" className="text-xs sm:text-base">
                  ※計算方法について
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {history.length > 0 && (
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">最近</CardTitle>
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
