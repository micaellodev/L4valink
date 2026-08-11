import { PrismaService } from '../prisma.service';
import { EventsGateway } from '../gateway/events.gateway';
export declare class QueueService {
    private prisma;
    private eventsGateway;
    private timerEnabled;
    private autoplayEnabled;
    private readonly logger;
    constructor(prisma: PrismaService, eventsGateway: EventsGateway);
    getTimerEnabled(): boolean;
    setTimerEnabled(enabled: boolean): boolean;
    getAutoplayEnabled(): boolean;
    setAutoplayEnabled(enabled: boolean): boolean;
    requestSong(data: {
        youtubeId: string;
        title: string;
        channelTitle: string;
        duration: string;
        requestedByTable: number;
        requestedBy?: string;
        comments?: string;
    }): Promise<{
        order: number;
        id: string;
        youtubeId: string;
        title: string;
        channelTitle: string;
        duration: string;
        requestedByTable: number;
        requestedBy: string | null;
        comments: string | null;
        status: import(".prisma/client").$Enums.QueueStatus;
        createdAt: Date;
        playedAt: Date | null;
    }>;
    addDirect(data: {
        youtubeId: string;
        title: string;
        channelTitle: string;
        duration: string;
        addedBy: string;
    }): Promise<{
        order: number;
        id: string;
        youtubeId: string;
        title: string;
        channelTitle: string;
        duration: string;
        requestedByTable: number;
        requestedBy: string | null;
        comments: string | null;
        status: import(".prisma/client").$Enums.QueueStatus;
        createdAt: Date;
        playedAt: Date | null;
    }>;
    approveSong(id: string): Promise<{
        order: number;
        id: string;
        youtubeId: string;
        title: string;
        channelTitle: string;
        duration: string;
        requestedByTable: number;
        requestedBy: string | null;
        comments: string | null;
        status: import(".prisma/client").$Enums.QueueStatus;
        createdAt: Date;
        playedAt: Date | null;
    }>;
    rejectSong(id: string): Promise<{
        order: number;
        id: string;
        youtubeId: string;
        title: string;
        channelTitle: string;
        duration: string;
        requestedByTable: number;
        requestedBy: string | null;
        comments: string | null;
        status: import(".prisma/client").$Enums.QueueStatus;
        createdAt: Date;
        playedAt: Date | null;
    }>;
    deleteSong(id: string): Promise<{
        order: number;
        id: string;
        youtubeId: string;
        title: string;
        channelTitle: string;
        duration: string;
        requestedByTable: number;
        requestedBy: string | null;
        comments: string | null;
        status: import(".prisma/client").$Enums.QueueStatus;
        createdAt: Date;
        playedAt: Date | null;
    }>;
    getQueue(): Promise<{
        thumbnail: string;
        order: number;
        id: string;
        youtubeId: string;
        title: string;
        channelTitle: string;
        duration: string;
        requestedByTable: number;
        requestedBy: string | null;
        comments: string | null;
        status: import(".prisma/client").$Enums.QueueStatus;
        createdAt: Date;
        playedAt: Date | null;
    }[]>;
    recover(): Promise<{
        order: number;
        id: string;
        youtubeId: string;
        title: string;
        channelTitle: string;
        duration: string;
        requestedByTable: number;
        requestedBy: string | null;
        comments: string | null;
        status: import(".prisma/client").$Enums.QueueStatus;
        createdAt: Date;
        playedAt: Date | null;
    }>;
    playSong(id: string): Promise<{
        order: number;
        id: string;
        youtubeId: string;
        title: string;
        channelTitle: string;
        duration: string;
        requestedByTable: number;
        requestedBy: string | null;
        comments: string | null;
        status: import(".prisma/client").$Enums.QueueStatus;
        createdAt: Date;
        playedAt: Date | null;
    }>;
    completeSong(id: string): Promise<{
        nextSong: {
            order: number;
            id: string;
            youtubeId: string;
            title: string;
            channelTitle: string;
            duration: string;
            requestedByTable: number;
            requestedBy: string | null;
            comments: string | null;
            status: import(".prisma/client").$Enums.QueueStatus;
            createdAt: Date;
            playedAt: Date | null;
        };
    }>;
    reorderQueue(items: {
        id: string;
        order: number;
    }[]): Promise<{
        success: boolean;
    }>;
    getStats(): Promise<{
        totalRequests: number;
        pendingRequests: number;
        playedSongs: number;
        topSongs: {
            id: string;
            title: string;
            channelTitle: string;
            duration: string;
            thumbnail: string;
            count: number;
        }[];
    }>;
    joinTable(tableNumber: number, userName: string): Promise<{
        id: number;
        createdAt: Date;
        tableNumber: number;
        userName: string;
    }>;
    getTableSession(tableNumber: number): Promise<{
        id: number;
        createdAt: Date;
        tableNumber: number;
        userName: string;
    }>;
    getActiveTables(): Promise<{
        id: number;
        createdAt: Date;
        tableNumber: number;
        userName: string;
    }[]>;
    resetTable(tableNumber: number, closedByUsername?: string): Promise<{
        success: boolean;
    }>;
    getTableLogs(): Promise<{
        id: number;
        tableNumber: number;
        customerName: string;
        openedAt: Date;
        closedAt: Date | null;
        openedBy: string;
        closedBy: string | null;
        totalTotal: number | null;
    }[]>;
}
