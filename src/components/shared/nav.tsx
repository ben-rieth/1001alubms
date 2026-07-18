'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Disc3, Library } from 'lucide-react';
import type { ComponentType } from 'react';

import { cn } from '@/lib/utils';

type NavLink = {
    href: string;
    label: string;
    icon: ComponentType<{ className?: string }>;
};

const links: NavLink[] = [
    { href: '/currently-listening', label: 'Currently Listening', icon: Disc3 },
    { href: '/albums', label: 'Album Library', icon: Library },
];

export const Nav = () => {
    const pathname = usePathname();

    return (
        <nav className="flex flex-col gap-1 p-4">
            {links.map(({ href, label, icon: Icon }) => {
                const isActive =
                    pathname === href || pathname.startsWith(`${href}/`);

                return (
                    <Link
                        key={href}
                        href={href}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                            'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                            isActive && 'bg-accent text-accent-foreground',
                        )}
                    >
                        <Icon className="size-4 shrink-0" />
                        <span>{label}</span>
                    </Link>
                );
            })}
        </nav>
    );
};
