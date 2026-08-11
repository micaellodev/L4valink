"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateOrderPrice = calculateOrderPrice;
const CLASICOS = [
    'Mojito', 'Chilcano', 'Laguna Azul', 'Orgasmo',
    'Tinto de Verano', 'Piña Colada', 'Cuba Libre', 'Machupicchu',
];
const DE_AUTOR = [
    'Margañaña', 'Biffer Pink', 'Tentacione Emiliani',
    'Gaviota', 'Resina Sagrada', 'Espíritu Antiguo',
];
const CERVEZAS = ['Pilsen'];
const FALLBACK_PRICES = {
    CLASICOS: 20,
    DE_AUTOR: 25,
    CERVEZAS: 10,
};
function getFallbackPrice(name) {
    const baseName = name.split(' -')[0].trim();
    if (CLASICOS.includes(baseName))
        return FALLBACK_PRICES.CLASICOS;
    if (DE_AUTOR.includes(baseName))
        return FALLBACK_PRICES.DE_AUTOR;
    if (CERVEZAS.includes(baseName))
        return FALLBACK_PRICES.CERVEZAS;
    return null;
}
function calculateOrderPrice(items, menuPriceMap, promotionPriceMap) {
    let total = 0;
    for (const item of items) {
        const name = item.name.trim();
        const qty = item.quantity || 0;
        if (promotionPriceMap) {
            for (const [promoTitle, promoPrice] of Object.entries(promotionPriceMap)) {
                if (name.startsWith(promoTitle + ' (') || name === promoTitle) {
                    total += promoPrice * qty;
                    break;
                }
            }
            if (total > 0 && Object.keys(promotionPriceMap).some(k => name.startsWith(k))) {
                continue;
            }
        }
        if (menuPriceMap) {
            if (menuPriceMap[name] !== undefined) {
                total += menuPriceMap[name] * qty;
                continue;
            }
            const baseName = name.split(' -')[0].trim();
            if (menuPriceMap[baseName] !== undefined) {
                total += menuPriceMap[baseName] * qty;
                continue;
            }
        }
        const fallback = getFallbackPrice(name);
        if (fallback !== null) {
            total += fallback * qty;
        }
    }
    return total;
}
//# sourceMappingURL=pricing.utils.js.map