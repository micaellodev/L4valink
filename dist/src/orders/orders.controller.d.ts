import { OrdersService } from './orders.service';
import { OrdersGateway } from './orders.gateway';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersController {
    private readonly ordersService;
    private readonly ordersGateway;
    constructor(ordersService: OrdersService, ordersGateway: OrdersGateway);
    createOrder(data: CreateOrderDto): Promise<{
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
    }>;
    getSalesLog(startDate?: string, endDate?: string, tableNumber?: string, sellerName?: string): Promise<{
        id: string;
        tableNumber: number;
        userName: string | null;
        workerName: string | null;
        items: import("@prisma/client/runtime/library").JsonValue;
        totalPrice: number;
        status: string;
        createdAt: Date;
    }[]>;
    getTopBeverages(startDate?: string, endDate?: string): Promise<{
        name: string;
        count: number;
    }[]>;
}
