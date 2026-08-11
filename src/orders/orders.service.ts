import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { calculateOrderPrice } from './pricing.utils';
import { PrinterService } from '../services/printer.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
    private readonly logger = new Logger(OrdersService.name);

    constructor(
        private prisma: PrismaService,
        private printerService: PrinterService
    ) { }

    async getSalesLog(filter: { startDate?: Date; endDate?: Date; tableNumber?: number; sellerName?: string }) {
        let dateCondition: any = undefined;

        if (filter.startDate || filter.endDate) {
            const logWhere: any = {};
            if (filter.startDate) logWhere.openedAt = { gte: filter.startDate };
            if (filter.endDate) {
                const endOfDay = new Date(filter.endDate);
                endOfDay.setUTCHours(23, 59, 59, 999);
                logWhere.openedAt = { ...logWhere.openedAt, lte: endOfDay };
            }
            if (filter.tableNumber) logWhere.tableNumber = filter.tableNumber;

            const tableLogs = await this.prisma.tableLog.findMany({
                where: logWhere,
                select: { tableNumber: true, openedAt: true, closedAt: true }
            });

            if (tableLogs.length === 0) return [];

            const sessionORs = tableLogs.map(log => ({
                tableNumber: log.tableNumber,
                createdAt: {
                    gte: log.openedAt,
                    lte: log.closedAt || new Date()
                }
            }));

            dateCondition = { OR: sessionORs };
        } else if (filter.tableNumber) {
            dateCondition = { tableNumber: filter.tableNumber };
        }

        const andConditions: any[] = [{ status: { in: ['COMPLETED', 'CLOSED'] } }];

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

    async getTopBeverages(startDate?: Date, endDate?: Date) {
        let dateCondition: any = undefined;

        if (startDate || endDate) {
            const logWhere: any = {};
            if (startDate) logWhere.openedAt = { gte: startDate };
            if (endDate) {
                const endOfDay = new Date(endDate);
                endOfDay.setUTCHours(23, 59, 59, 999);
                logWhere.openedAt = { ...logWhere.openedAt, lte: endOfDay };
            }

            const tableLogs = await this.prisma.tableLog.findMany({
                where: logWhere,
                select: { tableNumber: true, openedAt: true, closedAt: true }
            });

            if (tableLogs.length === 0) return [];

            const sessionORs = tableLogs.map(log => ({
                tableNumber: log.tableNumber,
                createdAt: {
                    gte: log.openedAt,
                    lte: log.closedAt || new Date()
                }
            }));

            dateCondition = { OR: sessionORs };
        }

        const finalWhere: any = {
            status: { in: ['COMPLETED', 'CLOSED'] }
        };

        if (dateCondition) {
            finalWhere.AND = [dateCondition];
        }

        const orders = await this.prisma.order.findMany({
            where: finalWhere,
            select: { items: true },
        });

        const itemCounts = new Map<string, number>();

        for (const order of orders) {
            if (Array.isArray(order.items)) {
                for (const item of order.items as any[]) {
                    // Normalize name to avoid case sensitivity issues
                    const name = item.name.trim(); // You might want to remove 'trim' or handle it differently if needed
                    const quantity = item.quantity || 0;
                    itemCounts.set(name, (itemCounts.get(name) || 0) + quantity);
                }
            }
        }

        // Convert to array and sort
        return Array.from(itemCounts.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }

    async createOrder(data: CreateOrderDto) {
        // Consultas de precios en paralelo para responder más rápido
        const [menuItems, promotions] = await Promise.all([
            this.prisma.menuItem.findMany({
                select: { name: true, price: true },
            }),
            this.prisma.promotion.findMany({
                where: { isActive: true },
                select: { title: true, price: true },
            }),
        ]);

        const menuPriceMap: Record<string, number> = {};
        for (const item of menuItems) {
            menuPriceMap[item.name] = item.price;
        }

        const promotionPriceMap: Record<string, number> = {};
        for (const promo of promotions) {
            if (promo.price != null) {
                promotionPriceMap[promo.title] = promo.price;
            }
        }

        const totalPrice = calculateOrderPrice(data.items, menuPriceMap, promotionPriceMap);

        const order = await this.prisma.order.create({
            data: {
                tableNumber: data.tableNumber,
                userName: data.userName,
                workerName: data.workerName,
                items: data.items as any,
                totalPrice: totalPrice,
                status: 'PENDING',
            },
        });

        // Asegurar que exista la sesión de mesa (TableSession) y el registro (TableLog)
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
        } catch (e) {
            this.logger.error('Error creating table session on order', e);
        }

        // Imprimir en segundo plano: NO bloquear la respuesta al cliente.
        // La impresora de red puede tardar segundos (o no responder).
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

    async closeTable(tableNumber: number) {
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

    async completeOrder(id: string) {
        return this.prisma.order.update({
            where: { id },
            data: { status: 'COMPLETED' },
        });
    }

    async deleteOrder(id: string) {
        return this.prisma.order.delete({
            where: { id }
        });
    }

    async getOrdersByTable(tableNumber: number) {
        const orders = await this.prisma.order.findMany({
            where: {
                tableNumber: tableNumber,
                status: {
                    in: ['PENDING', 'COMPLETED']
                }
            },
            orderBy: { createdAt: 'desc' },
        });

        // Aggregate items across all orders
        const itemsMap = new Map<string, number>();
        let totalPrice = 0;

        for (const order of orders) {
            totalPrice += order.totalPrice || 0;

            if (Array.isArray(order.items)) {
                for (const item of order.items as any[]) {
                    const currentQty = itemsMap.get(item.name) || 0;
                    itemsMap.set(item.name, currentQty + item.quantity);
                }
            }
        }

        // Convert map to array
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
}
