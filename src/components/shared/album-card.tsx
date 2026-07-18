import Image from 'next/image';
import Link from 'next/link';

type AlbumCardProps = {
    album: {
        albumId: string;
        title: string;
        artist: string;
        coverUrl: string;
    };
    priority?: boolean;
};

const AlbumCard = ({ album, priority = false }: AlbumCardProps) => {
    return (
        <Link className="relative w-full" href={`/albums/${album.albumId}`}>
            <div className="relative aspect-square w-full">
                <Image
                    src={album.coverUrl}
                    alt={`Cover art for ${album.title}`}
                    fill
                    sizes="(max-width: 480px) 50vw, (max-width: 1024px) 25vw, 200px"
                    priority={priority}
                    className="object-cover"
                />
            </div>
            <div className="flex flex-col">
                <span className="font-semibold text-sm">{album.title}</span>
                <span className="italic text-sm">{album.artist}</span>
            </div>
        </Link>
    );
};

export default AlbumCard;
