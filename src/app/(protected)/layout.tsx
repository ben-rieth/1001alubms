import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Disc3 } from 'lucide-react';
import { ReactNode, Suspense } from 'react';

import { Nav } from '@/components/shared/nav';
import { SignOutButton } from '@/components/shared/sign-out-button';

const ProtectedLayout = ({ children }: { children: ReactNode }) => {
    return (
        <Suspense fallback={<ProtectedLayoutFallback />}>
            <AuthedShell>{children}</AuthedShell>
        </Suspense>
    );
};

const AuthedShell = async ({ children }: { children: ReactNode }) => {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
        redirect('/login');
    }

    return (
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
                <Link
                    href="/currently-listening"
                    className="flex items-center gap-2 font-semibold tracking-tight"
                >
                    <Disc3 className="size-5 text-primary" />
                    <span>1001 Albums Project</span>
                </Link>
                <div className="flex items-center gap-4">
                    <span className="hidden text-sm text-muted-foreground sm:inline">
                        {session.user.name || session.user.email}
                    </span>
                    <SignOutButton />
                </div>
            </header>
            <div className="flex flex-1">
                <aside className="w-60 shrink-0 border-r border-border">
                    <Nav />
                </aside>
                <div className="flex-1 min-w-0">{children}</div>
            </div>
        </div>
    );
};

const ProtectedLayoutFallback = () => (
    <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur">
            <div className="flex items-center gap-2 font-semibold tracking-tight">
                <Disc3 className="size-5 text-primary" />
                <span>1001 Albums Project</span>
            </div>
        </header>
        <div className="flex flex-1">
            <aside className="w-60 shrink-0 border-r border-border" />
        </div>
    </div>
);

export default ProtectedLayout;
