import { Main } from '@/components/main';
import { SignOutButton } from '@/components/shared/sign-out-button';
import { auth } from '@/lib/auth/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const DashboardPage = async () => {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
        redirect('/login');
    }

    return (
        <Main>
            <div className="flex w-full max-w-sm flex-col gap-4 rounded-3xl border border-border p-6 text-center">
                <div className="flex flex-col gap-1">
                    <h1 className="text-xl font-semibold">
                        You&apos;re authenticated 🎉
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Signed in as {session.user.name || session.user.email}.
                    </p>
                </div>
                <SignOutButton />
            </div>
        </Main>
    );
};

export default DashboardPage;
