import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/')({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-4 sm:py-8 bg-gradient-to-br from-background to-muted/20">
      <div className="text-center max-w-2xl mx-auto w-full">
        <Card className="border-0 shadow-lg">
          <CardHeader className="space-y-3 sm:space-y-4 pb-4 sm:pb-6">
            <CardTitle className="text-2xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Hododasu
            </CardTitle>
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
      </div>
    </div>
  );
}
