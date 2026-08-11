import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { QueueModule } from './queue/queue.module';
import { YouTubeModule } from './youtube/youtube.module';
import { EventsGateway } from './gateway/events.gateway';
import { PrismaModule } from './prisma.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { SchedulerService } from './scheduler/scheduler.service';
import { InventoryModule } from './inventory/inventory.module';
import { HealthModule } from './health/health.module';
import { StorageModule } from './storage/storage.module';
import { MenuModule } from './menu/menu.module';
import { PromotionsModule } from './promotions/promotions.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ThrottlerModule.forRoot([
            {
                ttl: 60000,
                limit: 100,
            },
        ]),
        ScheduleModule.forRoot(),
        AuthModule,
        QueueModule,
        YouTubeModule,
        UsersModule,
        OrdersModule,
        InventoryModule,
        HealthModule,
        StorageModule,
        MenuModule,
        PromotionsModule,
        PrismaModule,
    ],
    providers: [
        EventsGateway,
        SchedulerService,
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RolesGuard,
        },
    ],
})
export class AppModule { }

