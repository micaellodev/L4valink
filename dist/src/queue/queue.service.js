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
var QueueService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const events_gateway_1 = require("../gateway/events.gateway");
let QueueService = QueueService_1 = class QueueService {
    constructor(prisma, eventsGateway) {
        this.prisma = prisma;
        this.eventsGateway = eventsGateway;
        this.timerEnabled = true;
        this.autoplayEnabled = false;
        this.logger = new common_1.Logger(QueueService_1.name);
    }
    getTimerEnabled() {
        return this.timerEnabled;
    }
    setTimerEnabled(enabled) {
        this.timerEnabled = enabled;
        return this.timerEnabled;
    }
    getAutoplayEnabled() {
        return this.autoplayEnabled;
    }
    setAutoplayEnabled(enabled) {
        this.autoplayEnabled = enabled;
        return this.autoplayEnabled;
    }
    async requestSong(data) {
        return this.prisma.$transaction(async (tx) => {
            const maxOrder = await tx.queueItem.findFirst({
                where: { status: 'PENDING' },
                orderBy: { order: 'desc' },
                select: { order: true },
            });
            const nextOrder = (maxOrder?.order ?? 0) + 1;
            return tx.queueItem.create({
                data: {
                    ...data,
                    status: 'PENDING',
                    order: nextOrder,
                },
            });
        }, { isolationLevel: 'Serializable' });
    }
    async addDirect(data) {
        return this.prisma.$transaction(async (tx) => {
            const maxOrder = await tx.queueItem.findFirst({
                where: { status: 'APPROVED' },
                orderBy: { order: 'desc' },
                select: { order: true },
            });
            const nextOrder = (maxOrder?.order ?? 0) + 1;
            return tx.queueItem.create({
                data: {
                    youtubeId: data.youtubeId,
                    title: data.title,
                    channelTitle: data.channelTitle,
                    duration: data.duration,
                    requestedByTable: 0,
                    requestedBy: data.addedBy,
                    status: 'APPROVED',
                    order: nextOrder,
                },
            });
        }, { isolationLevel: 'Serializable' });
    }
    async approveSong(id) {
        return this.prisma.$transaction(async (tx) => {
            const maxOrder = await tx.queueItem.findFirst({
                where: { status: 'APPROVED' },
                orderBy: { order: 'desc' },
                select: { order: true },
            });
            const nextOrder = (maxOrder?.order ?? 0) + 1;
            return tx.queueItem.update({
                where: { id },
                data: {
                    status: 'APPROVED',
                    order: nextOrder,
                },
            });
        }, { isolationLevel: 'Serializable' });
    }
    async rejectSong(id) {
        return this.prisma.queueItem.update({
            where: { id },
            data: { status: 'REJECTED' },
        });
    }
    async deleteSong(id) {
        return this.prisma.queueItem.delete({
            where: { id },
        });
    }
    async getQueue() {
        const products = await this.prisma.queueItem.findMany({
            where: {
                status: {
                    in: ['PENDING', 'APPROVED', 'PLAYING'],
                },
            },
        });
        const statusPriority = {
            'PLAYING': 0,
            'APPROVED': 1,
            'PENDING': 2,
            'FINISHED': 3,
            'REJECTED': 4
        };
        const queue = products.sort((a, b) => {
            if (statusPriority[a.status] !== statusPriority[b.status]) {
                return statusPriority[a.status] - statusPriority[b.status];
            }
            return a.order - b.order;
        });
        return queue.map((item) => ({
            ...item,
            thumbnail: `https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg`,
        }));
    }
    async recover() {
        const playingSong = await this.prisma.queueItem.findFirst({
            where: { status: 'PLAYING' },
        });
        if (playingSong) {
            return playingSong;
        }
        const nextSong = await this.prisma.queueItem.findFirst({
            where: { status: 'APPROVED' },
            orderBy: { order: 'asc' },
        });
        return nextSong || null;
    }
    async playSong(id) {
        await this.prisma.queueItem.updateMany({
            where: {
                status: 'PLAYING',
                id: { not: id }
            },
            data: { status: 'FINISHED', playedAt: new Date() },
        });
        return this.prisma.queueItem.update({
            where: { id },
            data: { status: 'PLAYING' },
        });
    }
    async completeSong(id) {
        await this.prisma.queueItem.updateMany({
            where: { id, status: 'PLAYING' },
            data: {
                status: 'FINISHED',
                playedAt: new Date(),
            },
        });
        const nextSong = await this.prisma.queueItem.findFirst({
            where: { status: 'APPROVED' },
            orderBy: { order: 'asc' },
        });
        return { nextSong };
    }
    async reorderQueue(items) {
        await this.prisma.$transaction(items.map((item) => this.prisma.queueItem.update({
            where: { id: item.id },
            data: { order: item.order },
        })));
        return { success: true };
    }
    async getStats() {
        const totalRequests = await this.prisma.queueItem.count();
        const pendingRequests = await this.prisma.queueItem.count({ where: { status: 'PENDING' } });
        const playedSongs = await this.prisma.queueItem.count({ where: { status: 'FINISHED' } });
        const topSongs = await this.prisma.queueItem.groupBy({
            by: ['title', 'youtubeId', 'channelTitle', 'duration'],
            _count: {
                youtubeId: true,
            },
            orderBy: {
                _count: {
                    youtubeId: 'desc',
                },
            },
            take: 10,
        });
        return {
            totalRequests,
            pendingRequests,
            playedSongs,
            topSongs: topSongs.map((s) => ({
                id: s.youtubeId,
                title: s.title,
                channelTitle: s.channelTitle,
                duration: s.duration,
                thumbnail: `https://img.youtube.com/vi/${s.youtubeId}/mqdefault.jpg`,
                count: s._count.youtubeId,
            })),
        };
    }
    async joinTable(tableNumber, userName) {
        const existingSession = await this.prisma.tableSession.findUnique({
            where: { tableNumber },
        });
        if (existingSession) {
            return existingSession;
        }
        const session = await this.prisma.tableSession.create({
            data: {
                tableNumber,
                userName,
            },
        });
        await this.prisma.tableLog.create({
            data: {
                tableNumber,
                customerName: userName,
                openedBy: 'Customer',
            },
        });
        this.eventsGateway.emitTablesUpdate();
        return session;
    }
    async getTableSession(tableNumber) {
        return this.prisma.tableSession.findUnique({
            where: { tableNumber },
        });
    }
    async getActiveTables() {
        return this.prisma.tableSession.findMany();
    }
    async resetTable(tableNumber, closedByUsername) {
        try {
            const activeLog = await this.prisma.tableLog.findFirst({
                where: {
                    tableNumber,
                    closedAt: null,
                },
                orderBy: {
                    openedAt: 'desc',
                },
            });
            if (activeLog) {
                await this.prisma.tableLog.update({
                    where: { id: activeLog.id },
                    data: {
                        closedAt: new Date(),
                        closedBy: closedByUsername || 'System',
                    },
                });
            }
        }
        catch (e) {
            this.logger.error('Error logging table close', e);
        }
        try {
            await this.prisma.tableSession.delete({
                where: { tableNumber },
            });
        }
        catch (e) {
        }
        try {
            this.eventsGateway.emitResetTable(tableNumber);
        }
        catch (e) {
            this.logger.error('Error emitting reset_table event', e);
        }
        this.eventsGateway.emitTablesUpdate();
        return { success: true };
    }
    async getTableLogs() {
        return this.prisma.tableLog.findMany({
            orderBy: {
                openedAt: 'desc',
            },
            take: 50,
        });
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = QueueService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_gateway_1.EventsGateway])
], QueueService);
//# sourceMappingURL=queue.service.js.map