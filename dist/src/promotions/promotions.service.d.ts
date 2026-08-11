import { PrismaService } from '../prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
export declare class PromotionsService {
    private readonly prisma;
    private readonly storage;
    constructor(prisma: PrismaService, storage: StorageService);
    private readonly includeItems;
    list(): Promise<({
        items: ({
            menuItem: {
                variants: {
                    id: string;
                    price: number | null;
                    imageUrl: string | null;
                    order: number;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    menuItemId: string;
                }[];
            } & {
                id: string;
                description: string | null;
                price: number;
                imageUrl: string | null;
                isActive: boolean;
                order: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                categoryId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            promotionId: string;
            menuItemId: string;
        })[];
    } & {
        id: string;
        title: string;
        description: string | null;
        price: number | null;
        quantity: number;
        imageUrl: string | null;
        isActive: boolean;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    listActive(): Promise<({
        items: ({
            menuItem: {
                variants: {
                    id: string;
                    price: number | null;
                    imageUrl: string | null;
                    order: number;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    menuItemId: string;
                }[];
            } & {
                id: string;
                description: string | null;
                price: number;
                imageUrl: string | null;
                isActive: boolean;
                order: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                categoryId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            promotionId: string;
            menuItemId: string;
        })[];
    } & {
        id: string;
        title: string;
        description: string | null;
        price: number | null;
        quantity: number;
        imageUrl: string | null;
        isActive: boolean;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    create(dto: CreatePromotionDto): Promise<{
        items: ({
            menuItem: {
                variants: {
                    id: string;
                    price: number | null;
                    imageUrl: string | null;
                    order: number;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    menuItemId: string;
                }[];
            } & {
                id: string;
                description: string | null;
                price: number;
                imageUrl: string | null;
                isActive: boolean;
                order: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                categoryId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            promotionId: string;
            menuItemId: string;
        })[];
    } & {
        id: string;
        title: string;
        description: string | null;
        price: number | null;
        quantity: number;
        imageUrl: string | null;
        isActive: boolean;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdatePromotionDto): Promise<{
        items: ({
            menuItem: {
                variants: {
                    id: string;
                    price: number | null;
                    imageUrl: string | null;
                    order: number;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    menuItemId: string;
                }[];
            } & {
                id: string;
                description: string | null;
                price: number;
                imageUrl: string | null;
                isActive: boolean;
                order: number;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                categoryId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            promotionId: string;
            menuItemId: string;
        })[];
    } & {
        id: string;
        title: string;
        description: string | null;
        price: number | null;
        quantity: number;
        imageUrl: string | null;
        isActive: boolean;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    delete(id: string): Promise<{
        id: string;
        title: string;
        description: string | null;
        price: number | null;
        quantity: number;
        imageUrl: string | null;
        isActive: boolean;
        order: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    uploadImage(id: string, file: Express.Multer.File): Promise<{
        id: string;
        title: string;
        imageUrl: string;
    }>;
}
