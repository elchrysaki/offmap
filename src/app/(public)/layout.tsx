import { BottomNav } from '@/components/shell/bottom-nav';
import { SiteFooter } from '@/components/shell/site-footer';
import { SiteHeader } from '@/components/shell/site-header';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="relative z-10 pb-16 md:pb-0" style={{ background: 'var(--paper)' }}>
        {children}
      </div>
      <SiteFooter />
      <BottomNav />
    </>
  );
}
