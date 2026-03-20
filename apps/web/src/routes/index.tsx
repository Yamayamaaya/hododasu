import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
    <div className="px-4 py-6 sm:py-10">
      <div className="text-center max-w-lg sm:max-w-2xl mx-auto w-full space-y-6">
        {/* Hero: CTA */}
        <section className="space-y-4 py-6 sm:py-8">
          <div className="flex justify-center">
            <img src="/logo.png" alt="ホドダス" className="h-12 sm:h-16 md:h-20 object-contain" />
          </div>
          <p className="text-sm text-muted-foreground">傾斜付き割り勘 &amp; LINE送信</p>
          <div className="sm:max-w-xs sm:mx-auto">
            <Link to="/new" className="block">
              <Button size="lg" className="w-full h-14 text-base font-bold rounded-xl">
                割り勘を計算する
              </Button>
            </Link>
          </div>
        </section>

        {/* 履歴（リピーター向け） */}
        {history.length > 0 && (
          <section>
            <h2 className="text-base font-semibold text-left mb-3">最近の割り勘</h2>
            <ul className="space-y-2">
              {history.map((item) => (
                <li key={`${item.type}-${item.id}`}>
                  <Link
                    to={item.path}
                    className="block border-l-2 border-primary bg-card rounded-lg shadow-sm p-3 min-h-[52px] hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Badge
                          variant={item.type === 'edit' ? 'default' : 'secondary'}
                          className="text-[10px] shrink-0"
                        >
                          {item.type === 'edit' ? '編集' : '結果'}
                        </Badge>
                        <span className="text-sm font-medium truncate">{item.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatDate(item.timestamp)}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* サービス説明（初見向け） */}
        <section className="bg-muted/20 rounded-xl p-4 sm:p-6 text-center">
          <h2 className="text-base sm:text-lg font-bold mb-1">
            割り勘の計算と連絡、もっと手軽に。
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mb-4">
            均等割りはもちろん、負担多め・少なめもOK。
            <br className="hidden sm:inline" />
            計算結果はLINEで一人ずつ送れます。
          </p>
          <div className="grid grid-cols-3 gap-3 sm:gap-6">
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-primary/10 text-primary">
                <ClipboardList className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[11px] sm:text-sm font-medium">金額/参加者を入力</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-primary/10 text-primary">
                <Calculator className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[11px] sm:text-sm font-medium">自動で計算</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center justify-center w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-primary/10 text-primary">
                <Send className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
              <span className="text-[11px] sm:text-sm font-medium">LINEで個別送信</span>
            </div>
          </div>
          <div className="mt-3">
            <Link to="/how">
              <Button variant="link" className="text-xs sm:text-sm">
                計算方法について
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
