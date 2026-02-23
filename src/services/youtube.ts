const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
const BASE_URL = "https://www.googleapis.com/youtube/v3";

export interface YouTubeVideo {
    id: string;
    title: string;
    channelTitle: string;
    thumbnail: string;
    viewCount: string;
    publishedAt: string;
    categoryId?: string;
    description?: string;
    rank?: number;
}

export async function getTrendingVideos(regionCode = "KR", limit = 100): Promise<YouTubeVideo[]> {
    try {
        if (!API_KEY) {
            console.warn("YouTube API Key is missing. Please set NEXT_PUBLIC_YOUTUBE_API_KEY in your .env file.");
            return [];
        }

        let allVideos: YouTubeVideo[] = [];
        let nextPageToken = "";
        const maxResultsPerRequest = 50;
        const iterations = Math.ceil(limit / maxResultsPerRequest);

        for (let i = 0; i < iterations; i++) {
            const pageTokenParam = nextPageToken ? `&pageToken=${nextPageToken}` : "";
            const currentMaxResults = Math.min(maxResultsPerRequest, limit - allVideos.length);

            const response = await fetch(
                `${BASE_URL}/videos?part=snippet,statistics&chart=mostPopular&regionCode=${regionCode}&maxResults=${currentMaxResults}${pageTokenParam}&key=${API_KEY}`
            );

            if (!response.ok) {
                throw new Error(`YouTube API Error: ${response.statusText}`);
            }

            const data = await response.json();

            const fetchedVideos = data.items.map((item: any) => ({
                id: item.id,
                title: item.snippet.title,
                channelTitle: item.snippet.channelTitle,
                thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
                viewCount: item.statistics.viewCount,
                publishedAt: item.snippet.publishedAt,
                categoryId: item.snippet.categoryId,
            }));

            allVideos = [...allVideos, ...fetchedVideos];
            nextPageToken = data.nextPageToken;

            if (!nextPageToken) break;
        }

        return allVideos;
    } catch (error) {
        console.error("Failed to fetch trending videos:", error);
        return [];
    }
}

export async function getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
    try {
        if (!API_KEY) return null;

        const response = await fetch(
            `${BASE_URL}/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`
        );

        if (!response.ok) {
            throw new Error(`YouTube API Error: ${response.statusText}`);
        }

        const data = await response.json();
        if (!data.items || data.items.length === 0) return null;

        const item = data.items[0];
        return {
            id: item.id,
            title: item.snippet.title,
            channelTitle: item.snippet.channelTitle,
            thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default?.url,
            viewCount: item.statistics.viewCount,
            publishedAt: item.snippet.publishedAt,
            categoryId: item.snippet.categoryId,
            description: item.snippet.description,
        };
    } catch (error) {
        console.error("Failed to fetch video details:", error);
        return null;
    }
}
