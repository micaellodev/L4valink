import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { OrdersService } from './orders.service';
import { OrdersGateway } from './orders.gateway';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
    constructor(
        private readonly ordersService: OrdersService,
        private readonly ordersGateway: OrdersGateway,
    ) { }

    // Endpoint público para pedidos desde la carta (HTTP es más confiable
    // que WebSocket en redes móviles). Notifica al admin vía socket.
    @Post()
    @Public()
    async createOrder(@Body() data: CreateOrderDto) {
        const order = await this.ordersService.createOrder(data);
        this.ordersGateway.server.emit('order:new', order);
        this.ordersGateway.server.emit('tables_updated');
        return { success: true, order };
    }

    @Get('sales')
    @Roles(UserRole.OWNER, UserRole.WORKER)
    async getSalesLog(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('tableNumber') tableNumber?: string,
        @Query('sellerName') sellerName?: string,
    ) {
        return this.ordersService.getSalesLog({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            tableNumber: tableNumber ? parseInt(tableNumber) : undefined,
            sellerName,
        });
    }

    @Get('stats/top-beverages')
    @Roles(UserRole.OWNER, UserRole.WORKER)
    async getTopBeverages(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        return this.ordersService.getTopBeverages(
            startDate ? new Date(startDate) : undefined,
            endDate ? new Date(endDate) : undefined,
        );
    }
}
