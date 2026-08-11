import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class MenuService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly storage: StorageService,
    ) {}

    // ── Categories ───────────────────────────────────────────

    async listCategories() {
        return this.prisma.menuCategory.findMany({
            orderBy: { order: 'asc' },
            include: {
                items: {
                    where: { isActive: true },
                    orderBy: { order: 'asc' },
                    include: {
                        variants: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
        });
    }

    async listPublicMenu() {
        return this.prisma.menuCategory.findMany({
            orderBy: { order: 'asc' },
            include: {
                items: {
                    where: { isActive: true },
                    orderBy: { order: 'asc' },
                    select: {
                        id: true,
                        name: true,
                        description: true,
                        price: true,
                        imageUrl: true,
                        isActive: true,
                        order: true,
                        categoryId: true,
                        variants: {
                            orderBy: { order: 'asc' },
                            select: {
                                id: true,
                                name: true,
                                price: true,
                                imageUrl: true,
                                order: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async createCategory(dto: CreateCategoryDto) {
        const slug = dto.slug || this.slugify(dto.name);
        const existing = await this.prisma.menuCategory.findFirst({
            where: { OR: [{ name: dto.name }, { slug }] },
        });
        if (existing) {
            throw new ConflictException('Ya existe una categoría con ese nombre o slug');
        }
        return this.prisma.menuCategory.create({
            data: { name: dto.name, slug, description: dto.description },
        });
    }

    async deleteCategory(id: string) {
        const exists = await this.prisma.menuCategory.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException('Categoría no encontrada');
        return this.prisma.menuCategory.delete({ where: { id } });
    }

    // ── Items ────────────────────────────────────────────────

    async createItem(dto: CreateItemDto) {
        const category = await this.prisma.menuCategory.findUnique({
            where: { id: dto.categoryId },
        });
        if (!category) throw new NotFoundException('Categoría no encontrada');

        return this.prisma.menuItem.create({
            data: {
                name: dto.name,
                description: dto.description,
                price: dto.price,
                categoryId: dto.categoryId,
                isActive: dto.isActive ?? true,
            },
        });
    }

    async updateItem(id: string, dto: UpdateItemDto) {
        const item = await this.prisma.menuItem.findUnique({ where: { id } });
        if (!item) throw new NotFoundException('Producto no encontrado');

        if (dto.categoryId) {
            const category = await this.prisma.menuCategory.findUnique({
                where: { id: dto.categoryId },
            });
            if (!category) throw new NotFoundException('Categoría no encontrada');
        }

        return this.prisma.menuItem.update({
            where: { id },
            data: { ...dto },
        });
    }

    async deleteItem(id: string) {
        const item = await this.prisma.menuItem.findUnique({
            where: { id },
            include: { variants: true },
        });
        if (!item) throw new NotFoundException('Producto no encontrado');

        if (item.imageUrl) {
            const key = this.storage.extractKeyFromUrl(item.imageUrl);
            if (key) {
                try {
                    await this.storage.deleteImage(key);
                } catch {
                    // Ignore cleanup errors
                }
            }
        }

        for (const variant of item.variants) {
            if (variant.imageUrl) {
                const key = this.storage.extractKeyFromUrl(variant.imageUrl);
                if (key) {
                    try {
                        await this.storage.deleteImage(key);
                    } catch {
                        // Ignore cleanup errors
                    }
                }
            }
        }

        return this.prisma.menuItem.delete({ where: { id } });
    }

    // ── Variants ─────────────────────────────────────────────

    async createVariant(itemId: string, dto: CreateVariantDto) {
        const item = await this.prisma.menuItem.findUnique({ where: { id: itemId } });
        if (!item) throw new NotFoundException('Producto no encontrado');

        return this.prisma.menuItemVariant.create({
            data: {
                name: dto.name,
                price: dto.price,
                imageUrl: dto.imageUrl,
                menuItemId: itemId,
            },
        });
    }

    async updateVariant(id: string, dto: UpdateVariantDto) {
        const variant = await this.prisma.menuItemVariant.findUnique({ where: { id } });
        if (!variant) throw new NotFoundException('Variante no encontrada');

        return this.prisma.menuItemVariant.update({
            where: { id },
            data: { ...dto },
        });
    }

    async deleteVariant(id: string) {
        const variant = await this.prisma.menuItemVariant.findUnique({ where: { id } });
        if (!variant) throw new NotFoundException('Variante no encontrada');

        if (variant.imageUrl) {
            const key = this.storage.extractKeyFromUrl(variant.imageUrl);
            if (key) {
                try {
                    await this.storage.deleteImage(key);
                } catch {
                    // Ignore cleanup errors
                }
            }
        }

        return this.prisma.menuItemVariant.delete({ where: { id } });
    }

    async uploadVariantImage(id: string, file: Express.Multer.File) {
        const variant = await this.prisma.menuItemVariant.findUnique({ where: { id } });
        if (!variant) throw new NotFoundException('Variante no encontrada');

        const result = await this.storage.uploadImage(file, 'menu');

        if (variant.imageUrl) {
            const oldKey = this.storage.extractKeyFromUrl(variant.imageUrl);
            if (oldKey) {
                try {
                    await this.storage.deleteImage(oldKey);
                } catch {
                    // Ignore cleanup errors
                }
            }
        }

        return this.prisma.menuItemVariant.update({
            where: { id },
            data: { imageUrl: result.url },
            select: {
                id: true,
                name: true,
                imageUrl: true,
            },
        });
    }

    async uploadItemImage(id: string, file: Express.Multer.File) {
        const item = await this.prisma.menuItem.findUnique({ where: { id } });
        if (!item) throw new NotFoundException('Producto no encontrado');

        const result = await this.storage.uploadImage(file, 'menu');

        // Delete previous image if present
        if (item.imageUrl) {
            const oldKey = this.storage.extractKeyFromUrl(item.imageUrl);
            if (oldKey) {
                try {
                    await this.storage.deleteImage(oldKey);
                } catch {
                    // Ignore cleanup errors
                }
            }
        }

        return this.prisma.menuItem.update({
            where: { id },
            data: { imageUrl: result.url },
            select: {
                id: true,
                name: true,
                imageUrl: true,
            },
        });
    }

    private slugify(text: string): string {
        return text
            .toString()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-');
    }
}
