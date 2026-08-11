import { OrderItemDto } from './order-item.dto';
export declare class CreateOrderDto {
    tableNumber: number;
    userName?: string;
    workerName?: string;
    items: OrderItemDto[];
}
