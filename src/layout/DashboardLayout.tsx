import type { PropsWithChildren } from 'react';
import { BottomNavigationBar } from '../components/navigation';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

export function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-400">
        <Sidebar />
        <div className="min-w-0 flex-1">
          <Header />
          <main className="px-4 py-5 pb-28 sm:px-6 lg:px-8 xl:pb-5">
            {children}
          </main>
        </div>
      </div>

      <BottomNavigationBar />
    </div>
  );
}
