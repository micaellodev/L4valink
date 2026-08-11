import { IsInt, IsString, MinLength, MaxLength } from 'class-validator';

export class JoinTableDto {
    @IsInt()
    tableNumber: number;

    @IsString()
    @MinLength(1)
    @MaxLength(100)
    userName: string;
}
