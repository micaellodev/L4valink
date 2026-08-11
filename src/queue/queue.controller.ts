import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { QueueService } from './queue.service';
import { OrdersService } from '../orders/orders.service';
import { EventsGateway } from '../gateway/events.gateway';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { YouTubeService } from '../youtube/youtube.service';
import { RequestSongDto } from './dto/request-song.dto';
import { AddDirectDto } from './dto/add-direct.dto';
import { ReorderQueueDto } from './dto/reorder-queue.dto';
import { JoinTableDto } from './dto/join-table.dto';
import { ToggleSettingDto } from './dto/toggle-setting.dto';

@Controller('queue')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QueueController {
    constructor(
        private queueService: QueueService,
        private eventsGateway: EventsGateway,
        private ordersService: OrdersService,
        private youtubeService: YouTubeService,
    ) { }

    @Post('request')
    @Public()
    async requestSong(@Body() body: RequestSongDto) {
        const song = await this.queueService.requestSong(body);
        this.eventsGateway.emitNewRequest(song);
        return song;
    }

    @Post('add')
    @Roles(UserRole.OWNER, UserRole.WORKER)
    async addSongDirectly(@Body() body: AddDirectDto, @Request() req) {
        const song = await this.queueService.addDirect({
            ...body,
            addedBy: req.user.username || 'Admin'
        });
        this.eventsGateway.emitQueueUpdated();
        return song;
    }

    @Patch('approve/:id')
    @Roles(UserRole.OWNER, UserRole.WORKER)
    async approveSong(@Param('id') id: string) {
        const song = await this.queueService.approveSong(id);
        this.eventsGateway.emitQueueUpdated();
        return song;
    }

    @Patch('reject/:id')
    @Roles(UserRole.OWNER, UserRole.WORKER)
    async rejectSong(@Param('id') id: string) {
        const song = await this.queueService.rejectSong(id);
        this.eventsGateway.emitQueueUpdated();
        return song;
    }

    @Delete(':id')
    @Roles(UserRole.OWNER, UserRole.WORKER)
    async deleteSong(@Param('id') id: string) {
        const song = await this.queueService.deleteSong(id);
        this.eventsGateway.emitQueueUpdated();
        return song;
    }

    @Post('playback/pause')
    @Roles(UserRole.OWNER, UserRole.WORKER)
    async pausePlayback() {
        this.eventsGateway.emitPauseSong();
        return { success: true };
    }

    @Post('playback/resume')
    @Roles(UserRole.OWNER, UserRole.WORKER)
    async resumePlayback() {
        this.eventsGateway.emitResumeSong();
        return { success: true };
    }

    @Post('table/:id/reset')
    @Roles(UserRole.OWNER, UserRole.WORKER)
    async resetTable(@Param('id') id: string, @Request() req) {
        const tableNumber = parseInt(id);
        const closedBy = req.user.username;
        await this.queueService.resetTable(tableNumber, closedBy);
        await this.ordersService.closeTable(tableNumber);
        this.eventsGateway.emitResetTable(tableNumber);
        return { success: true };
    }

    @Get('stats')
    @Public()
    async getStats() {
        return this.queueService.getStats();
    }

    @Get('stats/tables')
    @Roles(UserRole.OWNER, UserRole.WORKER)
    async getTableLogs() {
        return this.queueService.getTableLogs();
    }

    @Get()
    @Public()
    async getQueue() {
        return this.queueService.getQueue();
    }

    @Get('recover')
    @Public()
    async recover() {
        return this.queueService.recover();
    }

    @Post('play/:id')
    @Public()
    async playSong(@Param('id') id: string) {
        const song = await this.queueService.playSong(id);
        this.eventsGateway.emitQueueUpdated();
        return song;
    }

    @Post('next')
    @Public()
    async completeSong(@Body() body: { currentId: string }) {
        const result = await this.queueService.completeSong(body.currentId);
        this.eventsGateway.emitPlayNext(result.nextSong);
        this.eventsGateway.emitQueueUpdated();
        return result;
    }

    @Patch('reorder')
    @Roles(UserRole.OWNER, UserRole.WORKER)
    async reorderQueue(@Body() body: ReorderQueueDto) {
        const result = await this.queueService.reorderQueue(body.items);
        this.eventsGateway.emitQueueUpdated();
        return result;
    }

    @Post('table/join')
    @Public()
    async joinTable(@Body() body: JoinTableDto) {
        const session = await this.queueService.joinTable(body.tableNumber, body.userName);
        this.eventsGateway.emitTablesUpdate();
        return session;
    }

    @Get('table/:id/session')
    @Public()
    async getTableSession(@Param('id') id: string) {
        const tableNumber = parseInt(id);
        const session = await this.queueService.getTableSession(tableNumber);
        return session || { userName: null };
    }

    @Get('tables')
    @Roles(UserRole.OWNER, UserRole.WORKER)
    async getTables() {
        return this.queueService.getActiveTables();
    }

    @Get('timer')
    @Public()
    async getTimerEnabled() {
        return { enabled: this.queueService.getTimerEnabled() };
    }

    @Post('timer')
    @Roles(UserRole.OWNER, UserRole.WORKER)
    async setTimerEnabled(@Body() body: ToggleSettingDto) {
        const enabled = this.queueService.setTimerEnabled(body.enabled);
        this.eventsGateway.emitTimerUpdate(enabled);
        return { enabled };
    }

    @Get('autoplay')
    @Public()
    async getAutoplayEnabled() {
        return { enabled: this.queueService.getAutoplayEnabled() };
    }

    @Post('autoplay')
    @Roles(UserRole.OWNER, UserRole.WORKER)
    async setAutoplayEnabled(@Body() body: ToggleSettingDto) {
        const enabled = this.queueService.setAutoplayEnabled(body.enabled);
        this.eventsGateway.emitQueueUpdated();
        return { enabled };
    }

    @Get('autoplay-next/:id')
    @Public()
    async getAutoplayNext(@Param('id') id: string) {
        return this.youtubeService.getAutoplayNext(id);
    }

    @Post('autoplay-add')
    @Public()
    async addAutoplaySong(@Body() body: AddDirectDto) {
        const song = await this.queueService.addDirect({
            ...body,
            addedBy: 'Autoplay'
        });
        this.eventsGateway.emitQueueUpdated();
        return song;
    }
}
