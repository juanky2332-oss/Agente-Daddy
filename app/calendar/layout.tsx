import { BottomNav, Sidebar } from '@/components/Navigation';

export default function SharedLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="app-shell">
            <Sidebar />
            <main className="main-content">{children}</main>
            <BottomNav />
        </div>
    );
}
