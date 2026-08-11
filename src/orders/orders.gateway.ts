import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { OrdersService } from './orders.service';
import { WsJwtGuard } from '../auth/ws-jwt.guard';
import { CreateOrderDto } from './dto/create-order.dto';

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000'];

@WebSocketGateway({
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
})
export class OrdersGateway {
    @WebSocketServer()
    server: Server;

    constructor(private readonly ordersService: OrdersService) { }

    @SubscribeMessage('order:create')
    async handleCreateOrder(
        @MessageBody() data: CreateOrderDto,
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const order = await this.ordersService.createOrder(data);
            this.server.emit('order:new', order);
            this.server.emit('tables_updated');
            return { success: true, order };
        } catch (error) {
            return { success: false, error: (error as Error).message };
        }
    }

    @SubscribeMessage('order:get')
    @UseGuards(WsJwtGuard)
    async handleGetOrders() {
        return this.ordersService.getOrders();
    }

    @SubscribeMessage('order:complete')
    @UseGuards(WsJwtGuard)
    async handleCompleteOrder(@MessageBody() data: { id: string }) {
        await this.ordersService.completeOrder(data.id);
        this.server.emit('order:completed', { id: data.id });
    }

    @SubscribeMessage('order:getCompleted')
    @UseGuards(WsJwtGuard)
    async handleGetCompletedOrders() {
        return this.ordersService.getCompletedOrders();
    }

    @SubscribeMessage('order:delete')
    @UseGuards(WsJwtGuard)
    async handleDeleteOrder(@MessageBody() data: { id: string }) {
        await this.ordersService.deleteOrder(data.id);
        this.server.emit('order:deleted', { id: data.id });
    }

    @SubscribeMessage('order:getByTable')
    @UseGuards(WsJwtGuard)
    async handleGetOrdersByTable(@MessageBody() data: { tableNumber: number }) {
        return this.ordersService.getOrdersByTable(data.tableNumber);
    }
}
