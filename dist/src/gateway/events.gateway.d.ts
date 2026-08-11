import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    private readonly logger;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    emitNewRequest(song: any): void;
    emitQueueUpdated(): void;
    emitPlayNext(nextSong: any): void;
    emitPauseSong(): void;
    emitResumeSong(): void;
    handleSkipSong(client: Socket, data: any): void;
    handlePauseSong(client: Socket, data: any): void;
    emitResetTable(tableNumber: number): void;
    handlePlaybackProgress(client: Socket, data: any): void;
    emitTablesUpdate(): void;
    emitTimerUpdate(enabled: boolean): void;
}
