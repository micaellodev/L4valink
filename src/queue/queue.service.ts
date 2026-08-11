import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { QueueStatus } from '@prisma/client';

import { EventsGateway } from '../gateway/events.gateway';

@Injectable()
export class QueueService {
    private timerEnabled = true;
    private autoplayEnabled = false;
    private readonly logger = new Logger(QueueService.name);

    constructor(
        private prisma: PrismaService,
        private eventsGateway: EventsGateway
    ) { }

    getTimerEnabled() {
        return this.timerEnabled;
    }

    setTimerEnabled(enabled: boolean) {
        this.timerEnabled = enabled;
        return this.timerEnabled;
    }

    getAutoplayEnabled() {
        return this.autoplayEnabled;
    }

    setAutoplayEnabled(enabled: boolean) {
        this.autoplayEnabled = enabled;
        return this.autoplayEnabled;
    }

    async requestSong(data: {
        youtubeId: string;
        title: string;
        channelTitle: string;
        duration: string;
        requestedByTable: number;
        requestedBy?: string;
        comments?: string;
    }) {
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

    async addDirect(data: {
        youtubeId: string;
        title: string;
        channelTitle: string;
        duration: string;
        addedBy: string;
    }) {
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
                    requestedByTable: 0, // Admin/System
                    requestedBy: data.addedBy,
                    status: 'APPROVED',
                    order: nextOrder,
                },
            });
        }, { isolationLevel: 'Serializable' });
    }

    async approveSong(id: string) {
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

    async rejectSong(id: string) {
        return this.prisma.queueItem.update({
            where: { id },
            data: { status: 'REJECTED' },
        });
    }

    async deleteSong(id: string) {
        return this.prisma.queueItem.delete({
            where: { id },
        });
    }

    async getQueue() {
        // We want: PLAYING (at the very top) -> APPROVED (in order) -> PENDING (in order)
        const products = await this.prisma.queueItem.findMany({
            where: {
                status: {
                    in: ['PENDING', 'APPROVED', 'PLAYING'],
                },
            },
        });

        // Custom sort to ensure PLAYING is always first, then APPROVED, then PENDING
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

    // CRITICAL: Auto-recovery endpoint for power loss
    async recover() {
        // First check if there's a song currently playing
        const playingSong = await this.prisma.queueItem.findFirst({
            where: { status: 'PLAYING' },
        });

        if (playingSong) {
            return playingSong;
        }

        // If no playing song, get the next approved song
        const nextSong = await this.prisma.queueItem.findFirst({
            where: { status: 'APPROVED' },
            orderBy: { order: 'asc' },
        });

        return nextSong || null;
    }

    async playSong(id: string) {
        // Mark any OTHER currently playing song as finished
        await this.prisma.queueItem.updateMany({
            where: {
                status: 'PLAYING',
                id: { not: id }
            },
            data: { status: 'FINISHED', playedAt: new Date() },
        });

        // Mark this song as playing
        return this.prisma.queueItem.update({
            where: { id },
            data: { status: 'PLAYING' },
        });
    }

    async completeSong(id: string) {
        // Mark current song as finished (only if it was actually playing to avoid accidental double-completes)
        await this.prisma.queueItem.updateMany({
            where: { id, status: 'PLAYING' },
            data: {
                status: 'FINISHED',
                playedAt: new Date(),
            },
        });

        // Get next approved song
        const nextSong = await this.prisma.queueItem.findFirst({
            where: { status: 'APPROVED' },
            orderBy: { order: 'asc' },
        });

        return { nextSong };
    }

    async reorderQueue(items: { id: string; order: number }[]) {
        await this.prisma.$transaction(
            items.map((item) =>
                this.prisma.queueItem.update({
                    where: { id: item.id },
                    data: { order: item.order },
                }),
            ),
        );
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
                id: s.youtubeId, // Mapping youtubeId to id for frontend compatibility
                title: s.title,
                channelTitle: s.channelTitle,
                duration: s.duration,
                thumbnail: `https://img.youtube.com/vi/${s.youtubeId}/mqdefault.jpg`,
                count: s._count.youtubeId,
            })),
        };
    }

    // Table Session Management

    async joinTable(tableNumber: number, userName: string) {
        // Check if session already exists
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

        // Log table opening
        await this.prisma.tableLog.create({
            data: {
                tableNumber,
                customerName: userName,
                openedBy: 'Customer', // Default to Customer for now
            },
        });

        this.eventsGateway.emitTablesUpdate();
        return session;
    }

    async getTableSession(tableNumber: number) {
        return this.prisma.tableSession.findUnique({
            where: { tableNumber },
        });
    }

    async getActiveTables() {
        return this.prisma.tableSession.findMany();
    }

    async resetTable(tableNumber: number, closedByUsername?: string) {
        // Log table closing
        try {
            // Find active log (where closedAt is null) for this table
            // We order by openedAt desc to get the latest one
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
        } catch (e) {
            this.logger.error('Error logging table close', e);
        }

        // Delete session
        try {
            await this.prisma.tableSession.delete({
                where: { tableNumber },
            });
        } catch (e) {
            // Ignore if already deleted
        }

        // Notify clients that this specific table was reset so they can
        // immediately clear UI/state (for example, stored user name)
        try {
            this.eventsGateway.emitResetTable(tableNumber);
        } catch (e) {
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
            take: 50, // Limit to last 50 entries
        });
    }
}
