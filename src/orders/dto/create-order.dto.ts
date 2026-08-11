import { IsInt, IsString, IsOptional, ValidateNested, ArrayMinSize, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto } from './order-item.dto';

export class CreateOrderDto {
    @IsInt()
    tableNumber: number;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    userName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    workerName?: string;

    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    @ArrayMinSize(1)
    items: OrderItemDto[];
}
