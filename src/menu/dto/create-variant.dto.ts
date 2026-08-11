import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateVariantDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    @Type(() => Number)
    price?: number;

    @IsString()
    @IsOptional()
    imageUrl?: string;
}
