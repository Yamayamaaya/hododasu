import { Link } from '@tanstack/react-router';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img 
              src="/logo.png" 
              alt="ホドダス" 
              className="h-8 sm:h-10 object-contain"
            />
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
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

