import { PrismaService } from '../prisma.service';
import { StorageService } from '../storage/storage.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
export declare class MenuService {
    private readonly prisma;
    private readonly storage;
    constructor(prisma: PrismaService, storage: StorageService);
    listCategories(): Promise<({
        items: ({
            variants: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                order: number;
                price: number | null;
                imageUrl: string | null;
                menuItemId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            order: number;
            description: string | null;
            price: number;
            imageUrl: string | null;
            isActive: boolean;
            categoryId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        order: number;
        description: string | null;
        slug: string;
    })[]>;
    listPublicMenu(): Promise<({
        items: {
            id: string;
            name: string;
            order: number;
            description: string;
            price: number;
            imageUrl: string;
            isActive: boolean;
            categoryId: string;
            variants: {
                id: string;
                name: string;
                order: number;
                price: number;
                imageUrl: string;
            }[];
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        order: number;
        description: string | null;
        slug: string;
    })[]>;
    createCategory(dto: CreateCategoryDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        order: number;
        description: string | null;
        slug: string;
    }>;
    deleteCategory(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        order: number;
        description: string | null;
        slug: string;
    }>;
    createItem(dto: CreateItemDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        order: number;
        description: string | null;
        price: number;
        imageUrl: string | null;
        isActive: boolean;
        categoryId: string;
    }>;
    updateItem(id: string, dto: UpdateItemDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        order: number;
        description: string | null;
        price: number;
        imageUrl: string | null;
        isActive: boolean;
        categoryId: string;
    }>;
    deleteItem(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        order: number;
        description: string | null;
        price: number;
        imageUrl: string | null;
        isActive: boolean;
        categoryId: string;
    }>;
    createVariant(itemId: string, dto: CreateVariantDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        order: number;
        price: number | null;
        imageUrl: string | null;
        menuItemId: string;
    }>;
    updateVariant(id: string, dto: UpdateVariantDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        order: number;
        price: number | null;
        imageUrl: string | null;
        menuItemId: string;
    }>;
    deleteVariant(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        order: number;
        price: number | null;
        imageUrl: string | null;
        menuItemId: string;
    }>;
    uploadVariantImage(id: string, file: Express.Multer.File): Promise<{
        id: string;
        name: string;
        imageUrl: string;
    }>;
    uploadItemImage(id: string, file: Express.Multer.File): Promise<{
        id: string;
        name: string;
        imageUrl: string;
    }>;
    private slugify;
}
