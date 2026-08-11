import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { OrdersService } from './orders.service';
import { OrdersGateway } from './orders.gateway';
import { OrdersController } from './orders.controller';
import { PrinterService } from '../services/printer.service';

@Module({
    imports: [AuthModule],
    controllers: [OrdersController],
    providers: [OrdersService, OrdersGateway, PrinterService],
    exports: [OrdersService],
})
export class OrdersModule { }
