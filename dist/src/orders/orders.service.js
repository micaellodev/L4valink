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
var OrdersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma.service");
const pricing_utils_1 = require("./pricing.utils");
const printer_service_1 = require("../services/printer.service");
let OrdersService = OrdersService_1 = class OrdersService {
    constructor(prisma, printerService) {
        this.prisma = prisma;
        this.printerService = printerService;
        this.logger = new common_1.Logger(OrdersService_1.name);
    }
    async getSalesLog(filter) {
        let dateCondition = undefined;
        if (filter.startDate || filter.endDate) {
            const logWhere = {};
            if (filter.startDate)
                logWhere.openedAt = { gte: filter.startDate };
            if (filter.endDate) {
                const endOfDay = new Date(filter.endDate);
                endOfDay.setUTCHours(23, 59, 59, 999);
                logWhere.openedAt = { ...logWhere.openedAt, lte: endOfDay };
            }
            if (filter.tableNumber)
                logWhere.tableNumber = filter.tableNumber;
            const tableLogs = await this.prisma.tableLog.findMany({
                where: logWhere,
                select: { tableNumber: true, openedAt: true, closedAt: true }
            });
            if (tableLogs.length === 0)
                return [];
            const sessionORs = tableLogs.map(log => ({
                tableNumber: log.tableNumber,
                createdAt: {
                    gte: log.openedAt,
                    lte: log.closedAt || new Date()
                }
            }));
            dateCondition = { OR: sessionORs };
        }
        else if (filter.tableNumber) {
            dateCondition = { tableNumber: filter.tableNumber };
        }
        const andConditions = [{ status: { in: ['COMPLETED', 'CLOSED'] } }];
        if (dateCondition) {
            andConditions.push(dateCondition);
        }
        if (filter.sellerName) {
            andConditions.push({
                OR: [
                    { userName: { contains: filter.sellerName, mode: 'insensitive' } },
                    { workerName: { contains: filter.sellerName, mode: 'insensitive' } }
                ]
            });
        }
        const finalWhere = { AND: andConditions };
        return this.prisma.order.findMany({
            where: finalWhere,
            orderBy: { createdAt: 'desc' },
        });
    }
    async getTopBeverages(startDate, endDate) {
        let dateCondition = undefined;
        if (startDate || endDate) {
            const logWhere = {};
            if (startDate)
                logWhere.openedAt = { gte: startDate };
            if (endDate) {
                const endOfDay = new Date(endDate);
                endOfDay.setUTCHours(23, 59, 59, 999);
                logWhere.openedAt = { ...logWhere.openedAt, lte: endOfDay };
            }
            const tableLogs = await this.prisma.tableLog.findMany({
                where: logWhere,
                select: { tableNumber: true, openedAt: true, closedAt: true }
            });
            if (tableLogs.length === 0)
                return [];
            const sessionORs = tableLogs.map(log => ({
                tableNumber: log.tableNumber,
                createdAt: {
                    gte: log.openedAt,
                    lte: log.closedAt || new Date()
                }
            }));
            dateCondition = { OR: sessionORs };
        }
        const finalWhere = {
            status: { in: ['COMPLETED', 'CLOSED'] }
        };
        if (dateCondition) {
            finalWhere.AND = [dateCondition];
        }
        const orders = await this.prisma.order.findMany({
            where: finalWhere,
            select: { items: true },
        });
        const itemCounts = new Map();
        for (const order of orders) {
            if (Array.isArray(order.items)) {
                for (const item of order.items) {
                    const name = item.name.trim();
                    const quantity = item.quantity || 0;
                    itemCounts.set(name, (itemCounts.get(name) || 0) + quantity);
                }
            }
        }
        return Array.from(itemCounts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }
    async createOrder(data) {
        const [menuItems, promotions] = await Promise.all([
            this.prisma.menuItem.findMany({
                select: { name: true, price: true },
            }),
            this.prisma.promotion.findMany({
                where: { isActive: true },
                select: { title: true, price: true },
            }),
        ]);
        const menuPriceMap = {};
        for (const item of menuItems) {
            menuPriceMap[item.name] = item.price;
        }
        const promotionPriceMap = {};
        for (const promo of promotions) {
            if (promo.price != null) {
                promotionPriceMap[promo.title] = promo.price;
            }
        }
        const totalPrice = (0, pricing_utils_1.calculateOrderPrice)(data.items, menuPriceMap, promotionPriceMap);
        const order = await this.prisma.order.create({
            data: {
                tableNumber: data.tableNumber,
                userName: data.userName,
                workerName: data.workerName,
                items: data.items,
                totalPrice: totalPrice,
                status: 'PENDING',
            },
        });
        try {
            const existingSession = await this.prisma.tableSession.findUnique({
                where: { tableNumber: data.tableNumber },
            });
            if (!existingSession) {
                const customerName = data.userName || `Mesa ${data.tableNumber}`;
                await this.prisma.tableSession.create({
                    data: {
                        tableNumber: data.tableNumber,
                        userName: customerName,
                    },
                });
                await this.prisma.tableLog.create({
                    data: {
                        tableNumber: data.tableNumber,
                        customerName: customerName,
                        openedBy: 'Order',
                    },
                });
            }
        }
        catch (e) {
            this.logger.error('Error creating table session on order', e);
        }
        this.printerService.printOrder(order, data.items).catch((error) => {
            this.logger.error('Failed to print order', error);
        });
        return order;
    }
    async getOrders() {
        return this.prisma.order.findMany({
            where: { status: 'PENDING' },
            orderBy: { createdAt: 'desc' },
        });
    }
    async closeTable(tableNumber) {
        return this.prisma.order.updateMany({
            where: {
                tableNumber: tableNumber,
                status: {
                    in: ['PENDING', 'COMPLETED']
                }
            },
            data: {
                status: 'CLOSED'
            }
        });
    }
    async getCompletedOrders() {
        return this.prisma.order.findMany({
            where: {
                status: {
                    in: ['COMPLETED', 'CLOSED']
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async completeOrder(id) {
        return this.prisma.order.update({
            where: { id },
            data: { status: 'COMPLETED' },
        });
    }
    async deleteOrder(id) {
        return this.prisma.order.delete({
            where: { id }
        });
    }
    async getOrdersByTable(tableNumber) {
        const orders = await this.prisma.order.findMany({
            where: {
                tableNumber: tableNumber,
                status: {
                    in: ['PENDING', 'COMPLETED']
                }
            },
            orderBy: { createdAt: 'desc' },
        });
        const itemsMap = new Map();
        let totalPrice = 0;
        for (const order of orders) {
            totalPrice += order.totalPrice || 0;
            if (Array.isArray(order.items)) {
                for (const item of order.items) {
                    const currentQty = itemsMap.get(item.name) || 0;
                    itemsMap.set(item.name, currentQty + item.quantity);
                }
            }
        }
        const aggregatedItems = Array.from(itemsMap.entries()).map(([name, quantity]) => ({
            name,
            quantity
        }));
        return {
            tableNumber,
            orders,
            aggregatedItems,
            totalPrice,
            orderCount: orders.length
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = OrdersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        printer_service_1.PrinterService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map