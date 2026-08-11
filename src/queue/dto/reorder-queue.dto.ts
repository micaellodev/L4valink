import { IsString, IsInt, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

export class ReorderItemDto {
    @IsString()
    id: string;

    @IsInt()
    order: number;
}

export class ReorderQueueDto {
    @ValidateNested({ each: true })
    @Type(() => ReorderItemDto)
    @ArrayMinSize(1)
    items: ReorderItemDto[];
}
