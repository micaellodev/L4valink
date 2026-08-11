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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
let InventoryService = class InventoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listProducts() {
        return this.prisma.inventoryProduct.findMany({
            orderBy: { name: 'asc' },
            select: { id: true, name: true, createdAt: true },
        });
    }
    async createProduct(name) {
        const exists = await this.prisma.inventoryProduct.findUnique({ where: { name } });
        if (exists)
            throw new common_1.ConflictException('Ya existe un producto con ese nombre');
        return this.prisma.inventoryProduct.create({
            data: { name },
            select: { id: true, name: true, createdAt: true },
        });
    }
    async deleteProduct(id) {
        const exists = await this.prisma.inventoryProduct.findUnique({ where: { id } });
        if (!exists)
            throw new common_1.NotFoundException('Producto no encontrado');
        return this.prisma.inventoryProduct.delete({ where: { id } });
    }
    async getDailyInventory(date) {
        const day = new Date(date);
        return this.prisma.dailyInventoryEntry.findMany({
            where: { date: day },
            include: { product: { select: { id: true, name: true } } },
            orderBy: { product: { name: 'asc' } },
        });
    }
    async upsertDailyInventory(date, entries, submittedBy) {
        const day = new Date(date);
        return this.prisma.$transaction(entries.map(entry => this.prisma.dailyInventoryEntry.upsert({
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
        })));
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map