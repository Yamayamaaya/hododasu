import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

interface HelpTipProps {
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function HelpTip({ children, side = 'top' }: HelpTipProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        className="w-auto max-w-[240px] px-3 py-1.5 text-xs"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onPointerDownOutside={() => setOpen(false)}
      >
        {children}
      </PopoverContent>
    </Popover>
  );
}
