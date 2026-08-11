import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class InventoryService {
    constructor(private prisma: PrismaService) {}

    // ── Products (catalog) ───────────────────────────────────

    async listProducts() {
        return this.prisma.inventoryProduct.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, name: true, createdAt: true },
        });
    }

    async createProduct(name: string) {
        const exists = await this.prisma.inventoryProduct.findUnique({ where: { name } });
        if (exists) throw new ConflictException('Ya existe un producto con ese nombre');
        return this.prisma.inventoryProduct.create({
            data: { name },
            select: { id: true, name: true, createdAt: true },
        });
    }

    async deleteProduct(id: string) {
        const exists = await this.prisma.inventoryProduct.findUnique({ where: { id } });
        if (!exists) throw new NotFoundException('Producto no encontrado');
        return this.prisma.inventoryProduct.delete({ where: { id } });
    }

    // ── Daily inventory entries ───────────────────────────────

    async getDailyInventory(date: string) {
        const day = new Date(date);
        return this.prisma.dailyInventoryEntry.findMany({
            where: { date: day },
            include: { product: { select: { id: true, name: true } } },
            orderBy: { product: { name: 'asc' } },
        });
    }

    async upsertDailyInventory(
        date: string,
        entries: Array<{ productId: string; milliliters: number; quantity: number }>,
        submittedBy: string,
    ) {
        const day = new Date(date);

        return this.prisma.$transaction(
            entries.map(entry =>
                this.prisma.dailyInventoryEntry.upsert({
                    where: { productId_date: { productId: entry.productId, date: day } },
                    update: {
                        milliliters: entry.milliliters,
                        quantity: entry.quantity,
                        submittedBy,
                    },
                    create: {
                        productId: entry.productId,
                        date: day,
                        milliliters: entry.milliliters,
                        quantity: entry.quantity,
                        submittedBy,
                    },
                    include: { product: { select: { id: true, name: true } } },
                }),
            ),
        );
    }
}
