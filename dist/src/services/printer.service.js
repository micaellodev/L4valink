"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var PrinterService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrinterService = void 0;
const common_1 = require("@nestjs/common");
const net = __importStar(require("net"));
let PrinterService = PrinterService_1 = class PrinterService {
    constructor() {
        this.logger = new common_1.Logger(PrinterService_1.name);
        this.printerHost = process.env.PRINTER_HOST || '192.168.1.200';
        this.printerPort = parseInt(process.env.PRINTER_PORT || '9100');
    }
    async printOrder(order, items) {
        try {
            const buffer = this.formatReceipt(order, items);
            await this.sendToPrinter(buffer);
            this.logger.log(`Order ${order.id} sent to printer successfully.`);
        }
        catch (error) {
            this.logger.error(`Failed to print order ${order.id}:`, error);
            if (process.env.NODE_ENV !== 'production') {
                this.logger.debug('--- SIMULATED PRINT OUTPUT ---');
                this.logger.debug(this.formatReceiptText(order, items));
                this.logger.debug('------------------------------');
            }
        }
    }
    formatReceipt(order, items) {
        const ESC = '\x1B';
        const GS = '\x1D';
        const INIT = ESC + '@';
        const CENTER = ESC + 'a' + '\x01';
        const LEFT = ESC + 'a' + '\x00';
        const BOLD_ON = ESC + 'E' + '\x01';
        const BOLD_OFF = ESC + 'E' + '\x00';
        const CUT = GS + 'V' + '\x41' + '\x00';
        let buffer = Buffer.from(INIT);
        buffer = Buffer.concat([buffer, Buffer.from(CENTER + BOLD_ON + "EMILIANI PIZZAS\n" + BOLD_OFF)]);
        buffer = Buffer.concat([buffer, Buffer.from("KARAOKE & BAR\n")]);
        buffer = Buffer.concat([buffer, Buffer.from("--------------------------------\n")]);
        buffer = Buffer.concat([buffer, Buffer.from(LEFT)]);
        buffer = Buffer.concat([buffer, Buffer.from(`Mesa: ${order.tableNumber}\n`)]);
        buffer = Buffer.concat([buffer, Buffer.from(`Cliente: ${order.userName || 'Cliente'}\n`)]);
        buffer = Buffer.concat([buffer, Buffer.from(`Fecha: ${new Date().toLocaleString()}\n`)]);
        buffer = Buffer.concat([buffer, Buffer.from("--------------------------------\n")]);
        buffer = Buffer.concat([buffer, Buffer.from(BOLD_ON + "PRODUCTOS\n" + BOLD_OFF)]);
        items.forEach(item => {
            const line = `${item.quantity}x ${item.name}\n`;
            buffer = Buffer.concat([buffer, Buffer.from(line)]);
            if (item.comments) {
                buffer = Buffer.concat([buffer, Buffer.from(`  (${item.comments})\n`)]);
            }
        });
        buffer = Buffer.concat([buffer, Buffer.from("--------------------------------\n")]);
        buffer = Buffer.concat([buffer, Buffer.from(CENTER + "Gracias por su preferencia!\n")]);
        buffer = Buffer.concat([buffer, Buffer.from("\n\n\n")]);
        buffer = Buffer.concat([buffer, Buffer.from(CUT)]);
        return buffer;
    }
    formatReceiptText(order, items) {
        let text = "EMILIANI PIZZAS\nKARAOKE & BAR\n--------------------------------\n";
        text += `Mesa: ${order.tableNumber}\n`;
        text += `Cliente: ${order.userName || 'Cliente'}\n`;
        text += `Fecha: ${new Date().toLocaleString()}\n`;
        text += "--------------------------------\nPRODUCTOS\n";
        items.forEach(item => {
            text += `${item.quantity}x ${item.name}\n`;
            if (item.comments)
                text += `  (${item.comments})\n`;
        });
        text += "--------------------------------\nGracias por su preferencia!\n\n\n";
        return text;
    }
    sendToPrinter(buffer) {
        return new Promise((resolve, reject) => {
            const client = new net.Socket();
            client.setTimeout(5000);
            client.connect(this.printerPort, this.printerHost, () => {
                client.write(buffer, () => {
                    client.end();
                    resolve();
                });
            });
            client.on('error', (err) => {
                client.destroy();
                reject(err);
            });
            client.on('timeout', () => {
                client.destroy();
                reject(new Error('Printer connection timed out'));
            });
        });
    }
};
exports.PrinterService = PrinterService;
exports.PrinterService = PrinterService = PrinterService_1 = __decorate([
    (0, common_1.Injectable)()
], PrinterService);
//# sourceMappingURL=printer.service.js.map