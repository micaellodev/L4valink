import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Controller('health')
export class HealthController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    async check() {
        try {
            await this.prisma.$queryRaw`SELECT 1`;
            return {
                status: 'ok',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                database: 'ok',
            };
        } catch (error) {
            return {
                status: 'error',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                database: 'unreachable',
            };
        }
    }
}
