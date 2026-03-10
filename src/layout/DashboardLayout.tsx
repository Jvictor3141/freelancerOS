import type { PropsWithChildren } from 'react';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

export function DashboardLayout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-transparent text-slate-900">
      <div className="mx-auto flex max-w-[1600px]">
        <Sidebar />
        <div className="min-h-screen flex-1">
          <Header />
          <main className="px-5 py-6 sm:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
