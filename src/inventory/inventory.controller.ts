import {
    Controller, Get, Post, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards, Request,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { SubmitDailyInventoryDto } from './dto/daily-inventory.dto';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) {}

    @Get('products')
    @Roles(UserRole.OWNER, UserRole.WORKER)
    listProducts() {
        return this.inventoryService.listProducts();
    }

    @Post('products')
    @HttpCode(HttpStatus.CREATED)
    @Roles(UserRole.OWNER)
    createProduct(@Body() body: CreateProductDto) {
        return this.inventoryService.createProduct(body.name);
    }

    @Delete('products/:id')
    @HttpCode(HttpStatus.OK)
    @Roles(UserRole.OWNER)
    deleteProduct(@Param('id') id: string) {
        return this.inventoryService.deleteProduct(id);
    }

    @Get('daily')
    @Roles(UserRole.OWNER, UserRole.WORKER)
    getDailyInventory(@Query('date') date: string) {
        return this.inventoryService.getDailyInventory(date);
    }

    @Post('daily')
    @HttpCode(HttpStatus.OK)
    @Roles(UserRole.OWNER, UserRole.WORKER)
    submitDailyInventory(
        @Request() req,
        @Body()
        body: SubmitDailyInventoryDto,
    ) {
        const submittedBy = req.user?.username || 'worker';
        return this.inventoryService.upsertDailyInventory(body.date, body.entries, submittedBy);
    }
}
