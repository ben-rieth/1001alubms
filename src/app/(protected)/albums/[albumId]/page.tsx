import { Main } from '@/components/main';
import { getAlbumDetails, getAllAlbumIds } from '@/lib/services/albums';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlbumArtwork } from '@/components/albums/album-artwork';
import { Eyebrow } from '@/components/albums/eyebrow';

export const generateStaticParams = async () => {
    const albumIds = await getAllAlbumIds();

    return albumIds.map((albumId) => ({
        albumId,
    }));
};

type AlbumDetailPageProps = {
    params: Promise<{
        albumId: string;
    }>;
};

const AlbumDetailPage = async ({ params }: AlbumDetailPageProps) => {
    const { albumId } = await params;
    const album = await getAlbumDetails(albumId);

    if (!album) {
        notFound();
    }

    const whyItMatters =
        album.whyItsEssential || album.summary || album.elevatorPitch;
    const spotifyUrl = album.spotifyId
        ? `https://open.spotify.com/album/${album.spotifyId}`
        : undefined;
    const appleUrl = album.appleUrl || undefined;

    return (
        <Main className="items-start justify-center px-6 py-16 md:py-24">
            <div className="flex w-full max-w-5xl flex-col gap-8">
                <Link
                    href="/albums"
                    className="inline-flex w-fit items-center gap-2 font-mono text-[0.7rem] font-medium tracking-[0.2em] text-muted-foreground uppercase transition-colors hover:text-foreground"
                >
                    <ArrowLeft className="size-3.5" />
                    Album Library
                </Link>
                <article className="grid gap-10 md:grid-cols-2 md:gap-14">
                    <div className="flex flex-col gap-3">
                        <AlbumArtwork
                            coverUrl={album.coverUrl}
                            title={album.title}
                            year={album.year}
                        />
                        {spotifyUrl && (
                            <Button
                                variant="outline"
                                nativeButton={false}
                                className="h-11 w-full rounded-none border-border font-mono text-xs tracking-[0.15em] uppercase"
                                render={
                                    <Link
                                        href={spotifyUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                    />
                                }
                            >
                                <Play className="fill-current" />
                                Listen on Spotify
                            </Button>
                        )}
                        {appleUrl && (
                            <Button
                                variant="outline"
                                nativeButton={false}
                                className="h-11 w-full rounded-none border-border font-mono text-xs tracking-[0.15em] uppercase"
                                render={
                                    <Link
                                        href={appleUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                    />
                                }
                            >
                                <Play className="fill-current" />
                                Listen on Apple Music
                            </Button>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <div className="flex flex-wrap items-center gap-2">
                            {album.genres.slice(0, 2).map((genre) => (
                                <Badge
                                    key={`genre-${genre}`}
                                    variant="outline"
                                    className="h-6 px-2.5 font-mono text-[0.65rem] tracking-[0.15em] uppercase"
                                >
                                    {genre}
                                </Badge>
                            ))}
                            <Badge
                                variant="outline"
                                className="h-6 px-2.5 font-mono text-[0.65rem] tracking-[0.15em] uppercase"
                            >
                                {album.year}
                            </Badge>
                        </div>

                        <h1 className="mt-5 font-serif text-5xl leading-tight font-semibold text-foreground">
                            {album.title}
                        </h1>
                        <p className="mt-1 font-serif text-xl text-muted-foreground italic">
                            {album.artist}
                        </p>

                        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-border pt-4">
                            <Eyebrow>{album.trackCount} Tracks</Eyebrow>
                            <span aria-hidden className="text-border">
                                /
                            </span>
                            <Eyebrow>{album.runtimeMinutes} Min</Eyebrow>
                            {album.wikipediaUrl && (
                                <>
                                    <span aria-hidden className="text-border">
                                        /
                                    </span>
                                    <Link
                                        href={album.wikipediaUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 font-mono text-[0.7rem] font-medium tracking-[0.2em] text-primary uppercase transition-colors hover:text-primary/80"
                                    >
                                        Wikipedia
                                        <ExternalLink className="size-3" />
                                    </Link>
                                </>
                            )}
                        </div>

                        {whyItMatters && (
                            <div className="mt-8 flex flex-col gap-3">
                                <Eyebrow>Why It Matters</Eyebrow>
                                <p className="max-w-prose font-serif text-lg leading-relaxed text-foreground/90">
                                    {whyItMatters}
                                </p>
                            </div>
                        )}
                    </div>
                </article>
            </div>
        </Main>
    );
};

export default AlbumDetailPage;
