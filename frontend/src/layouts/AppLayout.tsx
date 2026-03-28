import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import TopNavbar from '@/components/TopNavbar';
import PageTransition from '@/components/PageTransition';

interface AppLayoutProps {
  title?: string;
  subtitle?: string;
}

export default function AppLayout({ title, subtitle }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar title={title} subtitle={subtitle} />
        <main className="flex-1 overflow-y-auto">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
