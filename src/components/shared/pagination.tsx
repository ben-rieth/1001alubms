import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PaginationProps = {
    page: number;
    pageCount: number;
    /** Builds the href for a given page number. */
    hrefForPage: (page: number) => string;
};

/** Returns page numbers to show, with `null` marking a gap ("..."). */
const buildRange = (page: number, pageCount: number): (number | null)[] => {
    const pages = new Set<number>([1, pageCount, page, page - 1, page + 1]);
    const sorted = [...pages]
        .filter((p) => p >= 1 && p <= pageCount)
        .sort((a, b) => a - b);

    const range: (number | null)[] = [];
    let previous = 0;
    for (const current of sorted) {
        if (current - previous > 1) range.push(null);
        range.push(current);
        previous = current;
    }
    return range;
};

const Pagination = ({ page, pageCount, hrefForPage }: PaginationProps) => {
    if (pageCount <= 1) return null;

    const range = buildRange(page, pageCount);
    const isFirst = page <= 1;
    const isLast = page >= pageCount;

    return (
        <nav
            aria-label="Pagination"
            className="flex items-center justify-center gap-1"
        >
            <Link
                href={hrefForPage(page - 1)}
                aria-disabled={isFirst}
                tabIndex={isFirst ? -1 : undefined}
                className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                    isFirst && 'pointer-events-none opacity-50',
                )}
            >
                Previous
            </Link>

            {range.map((p, index) =>
                p === null ? (
                    <span
                        key={`gap-${index}`}
                        aria-hidden
                        className="px-2 text-muted-foreground"
                    >
                        …
                    </span>
                ) : (
                    <Link
                        key={p}
                        href={hrefForPage(p)}
                        aria-current={p === page ? 'page' : undefined}
                        className={cn(
                            buttonVariants({
                                variant: p === page ? 'default' : 'outline',
                                size: 'sm',
                            }),
                        )}
                    >
                        {p}
                    </Link>
                ),
            )}

            <Link
                href={hrefForPage(page + 1)}
                aria-disabled={isLast}
                tabIndex={isLast ? -1 : undefined}
                className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' }),
                    isLast && 'pointer-events-none opacity-50',
                )}
            >
                Next
            </Link>
        </nav>
    );
};

export default Pagination;
