import { IsString, IsInt, MinLength, MaxLength, IsOptional } from 'class-validator';

export class OrderItemDto {
    @IsString()
    @MinLength(1)
    @MaxLength(200)
    name: string;

    @IsInt()
    quantity: number;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    notes?: string;
}
