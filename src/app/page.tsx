import { headers } from 'next/headers';
import Link from 'next/link';

import { Main } from '@/components/main';
import { buttonVariants } from '@/components/ui/button';
import { auth } from '@/lib/auth/server';
import { SignOutButton } from '@/components/shared/sign-out-button';

const Home = async () => {
    const session = await auth.api.getSession({ headers: await headers() });

    if (session) {
        return (
            <Main>
                <div className="flex w-full max-w-sm flex-col gap-4 rounded-3xl border border-border p-6 text-center">
                    <div className="flex flex-col gap-1">
                        <h1 className="text-xl font-semibold">
                            You&apos;re authenticated 🎉
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Signed in as{' '}
                            {session.user.name || session.user.email}.
                        </p>
                    </div>
                    <SignOutButton />
                </div>
            </Main>
        );
    }

    return (
        <Main>
            <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        1001 Albums
                    </h1>
                    <p className="text-muted-foreground">
                        Track your journey through the 1001 Albums You Must Hear
                        Before You Die.
                    </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Link href="/register" className={buttonVariants()}>
                        Get Started
                    </Link>
                    <Link
                        href="/login"
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        </Main>
    );
};

export default Home;
