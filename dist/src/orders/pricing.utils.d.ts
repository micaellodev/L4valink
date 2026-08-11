export declare function calculateOrderPrice(items: Array<{
    name: string;
    quantity: number;
}>, menuPriceMap?: Record<string, number>, promotionPriceMap?: Record<string, number>): number;
