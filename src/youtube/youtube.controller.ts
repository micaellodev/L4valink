import { Controller, Get, Post, Query, UseGuards, Request } from '@nestjs/common';
import { YouTubeService } from './youtube.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';

@Controller('youtube')
export class YouTubeController {
    constructor(private youtubeService: YouTubeService) { }

    @Get('search')
    @Public()
    @UseGuards(OptionalJwtAuthGuard)
    async search(@Query('q') query: string, @Request() req) {
        const user = req.user;
        const isUnrestricted = user && (user.role === 'WORKER' || user.role === 'OWNER');
        return this.youtubeService.search(query, isUnrestricted);
    }

    @Get('verify')
    @Public()
    @UseGuards(OptionalJwtAuthGuard)
    async verify(@Query('id') videoId: string) {
        return this.youtubeService.verifyVideo(videoId);
    }

    @Post('refresh-nodes')
    @Public()
    @UseGuards(OptionalJwtAuthGuard)
    async refreshNodes() {
        return this.youtubeService.refreshNodesFromPublicLists();
    }
}
