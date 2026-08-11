import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly storage: StorageService,
    ) {}

    private readonly includeItems = {
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

    async create(dto: CreatePromotionDto) {
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

    async update(id: string, dto: UpdatePromotionDto) {
        const promotion = await this.prisma.promotion.findUnique({ where: { id } });
        if (!promotion) throw new NotFoundException('Promoción no encontrada');

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

    async delete(id: string) {
        const promotion = await this.prisma.promotion.findUnique({ where: { id } });
        if (!promotion) throw new NotFoundException('Promoción no encontrada');

        if (promotion.imageUrl) {
            const key = this.storage.extractKeyFromUrl(promotion.imageUrl);
            if (key) {
                try {
                    await this.storage.deleteImage(key);
                } catch {
                    // ignore cleanup errors
                }
            }
        }

        return this.prisma.promotion.delete({ where: { id } });
    }

    async uploadImage(id: string, file: Express.Multer.File) {
        const promotion = await this.prisma.promotion.findUnique({ where: { id } });
        if (!promotion) throw new NotFoundException('Promoción no encontrada');

        const result = await this.storage.uploadImage(file, 'promotions');

        if (promotion.imageUrl) {
            const oldKey = this.storage.extractKeyFromUrl(promotion.imageUrl);
            if (oldKey) {
                try {
                    await this.storage.deleteImage(oldKey);
                } catch {
                    // ignore cleanup errors
                }
            }
        }

        return this.prisma.promotion.update({
            where: { id },
            data: { imageUrl: result.url },
            select: { id: true, title: true, imageUrl: true },
        });
    }
}
