
import { Injectable, Logger } from '@nestjs/common';
import { Order } from '@prisma/client';
import * as net from 'net';

@Injectable()
export class PrinterService {
    private readonly logger = new Logger(PrinterService.name);
    private printerHost = process.env.PRINTER_HOST || '192.168.1.200'; // Default IP
    private printerPort = parseInt(process.env.PRINTER_PORT || '9100'); // Default Port

    async printOrder(order: Order, items: any[]) {
        try {
            const buffer = this.formatReceipt(order, items);
            await this.sendToPrinter(buffer);
            this.logger.log(`Order ${order.id} sent to printer successfully.`);
        } catch (error) {
            this.logger.error(`Failed to print order ${order.id}:`, error);
            // Fallback: Log simulated receipt in development
            if (process.env.NODE_ENV !== 'production') {
                this.logger.debug('--- SIMULATED PRINT OUTPUT ---');
                this.logger.debug(this.formatReceiptText(order, items));
                this.logger.debug('------------------------------');
            }
        }
    }

    private formatReceipt(order: Order, items: any[]): Buffer {
        // ESC/POS Commands
        const ESC = '\x1B';
        const GS = '\x1D';
        const INIT = ESC + '@';
        const CENTER = ESC + 'a' + '\x01';
        const LEFT = ESC + 'a' + '\x00';
        const BOLD_ON = ESC + 'E' + '\x01';
        const BOLD_OFF = ESC + 'E' + '\x00';
        const CUT = GS + 'V' + '\x41' + '\x00';

        let buffer = Buffer.from(INIT);

        // Header
        buffer = Buffer.concat([buffer, Buffer.from(CENTER + BOLD_ON + "EMILIANI PIZZAS\n" + BOLD_OFF)]);
        buffer = Buffer.concat([buffer, Buffer.from("KARAOKE & BAR\n")]);
        buffer = Buffer.concat([buffer, Buffer.from("--------------------------------\n")]);

        // Order Info
        buffer = Buffer.concat([buffer, Buffer.from(LEFT)]);
        buffer = Buffer.concat([buffer, Buffer.from(`Mesa: ${order.tableNumber}\n`)]);
        buffer = Buffer.concat([buffer, Buffer.from(`Cliente: ${order.userName || 'Cliente'}\n`)]);
        buffer = Buffer.concat([buffer, Buffer.from(`Fecha: ${new Date().toLocaleString()}\n`)]);
        buffer = Buffer.concat([buffer, Buffer.from("--------------------------------\n")]);

        // Items
        buffer = Buffer.concat([buffer, Buffer.from(BOLD_ON + "PRODUCTOS\n" + BOLD_OFF)]);
        items.forEach(item => {
            const line = `${item.quantity}x ${item.name}\n`;
            buffer = Buffer.concat([buffer, Buffer.from(line)]);
            if (item.comments) {
                buffer = Buffer.concat([buffer, Buffer.from(`  (${item.comments})\n`)]);
            }
        });

        // Footer
        buffer = Buffer.concat([buffer, Buffer.from("--------------------------------\n")]);
        buffer = Buffer.concat([buffer, Buffer.from(CENTER + "Gracias por su preferencia!\n")]);
        buffer = Buffer.concat([buffer, Buffer.from("\n\n\n")]);
        buffer = Buffer.concat([buffer, Buffer.from(CUT)]);

        return buffer;
    }

    private formatReceiptText(order: Order, items: any[]): string {
        let text = "EMILIANI PIZZAS\nKARAOKE & BAR\n--------------------------------\n";
        text += `Mesa: ${order.tableNumber}\n`;
        text += `Cliente: ${order.userName || 'Cliente'}\n`;
        text += `Fecha: ${new Date().toLocaleString()}\n`;
        text += "--------------------------------\nPRODUCTOS\n";
        items.forEach(item => {
            text += `${item.quantity}x ${item.name}\n`;
            if (item.comments) text += `  (${item.comments})\n`;
        });
        text += "--------------------------------\nGracias por su preferencia!\n\n\n";
        return text;
    }

    private sendToPrinter(buffer: Buffer): Promise<void> {
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
}
