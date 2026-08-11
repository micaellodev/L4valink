import { IsString, IsInt, IsNumber, Min, IsOptional, MaxLength, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class DailyInventoryEntryDto {
    @IsString()
    productId: string;

    @IsNumber()
    @Min(0)
    milliliters: number;

    @IsInt()
    @Min(0)
    quantity: number;
}

export class SubmitDailyInventoryDto {
    @IsString()
    date: string;

    @ValidateNested({ each: true })
    @Type(() => DailyInventoryEntryDto)
    @ArrayMinSize(1)
    entries: DailyInventoryEntryDto[];

    @IsOptional()
    @IsString()
    @MaxLength(100)
    submittedBy?: string;
}
