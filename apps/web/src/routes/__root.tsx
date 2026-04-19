import { createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Sentry from '@sentry/react';
import { Toaster } from 'sonner';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1">
          <Sentry.ErrorBoundary
            fallback={({ resetError }) => (
              <div className="flex flex-col items-center justify-center p-8">
                <h2 className="text-xl font-bold mb-4">エラーが発生しました</h2>
                <p className="text-muted-foreground mb-4">
                  予期しないエラーが発生しました。ページを再読み込みしてください。
                </p>
                <button
                  onClick={resetError}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  もう一度試す
                </button>
              </div>
            )}
          >
            <Outlet />
          </Sentry.ErrorBoundary>
        </main>
        <Footer />
      </div>
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  ),
});
