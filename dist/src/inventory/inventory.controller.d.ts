import { InventoryService } from './inventory.service';
import { CreateProductDto } from './dto/create-product.dto';
import { SubmitDailyInventoryDto } from './dto/daily-inventory.dto';
export declare class InventoryController {
    private readonly inventoryService;
    constructor(inventoryService: InventoryService);
    listProducts(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
    }[]>;
    createProduct(body: CreateProductDto): Promise<{
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
    submitDailyInventory(req: any, body: SubmitDailyInventoryDto): Promise<({
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
