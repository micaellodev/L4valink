export declare class DailyInventoryEntryDto {
    productId: string;
    milliliters: number;
    quantity: number;
}
export declare class SubmitDailyInventoryDto {
    date: string;
    entries: DailyInventoryEntryDto[];
    submittedBy?: string;
}
