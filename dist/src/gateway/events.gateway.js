"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EventsGateway_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const ws_jwt_guard_1 = require("../auth/ws-jwt.guard");
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000'];
let EventsGateway = EventsGateway_1 = class EventsGateway {
    constructor() {
        this.logger = new common_1.Logger(EventsGateway_1.name);
    }
    handleConnection(client) {
        this.logger.log(`Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    emitNewRequest(song) {
        this.server.emit('new_request', song);
    }
    emitQueueUpdated() {
        this.server.emit('queue_updated');
    }
    emitPlayNext(nextSong) {
        this.server.emit('play_next', nextSong);
    }
    emitPauseSong() {
        this.server.emit('pause_song');
    }
    emitResumeSong() {
        this.server.emit('resume_song');
    }
    handleSkipSong(client, data) {
        this.server.emit('skip_song', data);
    }
    handlePauseSong(client, data) {
        this.server.emit('pause_song', data);
    }
    emitResetTable(tableNumber) {
        this.server.emit('reset_table', { tableNumber });
    }
    handlePlaybackProgress(client, data) {
        this.server.emit('playback_progress', data);
    }
    emitTablesUpdate() {
        this.server.emit('tables_updated');
    }
    emitTimerUpdate(enabled) {
        this.server.emit('timer_updated', { enabled });
    }
};
exports.EventsGateway = EventsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], EventsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('skip_song'),
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handleSkipSong", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('pause_song'),
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handlePauseSong", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('playback_progress'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], EventsGateway.prototype, "handlePlaybackProgress", null);
exports.EventsGateway = EventsGateway = EventsGateway_1 = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: allowedOrigins,
            credentials: true,
        },
    })
], EventsGateway);
//# sourceMappingURL=events.gateway.js.map