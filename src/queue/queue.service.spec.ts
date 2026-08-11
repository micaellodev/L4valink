import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from './queue.service';
import { PrismaService } from '../prisma.service';
import { EventsGateway } from '../gateway/events.gateway';

describe('QueueService', () => {
    let service: QueueService;
    let prisma: jest.Mocked<Partial<PrismaService>>;
    let eventsGateway: jest.Mocked<Partial<EventsGateway>>;

    beforeEach(async () => {
        const txMock = {
            queueItem: {
                findFirst: jest.fn(),
                create: jest.fn(),
                update: jest.fn(),
            },
        };

        prisma = {
            $transaction: jest.fn(async (callback) => callback(txMock)),
            queueItem: {
                update: jest.fn(),
                findMany: jest.fn(),
                findFirst: jest.fn(),
                findUnique: jest.fn(),
                delete: jest.fn(),
                create: jest.fn(),
            } as unknown as PrismaService['queueItem'],
        };

        eventsGateway = {
            server: { emit: jest.fn() } as unknown as EventsGateway['server'],
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                QueueService,
                { provide: PrismaService, useValue: prisma },
                { provide: EventsGateway, useValue: eventsGateway },
            ],
        }).compile();

        service = module.get<QueueService>(QueueService);

        // Attach tx mock so tests can assert against it
        (service as unknown as { txMock: typeof txMock }).txMock = txMock;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('timer and autoplay settings', () => {
        it('should toggle timer state', () => {
            expect(service.getTimerEnabled()).toBe(true);
            service.setTimerEnabled(false);
            expect(service.getTimerEnabled()).toBe(false);
        });

        it('should toggle autoplay state', () => {
            expect(service.getAutoplayEnabled()).toBe(false);
            service.setAutoplayEnabled(true);
            expect(service.getAutoplayEnabled()).toBe(true);
        });
    });

    describe('requestSong', () => {
        it('should create a pending queue item with next order', async () => {
            const txMock = (service as unknown as { txMock: { queueItem: { findFirst: jest.Mock; create: jest.Mock } } }).txMock;
            txMock.queueItem.findFirst.mockResolvedValue({ order: 5 });
            txMock.queueItem.create.mockResolvedValue({ id: 'song-1', order: 6 } as never);

            const result = await service.requestSong({
                youtubeId: 'abc123',
                title: 'Test Song',
                channelTitle: 'Test Channel',
                duration: '3:30',
                requestedByTable: 1,
                requestedBy: 'User',
            });

            expect(txMock.queueItem.create).toHaveBeenCalledWith({
                data: expect.objectContaining({
                    youtubeId: 'abc123',
                    status: 'PENDING',
                    order: 6,
                }),
            });
            expect(result).toEqual({ id: 'song-1', order: 6 });
        });
    });

    describe('approveSong', () => {
        it('should update status to APPROVED with next order', async () => {
            const txMock = (service as unknown as { txMock: { queueItem: { findFirst: jest.Mock; update: jest.Mock } } }).txMock;
            txMock.queueItem.findFirst.mockResolvedValue({ order: 2 });
            txMock.queueItem.update.mockResolvedValue({ id: 'song-1', status: 'APPROVED', order: 3 } as never);

            const result = await service.approveSong('song-1');

            expect(txMock.queueItem.update).toHaveBeenCalledWith({
                where: { id: 'song-1' },
                data: { status: 'APPROVED', order: 3 },
            });
            expect(result).toEqual({ id: 'song-1', status: 'APPROVED', order: 3 });
        });
    });

    describe('rejectSong', () => {
        it('should update status to REJECTED', async () => {
            (prisma.queueItem.update as jest.Mock).mockResolvedValue({ id: 'song-1', status: 'REJECTED' });

            const result = await service.rejectSong('song-1');

            expect(prisma.queueItem.update).toHaveBeenCalledWith({
                where: { id: 'song-1' },
                data: { status: 'REJECTED' },
            });
            expect(result).toEqual({ id: 'song-1', status: 'REJECTED' });
        });
    });
});
