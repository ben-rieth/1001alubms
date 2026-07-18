import { Main } from '@/components/main';
import AlbumCard from '@/components/shared/album-card';
import Pagination from '@/components/shared/pagination';
import { getAlbums } from '@/lib/services/albums';

type AlbumsPageProps = {
    searchParams: Promise<{ page?: string }>;
};

const AlbumsPage = async ({ searchParams }: AlbumsPageProps) => {
    const { page: pageParam } = await searchParams;
    const parsed = Number(pageParam);
    const requestedPage = Number.isInteger(parsed) && parsed > 0 ? parsed : 1;

    const { albums, page, pageCount } = await getAlbums({
        page: requestedPage,
    });

    return (
        <Main className="flex-col items-stretch justify-start gap-6">
            <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-5">
                {albums.map((album, index) => (
                    <AlbumCard
                        key={album.albumId}
                        album={album}
                        priority={index < 12}
                    />
                ))}
            </div>
            <Pagination
                page={page}
                pageCount={pageCount}
                hrefForPage={(p) => (p <= 1 ? '/albums' : `/albums?page=${p}`)}
            />
        </Main>
    );
};

export default AlbumsPage;
