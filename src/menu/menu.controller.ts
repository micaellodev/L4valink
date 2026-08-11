import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    HttpCode,
    HttpStatus,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '@prisma/client';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Controller('menu')
export class MenuController {
    constructor(private readonly menuService: MenuService) {}

    @Get()
    @Public()
    listPublicMenu() {
        return this.menuService.listPublicMenu();
    }

    // ── Categories ───────────────────────────────────────────

    @Get('categories')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.WORKER)
    listCategories() {
        return this.menuService.listCategories();
    }

    @Post('categories')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER)
    createCategory(@Body() body: CreateCategoryDto) {
        return this.menuService.createCategory(body);
    }

    @Delete('categories/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER)
    deleteCategory(@Param('id') id: string) {
        return this.menuService.deleteCategory(id);
    }

    // ── Items ────────────────────────────────────────────────

    @Post('items')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.WORKER)
    createItem(@Body() body: CreateItemDto) {
        return this.menuService.createItem(body);
    }

    @Put('items/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.WORKER)
    updateItem(@Param('id') id: string, @Body() body: UpdateItemDto) {
        return this.menuService.updateItem(id, body);
    }

    @Delete('items/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.WORKER)
    deleteItem(@Param('id') id: string) {
        return this.menuService.deleteItem(id);
    }

    @Post('items/:id/image')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.WORKER)
    @UseInterceptors(FileInterceptor('image'))
    uploadItemImage(
        @Param('id') id: string,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024, message: 'La imagen debe pesar menos de 5MB' }),
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)/ }),
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        return this.menuService.uploadItemImage(id, file);
    }

    // ── Variants ───────────────────────────────────────────────

    @Post('items/:id/variants')
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.WORKER)
    createVariant(
        @Param('id') id: string,
        @Body() body: CreateVariantDto,
    ) {
        return this.menuService.createVariant(id, body);
    }

    @Put('variants/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.WORKER)
    updateVariant(
        @Param('id') id: string,
        @Body() body: UpdateVariantDto,
    ) {
        return this.menuService.updateVariant(id, body);
    }

    @Delete('variants/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.WORKER)
    deleteVariant(@Param('id') id: string) {
        return this.menuService.deleteVariant(id);
    }

    @Post('variants/:id/image')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.OWNER, UserRole.WORKER)
    @UseInterceptors(FileInterceptor('image'))
    uploadVariantImage(
        @Param('id') id: string,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024, message: 'La imagen debe pesar menos de 5MB' }),
                    new FileTypeValidator({ fileType: /(jpg|jpeg|png|webp)/ }),
                ],
            }),
        )
        file: Express.Multer.File,
    ) {
        return this.menuService.uploadVariantImage(id, file);
    }
}
