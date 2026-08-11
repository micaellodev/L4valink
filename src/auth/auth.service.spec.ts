import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';

const compareMock = jest.fn();

jest.mock('bcryptjs', () => ({
    compare: (...args: [string, string]) => compareMock(...args),
}));

describe('AuthService', () => {
    let service: AuthService;
    let prisma: jest.Mocked<Partial<PrismaService>>;
    let jwtService: jest.Mocked<Partial<JwtService>>;

    beforeEach(async () => {
        compareMock.mockReset();

        prisma = {
            user: {
                findUnique: jest.fn(),
            } as unknown as PrismaService['user'],
        };

        jwtService = {
            sign: jest.fn().mockReturnValue('mock-token'),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: prisma },
                { provide: JwtService, useValue: jwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateUser', () => {
        it('should return user without password when credentials are valid', async () => {
            const user = { id: '1', username: 'admin', password: 'hashed', role: 'OWNER' };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
            compareMock.mockResolvedValue(true);

            const result = await service.validateUser('admin', 'password');

            expect(result).toEqual({ id: '1', username: 'admin', role: 'OWNER' });
            expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { username: 'admin' } });
        });

        it('should throw UnauthorizedException when user not found', async () => {
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

            await expect(service.validateUser('admin', 'password')).rejects.toThrow(
                UnauthorizedException,
            );
        });

        it('should throw UnauthorizedException when password is invalid', async () => {
            const user = { id: '1', username: 'admin', password: 'hashed', role: 'OWNER' };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
            compareMock.mockResolvedValue(false);

            await expect(service.validateUser('admin', 'password')).rejects.toThrow(
                UnauthorizedException,
            );
        });
    });

    describe('login', () => {
        it('should return access_token and user', async () => {
            const user = { id: '1', username: 'admin', password: 'hashed', role: 'OWNER' };
            (prisma.user.findUnique as jest.Mock).mockResolvedValue(user);
            compareMock.mockResolvedValue(true);

            const result = await service.login('admin', 'password');

            expect(result.access_token).toBe('mock-token');
            expect(result.user).toEqual({ id: '1', username: 'admin', role: 'OWNER' });
            expect(jwtService.sign).toHaveBeenCalledWith({
                username: 'admin',
                sub: '1',
                role: 'OWNER',
            });
        });
    });
});
