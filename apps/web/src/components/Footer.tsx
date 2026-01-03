import { Link } from '@tanstack/react-router';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="ホドダス" 
              className="h-6 sm:h-8 object-contain opacity-70"
            />
          </div>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link
              to="/"
              className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              トップ
            </Link>
            <Link
              to="/new"
              className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              新規作成
            </Link>
            <Link
              to="/how"
              className="text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              使い方
            </Link>
          </nav>
          <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-right">
            © {new Date().getFullYear()} ホドダス. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

