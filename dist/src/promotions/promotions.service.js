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
exports.PromotionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const storage_service_1 = require("../storage/storage.service");
let PromotionsService = class PromotionsService {
    constructor(prisma, storage) {
        this.prisma = prisma;
        this.storage = storage;
        this.includeItems = {
            items: {
                include: {
                    menuItem: {
                        include: {
                            variants: true,
                        },
                    },
                },
            },
        };
    }
    async list() {
        return this.prisma.promotion.findMany({
            orderBy: { order: 'asc' },
            include: this.includeItems,
        });
    }
    async listActive() {
        return this.prisma.promotion.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
            include: this.includeItems,
        });
    }
    async create(dto) {
        const promotion = await this.prisma.promotion.create({
            data: {
                title: dto.title,
                description: dto.description,
                price: dto.price,
                quantity: dto.quantity ?? 1,
                imageUrl: dto.imageUrl,
                isActive: dto.isActive ?? true,
                order: dto.order ?? 0,
            },
        });
        if (dto.menuItemIds && dto.menuItemIds.length > 0) {
            await this.prisma.promotionItem.createMany({
                data: dto.menuItemIds.map((menuItemId) => ({
                    promotionId: promotion.id,
                    menuItemId,
                })),
            });
        }
        return this.prisma.promotion.findUnique({
            where: { id: promotion.id },
            include: this.includeItems,
        });
    }
    async update(id, dto) {
        const promotion = await this.prisma.promotion.findUnique({ where: { id } });
        if (!promotion)
            throw new common_1.NotFoundException('Promoción no encontrada');
        const { menuItemIds, ...rest } = dto;
        const updated = await this.prisma.promotion.update({
            where: { id },
            data: { ...rest },
        });
        if (menuItemIds !== undefined) {
            await this.prisma.promotionItem.deleteMany({ where: { promotionId: id } });
            if (menuItemIds.length > 0) {
                await this.prisma.promotionItem.createMany({
                    data: menuItemIds.map((menuItemId) => ({
                        promotionId: id,
                        menuItemId,
                    })),
                });
            }
        }
        return this.prisma.promotion.findUnique({
            where: { id },
            include: this.includeItems,
        });
    }
    async delete(id) {
        const promotion = await this.prisma.promotion.findUnique({ where: { id } });
        if (!promotion)
            throw new common_1.NotFoundException('Promoción no encontrada');
        if (promotion.imageUrl) {
            const key = this.storage.extractKeyFromUrl(promotion.imageUrl);
            if (key) {
                try {
                    await this.storage.deleteImage(key);
                }
                catch {
                }
            }
        }
        return this.prisma.promotion.delete({ where: { id } });
    }
    async uploadImage(id, file) {
        const promotion = await this.prisma.promotion.findUnique({ where: { id } });
        if (!promotion)
            throw new common_1.NotFoundException('Promoción no encontrada');
        const result = await this.storage.uploadImage(file, 'promotions');
        if (promotion.imageUrl) {
            const oldKey = this.storage.extractKeyFromUrl(promotion.imageUrl);
            if (oldKey) {
                try {
                    await this.storage.deleteImage(oldKey);
                }
                catch {
                }
            }
        }
        return this.prisma.promotion.update({
            where: { id },
            data: { imageUrl: result.url },
            select: { id: true, title: true, imageUrl: true },
        });
    }
};
exports.PromotionsService = PromotionsService;
exports.PromotionsService = PromotionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        storage_service_1.StorageService])
], PromotionsService);
//# sourceMappingURL=promotions.service.js.map