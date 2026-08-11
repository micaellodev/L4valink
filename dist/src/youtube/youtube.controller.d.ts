import { YouTubeService } from './youtube.service';
export declare class YouTubeController {
    private youtubeService;
    constructor(youtubeService: YouTubeService);
    search(query: string, req: any): Promise<any[]>;
    verify(videoId: string): Promise<{
        available: boolean;
        title?: string;
        duration?: string;
        reason?: string;
        method?: string;
    }>;
    refreshNodes(): Promise<{
        invidious: string[];
        piped: string[];
    }>;
}
