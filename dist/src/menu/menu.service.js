"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const storage_service_1 = require("../storage/storage.service");
let MenuService = class MenuService {
    constructor(prisma, storage) {
        this.prisma = prisma;
        this.storage = storage;
    }
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
    async createCategory(dto) {
        const slug = dto.slug || this.slugify(dto.name);
        const existing = await this.prisma.menuCategory.findFirst({
            where: { OR: [{ name: dto.name }, { slug }] },
        });
        if (existing) {
            throw new common_1.ConflictException('Ya existe una categoría con ese nombre o slug');
        }
        return this.prisma.menuCategory.create({
            data: { name: dto.name, slug, description: dto.description },
        });
    }
    async deleteCategory(id) {
        const exists = await this.prisma.menuCategory.findUnique({ where: { id } });
        if (!exists)
            throw new common_1.NotFoundException('Categoría no encontrada');
        return this.prisma.menuCategory.delete({ where: { id } });
    }
    async createItem(dto) {
        const category = await this.prisma.menuCategory.findUnique({
            where: { id: dto.categoryId },
        });
        if (!category)
            throw new common_1.NotFoundException('Categoría no encontrada');
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
    async updateItem(id, dto) {
        const item = await this.prisma.menuItem.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Producto no encontrado');
        if (dto.categoryId) {
            const category = await this.prisma.menuCategory.findUnique({
                where: { id: dto.categoryId },
            });
            if (!category)
                throw new common_1.NotFoundException('Categoría no encontrada');
        }
        return this.prisma.menuItem.update({
            where: { id },
            data: { ...dto },
        });
    }
    async deleteItem(id) {
        const item = await this.prisma.menuItem.findUnique({
            where: { id },
            include: { variants: true },
        });
        if (!item)
            throw new common_1.NotFoundException('Producto no encontrado');
        if (item.imageUrl) {
            const key = this.storage.extractKeyFromUrl(item.imageUrl);
            if (key) {
                try {
                    await this.storage.deleteImage(key);
                }
                catch {
                }
            }
        }
        for (const variant of item.variants) {
            if (variant.imageUrl) {
                const key = this.storage.extractKeyFromUrl(variant.imageUrl);
                if (key) {
                    try {
                        await this.storage.deleteImage(key);
                    }
                    catch {
                    }
                }
            }
        }
        return this.prisma.menuItem.delete({ where: { id } });
    }
    async createVariant(itemId, dto) {
        const item = await this.prisma.menuItem.findUnique({ where: { id: itemId } });
        if (!item)
            throw new common_1.NotFoundException('Producto no encontrado');
        return this.prisma.menuItemVariant.create({
            data: {
                name: dto.name,
                price: dto.price,
                imageUrl: dto.imageUrl,
                menuItemId: itemId,
            },
        });
    }
    async updateVariant(id, dto) {
        const variant = await this.prisma.menuItemVariant.findUnique({ where: { id } });
        if (!variant)
            throw new common_1.NotFoundException('Variante no encontrada');
        return this.prisma.menuItemVariant.update({
            where: { id },
            data: { ...dto },
        });
    }
    async deleteVariant(id) {
        const variant = await this.prisma.menuItemVariant.findUnique({ where: { id } });
        if (!variant)
            throw new common_1.NotFoundException('Variante no encontrada');
        if (variant.imageUrl) {
            const key = this.storage.extractKeyFromUrl(variant.imageUrl);
            if (key) {
                try {
                    await this.storage.deleteImage(key);
                }
                catch {
                }
            }
        }
        return this.prisma.menuItemVariant.delete({ where: { id } });
    }
    async uploadVariantImage(id, file) {
        const variant = await this.prisma.menuItemVariant.findUnique({ where: { id } });
        if (!variant)
            throw new common_1.NotFoundException('Variante no encontrada');
        const result = await this.storage.uploadImage(file, 'menu');
        if (variant.imageUrl) {
            const oldKey = this.storage.extractKeyFromUrl(variant.imageUrl);
            if (oldKey) {
                try {
                    await this.storage.deleteImage(oldKey);
                }
                catch {
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
    async uploadItemImage(id, file) {
        const item = await this.prisma.menuItem.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Producto no encontrado');
        const result = await this.storage.uploadImage(file, 'menu');
        if (item.imageUrl) {
            const oldKey = this.storage.extractKeyFromUrl(item.imageUrl);
            if (oldKey) {
                try {
                    await this.storage.deleteImage(oldKey);
                }
                catch {
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
    slugify(text) {
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
};
exports.MenuService = MenuService;
exports.MenuService = MenuService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService])
], MenuService);
//# sourceMappingURL=menu.service.js.map