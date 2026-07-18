import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            new URL('https://i.scdn.co/image/**'),
            new URL('https://is4-ssl.mzstatic.com/image/thumb/Music/**'),
            new URL('https://upload.wikimedia.org/wikipedia/en/**'),
        ],
    },
};

export default nextConfig;
