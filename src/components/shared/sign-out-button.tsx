'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth/client';
import { toast } from 'sonner';

export const SignOutButton = () => {
    const router = useRouter();
    const [isSigningOut, setIsSigningOut] = useState(false);

    return (
        <Button
            variant="outline"
            disabled={isSigningOut}
            onClick={async () => {
                setIsSigningOut(true);
                const { error } = await authClient.signOut();

                if (error) {
                    toast.error('Failed to sign out.');
                    setIsSigningOut(false);
                    return;
                }

                router.refresh();
            }}
        >
            {isSigningOut ? 'Signing out…' : 'Sign out'}
        </Button>
    );
};
