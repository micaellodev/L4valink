import { IsString, MinLength, IsOptional, MaxLength, Matches } from 'class-validator';

export class AddDirectDto {
    @IsString()
    @Matches(/^[a-zA-Z0-9_-]{11}$/)
    youtubeId: string;

    @IsString()
    @MinLength(1)
    @MaxLength(200)
    title: string;

    @IsString()
    @MinLength(1)
    @MaxLength(200)
    channelTitle: string;

    @IsString()
    @MinLength(1)
    duration: string;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    addedBy?: string;
}
