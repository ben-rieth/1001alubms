import Image from 'next/image';

import { cn } from '@/lib/utils';

type AlbumArtworkProps = {
    coverUrl?: string | null;
    title: string;
    year: number;
    className?: string;
};

const hatch =
    'repeating-linear-gradient(135deg, color-mix(in oklch, var(--foreground) 8%, transparent) 0 1px, transparent 1px 11px)';

export const AlbumArtwork = ({
    coverUrl,
    title,
    year,
    className,
}: AlbumArtworkProps) => {
    return (
        <div
            className={cn(
                'relative aspect-square w-full overflow-hidden border border-border bg-card',
                className,
            )}
        >
            {coverUrl ? (
                <Image
                    src={coverUrl}
                    alt={`Cover art for ${title}`}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 480px"
                    className="object-cover"
                />
            ) : (
                <div
                    className="absolute inset-0"
                    style={{ backgroundImage: hatch }}
                    aria-hidden
                >
                    <span className="absolute top-4 left-4 font-mono text-xs tracking-[0.2em] text-primary uppercase">
                        1001 Albums
                    </span>
                    <span className="absolute inset-0 flex items-center justify-center font-serif text-8xl leading-none text-foreground/10">
                        {year}
                    </span>
                    <span className="absolute bottom-4 left-4 font-mono text-xs tracking-[0.2em] text-muted-foreground uppercase">
                        [ Album Art ]
                    </span>
                </div>
            )}
        </div>
    );
};
