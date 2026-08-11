import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from '../auth/ws-jwt.guard';

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000'];

@WebSocketGateway({
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(EventsGateway.name);

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    // Emit events to all clients
    emitNewRequest(song: any) {
        this.server.emit('new_request', song);
    }

    emitQueueUpdated() {
        this.server.emit('queue_updated');
    }

    emitPlayNext(nextSong: any) {
        this.server.emit('play_next', nextSong);
    }

    emitPauseSong() {
        this.server.emit('pause_song');
    }

    emitResumeSong() {
        this.server.emit('resume_song');
    }

    // Listen for events from admin
    @SubscribeMessage('skip_song')
    @UseGuards(WsJwtGuard)
    handleSkipSong(client: Socket, data: any) {
        this.server.emit('skip_song', data);
    }

    @SubscribeMessage('pause_song')
    @UseGuards(WsJwtGuard)
    handlePauseSong(client: Socket, data: any) {
        this.server.emit('pause_song', data);
    }

    emitResetTable(tableNumber: number) {
        this.server.emit('reset_table', { tableNumber });
    }

    @SubscribeMessage('playback_progress')
    handlePlaybackProgress(client: Socket, data: any) {
        this.server.emit('playback_progress', data);
    }

    emitTablesUpdate() {
        this.server.emit('tables_updated');
    }

    emitTimerUpdate(enabled: boolean) {
        this.server.emit('timer_updated', { enabled });
    }
}
