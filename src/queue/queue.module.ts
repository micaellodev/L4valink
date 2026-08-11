import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { QueueController } from './queue.controller';
import { EventsGateway } from '../gateway/events.gateway';
import { AuthModule } from '../auth/auth.module';
import { OrdersModule } from '../orders/orders.module';
import { YouTubeModule } from '../youtube/youtube.module';

@Module({
    imports: [OrdersModule, YouTubeModule, AuthModule],
    controllers: [QueueController],
    providers: [QueueService, EventsGateway],
    exports: [QueueService],
})
export class QueueModule { }
