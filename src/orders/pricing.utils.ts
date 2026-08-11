// Pricing utility for calculating order totals
// Uses menu prices from the database, falls back to hardcoded for known cocktails

// Cocktail categories (fallback when menu price not available)
const CLASICOS = [
    'Mojito', 'Chilcano', 'Laguna Azul', 'Orgasmo',
    'Tinto de Verano', 'Piña Colada', 'Cuba Libre', 'Machupicchu',
];

const DE_AUTOR = [
    'Margañaña', 'Biffer Pink', 'Tentacione Emiliani',
    'Gaviota', 'Resina Sagrada', 'Espíritu Antiguo',
];

const CERVEZAS = ['Pilsen'];

const FALLBACK_PRICES: Record<string, number> = {
    CLASICOS: 20,
    DE_AUTOR: 25,
    CERVEZAS: 10,
};

function getFallbackPrice(name: string): number | null {
    const baseName = name.split(' -')[0].trim();
    if (CLASICOS.includes(baseName)) return FALLBACK_PRICES.CLASICOS;
    if (DE_AUTOR.includes(baseName)) return FALLBACK_PRICES.DE_AUTOR;
    if (CERVEZAS.includes(baseName)) return FALLBACK_PRICES.CERVEZAS;
    return null;
}

/**
 * Calculates the total price for an order.
 *
 * Logic:
 *  - Items matching a promotion title → use the promotion's fixed price
 *    (e.g. "2 Cócteles por S/ 35 (...)" → S/ 35)
 *  - Items with a known menu price (passed via menuPriceMap) → quantity × price
 *  - Fallback to hardcoded cocktail prices
 *  - Unknown items → 0
 */
export function calculateOrderPrice(
    items: Array<{ name: string; quantity: number }>,
    menuPriceMap?: Record<string, number>,
    promotionPriceMap?: Record<string, number>,
): number {
    let total = 0;

    for (const item of items) {
        const name = item.name.trim();
        const qty = item.quantity || 0;

        // 1. Check if the item name starts with a promotion title
        if (promotionPriceMap) {
            for (const [promoTitle, promoPrice] of Object.entries(promotionPriceMap)) {
                if (name.startsWith(promoTitle + ' (') || name === promoTitle) {
                    total += promoPrice * qty;
                    break;
                }
            }
            // If matched a promo, skip further price lookup
            if (total > 0 && Object.keys(promotionPriceMap).some(k => name.startsWith(k))) {
                continue;
            }
        }

        // 2. Check menu price map (exact match or base name match)
        if (menuPriceMap) {
            if (menuPriceMap[name] !== undefined) {
                total += menuPriceMap[name] * qty;
                continue;
            }
            // Try base name (strip variant suffix)
            const baseName = name.split(' -')[0].trim();
            if (menuPriceMap[baseName] !== undefined) {
                total += menuPriceMap[baseName] * qty;
                continue;
            }
        }

        // 3. Fallback to hardcoded prices
        const fallback = getFallbackPrice(name);
        if (fallback !== null) {
            total += fallback * qty;
        }
    }

    return total;
}
