import { asc, count, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/db';
import { albumTable, artistTable } from '../db/schema';

type GetAlbumsOptions = {
    page?: number;
    pageSize?: number;
};

export const getAlbums = async ({
    page = 1,
    pageSize = 60,
}: GetAlbumsOptions = {}) => {
    const [{ total }] = await db.select({ total: count() }).from(albumTable);

    const pageCount = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), pageCount);
    const offset = (safePage - 1) * pageSize;

    const results = await db
        .select({
            albumId: albumTable.albumId,
            title: albumTable.title,
            artist: artistTable.name,
            coverUrl: albumTable.coverUrl,
        })
        .from(albumTable)
        .leftJoin(artistTable, eq(albumTable.artistId, artistTable.artistId))
        .orderBy(asc(albumTable.year))
        .limit(pageSize)
        .offset(offset);

    return {
        albums: results.map((result) => ({
            ...result,
            artist: result.artist ?? '',
        })),
        total,
        page: safePage,
        pageSize,
        pageCount,
    };
};

export const getAlbumDetails = async (albumId: string) => {
    if (!z.uuid().safeParse(albumId).success) {
        return undefined;
    }

    const result = await db
        .select({
            albumId: albumTable.albumId,
            title: albumTable.title,
            year: albumTable.year,
            artist: artistTable.name,
            coverUrl: albumTable.coverUrl,
            wikipeidaUrl: albumTable.wikipediaUrl,
            appleUrl: albumTable.appleMusicUrl,
            spotifyId: albumTable.spotifyId,
            genres: albumTable.genres,
            summary: albumTable.summary,
            whyItsEssential: albumTable.whyItsEssential,
            elevatorPitch: albumTable.elevatorPitch,
            trackCount: albumTable.trackCount,
            runtimeMinutes: albumTable.runtimeMinutes,
        })
        .from(albumTable)
        .leftJoin(artistTable, eq(albumTable.artistId, artistTable.artistId))
        .where(eq(albumTable.albumId, albumId));

    return result.at(0);
};

export const getAllAlbumIds = async () => {
    const res = await db.select({ id: albumTable.albumId }).from(albumTable);

    return res.map((row) => row.id);
};
