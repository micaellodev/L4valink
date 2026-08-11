import { PrismaService } from '../prisma.service';
export declare class InventoryService {
    private prisma;
    constructor(prisma: PrismaService);
    listProducts(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
    }[]>;
    createProduct(name: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
    }>;
    deleteProduct(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
    }>;
    getDailyInventory(date: string): Promise<({
        product: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        quantity: number;
        date: Date;
        milliliters: number;
        submittedBy: string | null;
        productId: string;
    })[]>;
    upsertDailyInventory(date: string, entries: Array<{
        productId: string;
        milliliters: number;
        quantity: number;
    }>, submittedBy: string): Promise<({
        product: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        quantity: number;
        date: Date;
        milliliters: number;
        submittedBy: string | null;
        productId: string;
    })[]>;
}
