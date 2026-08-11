import { ConfigService } from '@nestjs/config';
export declare class YouTubeService {
    private configService;
    private readonly logger;
    private INVIDIOUS_NODES;
    private PIPED_NODES;
    private readonly YOUTUBE_API_KEY;
    private readonly CACHE_TTL_MS;
    private readonly SEARCH_VARIANTS;
    private searchCache;
    private healthyInvidiousNodes;
    private healthyPipedNodes;
    private lastHealthCheck;
    private healthCheckPromise;
    constructor(configService: ConfigService);
    private parseNodeList;
    onModuleInit(): Promise<void>;
    private checkNodes;
    refreshNodesFromPublicLists(): Promise<{
        invidious: string[];
        piped: string[];
    }>;
    private getInvidiousNodes;
    private getPipedNodes;
    private checkNodesWithTimeout;
    private getCacheKey;
    private getCached;
    private setCache;
    search(query: string, isUnrestricted?: boolean): Promise<any[]>;
    private doSearch;
    private searchWithPrimary;
    private searchWithInvidious;
    private searchWithYouTubeDataApi;
    private parseIsoDuration;
    private fetchWithRetry;
    private delay;
    verifyVideo(videoId: string): Promise<{
        available: boolean;
        title?: string;
        duration?: string;
        reason?: string;
        method?: string;
    }>;
    private verifyWithInvidiousNodes;
    private verifyWithPipedNodes;
    private verifyWithYouTubeApi;
    getAutoplayNext(videoId: string): Promise<{
        id: string;
        title: string;
        channelTitle: string;
        duration: string;
        thumbnail: string;
    }>;
    private autoplaySearchFallback;
    private autoplaySearchFallbackById;
}
