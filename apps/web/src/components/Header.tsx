import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="ホドダス" className="h-8 sm:h-10 object-contain" />
          </Link>
          {/* Mobile: CTA button only */}
          <div className="sm:hidden">
            <Link to="/new">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                新規作成
              </Button>
            </Link>
          </div>
          {/* Desktop: full nav */}
          <nav className="hidden sm:flex items-center gap-4 sm:gap-6">
            <Link
              to="/"
              className="text-sm sm:text-base font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              トップ
            </Link>
            <Link
              to="/new"
              className="text-sm sm:text-base font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              新規作成
            </Link>
            <Link
              to="/how"
              className="text-sm sm:text-base font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              使い方
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
