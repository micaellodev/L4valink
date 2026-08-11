import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @Roles(UserRole.OWNER)
    create(@Body() body: CreateUserDto) {
        return this.usersService.createWorker(body.username, body.password);
    }

    @Get()
    @Roles(UserRole.OWNER)
    findAll() {
        return this.usersService.findAllWorkers();
    }

    @Delete(':id')
    @Roles(UserRole.OWNER)
    remove(@Param('id') id: string) {
        return this.usersService.deleteUser(id);
    }
}
