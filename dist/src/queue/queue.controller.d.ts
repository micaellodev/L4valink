import { QueueService } from './queue.service';
import { OrdersService } from '../orders/orders.service';
import { EventsGateway } from '../gateway/events.gateway';
import { YouTubeService } from '../youtube/youtube.service';
import { RequestSongDto } from './dto/request-song.dto';
import { AddDirectDto } from './dto/add-direct.dto';
import { ReorderQueueDto } from './dto/reorder-queue.dto';
import { JoinTableDto } from './dto/join-table.dto';
import { ToggleSettingDto } from './dto/toggle-setting.dto';
export declare class QueueController {
    private queueService;
    private eventsGateway;
    private ordersService;
    private youtubeService;
    constructor(queueService: QueueService, eventsGateway: EventsGateway, ordersService: OrdersService, youtubeService: YouTubeService);
    requestSong(body: RequestSongDto): Promise<{
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
    addSongDirectly(body: AddDirectDto, req: any): Promise<{
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
    pausePlayback(): Promise<{
        success: boolean;
    }>;
    resumePlayback(): Promise<{
        success: boolean;
    }>;
    resetTable(id: string, req: any): Promise<{
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
    completeSong(body: {
        currentId: string;
    }): Promise<{
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
    reorderQueue(body: ReorderQueueDto): Promise<{
        success: boolean;
    }>;
    joinTable(body: JoinTableDto): Promise<{
        id: number;
        createdAt: Date;
        tableNumber: number;
        userName: string;
    }>;
    getTableSession(id: string): Promise<{
        id: number;
        createdAt: Date;
        tableNumber: number;
        userName: string;
    } | {
        userName: any;
    }>;
    getTables(): Promise<{
        id: number;
        createdAt: Date;
        tableNumber: number;
        userName: string;
    }[]>;
    getTimerEnabled(): Promise<{
        enabled: boolean;
    }>;
    setTimerEnabled(body: ToggleSettingDto): Promise<{
        enabled: boolean;
    }>;
    getAutoplayEnabled(): Promise<{
        enabled: boolean;
    }>;
    setAutoplayEnabled(body: ToggleSettingDto): Promise<{
        enabled: boolean;
    }>;
    getAutoplayNext(id: string): Promise<{
        id: string;
        title: string;
        channelTitle: string;
        duration: string;
        thumbnail: string;
    }>;
    addAutoplaySong(body: AddDirectDto): Promise<{
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
}
