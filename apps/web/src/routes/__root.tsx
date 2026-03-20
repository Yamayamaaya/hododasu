import { createRootRoute, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: () => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={0}>
        <div className="min-h-screen flex flex-col bg-background">
          <Header />
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
        <Toaster position="top-center" richColors />
      </TooltipProvider>
    </QueryClientProvider>
  ),
});
