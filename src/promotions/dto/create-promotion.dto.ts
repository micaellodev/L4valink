import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePromotionDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    price?: number;

    @IsNumber()
    @Min(1)
    @IsOptional()
    @Type(() => Number)
    quantity?: number;

    @IsString()
    @IsOptional()
    imageUrl?: string;

    @IsBoolean()
    @IsOptional()
    @Type(() => Boolean)
    isActive?: boolean;

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    order?: number;

    @IsArray()
    @IsOptional()
    menuItemIds?: string[];
}
