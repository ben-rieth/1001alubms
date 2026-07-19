import { Suspense } from 'react';

import { Main } from '@/components/main';
import AlbumCard from '@/components/shared/album-card';
import Pagination from '@/components/shared/pagination';
import { getAlbums } from '@/lib/services/albums';

type AlbumsPageProps = {
    searchParams: Promise<{ page?: string }>;
};

const AlbumsPage = ({ searchParams }: AlbumsPageProps) => {
    return (
        <Main className="flex-col items-stretch justify-start gap-6">
            <Suspense fallback={<AlbumsGridSkeleton />}>
                <AlbumsList searchParams={searchParams} />
            </Suspense>
        </Main>
    );
};

const AlbumsList = async ({ searchParams }: AlbumsPageProps) => {
    const { page: pageParam } = await searchParams;
    const parsed = Number(pageParam);
    const requestedPage = Number.isInteger(parsed) && parsed > 0 ? parsed : 1;

    const { albums, page, pageCount } = await getAlbums({
        page: requestedPage,
    });

    return (
        <>
            <div className="mx-auto grid w-full max-w-350 grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5">
                {albums.map((album, index) => (
                    <AlbumCard
                        key={album.albumId}
                        album={album}
                        priority={index < 6}
                    />
                ))}
            </div>
            <Pagination
                page={page}
                pageCount={pageCount}
                hrefForPage={(p) => (p <= 1 ? '/albums' : `/albums?page=${p}`)}
            />
        </>
    );
};

const AlbumsGridSkeleton = () => (
    <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5">
        {Array.from({ length: 12 }).map((_, index) => (
            <div key={index} className="flex flex-col gap-2">
                <div className="aspect-square w-full animate-pulse bg-muted" />
                <div className="h-4 w-3/4 animate-pulse bg-muted" />
                <div className="h-4 w-1/2 animate-pulse bg-muted" />
            </div>
        ))}
    </div>
);

export default AlbumsPage;
