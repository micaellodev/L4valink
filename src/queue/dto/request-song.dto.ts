import { IsInt, IsString, MinLength, IsOptional, Matches, MaxLength } from 'class-validator';

export class RequestSongDto {
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

    @IsInt()
    requestedByTable: number;

    @IsOptional()
    @IsString()
    @MaxLength(100)
    requestedBy?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    comments?: string;
}
