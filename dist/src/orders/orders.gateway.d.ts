import { Server, Socket } from 'socket.io';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersGateway {
    private readonly ordersService;
    server: Server;
    constructor(ordersService: OrdersService);
    handleCreateOrder(data: CreateOrderDto, client: Socket): Promise<{
        success: boolean;
        order: {
            id: string;
            tableNumber: number;
            userName: string | null;
            workerName: string | null;
            items: import("@prisma/client/runtime/library").JsonValue;
            totalPrice: number;
            status: string;
            createdAt: Date;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        order?: undefined;
    }>;
    handleGetOrders(): Promise<{
        id: string;
        tableNumber: number;
        userName: string | null;
        workerName: string | null;
        items: import("@prisma/client/runtime/library").JsonValue;
        totalPrice: number;
        status: string;
        createdAt: Date;
    }[]>;
    handleCompleteOrder(data: {
        id: string;
    }): Promise<void>;
    handleGetCompletedOrders(): Promise<{
        id: string;
        tableNumber: number;
        userName: string | null;
        workerName: string | null;
        items: import("@prisma/client/runtime/library").JsonValue;
        totalPrice: number;
        status: string;
        createdAt: Date;
    }[]>;
    handleDeleteOrder(data: {
        id: string;
    }): Promise<void>;
    handleGetOrdersByTable(data: {
        tableNumber: number;
    }): Promise<{
        tableNumber: number;
        orders: {
            id: string;
            tableNumber: number;
            userName: string | null;
            workerName: string | null;
            items: import("@prisma/client/runtime/library").JsonValue;
            totalPrice: number;
            status: string;
            createdAt: Date;
        }[];
        aggregatedItems: {
            name: string;
            quantity: number;
        }[];
        totalPrice: number;
        orderCount: number;
    }>;
}
