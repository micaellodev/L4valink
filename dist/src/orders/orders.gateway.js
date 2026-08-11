"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const common_1 = require("@nestjs/common");
const socket_io_1 = require("socket.io");
const orders_service_1 = require("./orders.service");
const ws_jwt_guard_1 = require("../auth/ws-jwt.guard");
const create_order_dto_1 = require("./dto/create-order.dto");
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000'];
let OrdersGateway = class OrdersGateway {
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    async handleCreateOrder(data, client) {
        try {
            const order = await this.ordersService.createOrder(data);
            this.server.emit('order:new', order);
            this.server.emit('tables_updated');
            return { success: true, order };
        }
        catch (error) {
            return { success: false, error: error.message };
        }
    }
    async handleGetOrders() {
        return this.ordersService.getOrders();
    }
    async handleCompleteOrder(data) {
        await this.ordersService.completeOrder(data.id);
        this.server.emit('order:completed', { id: data.id });
    }
    async handleGetCompletedOrders() {
        return this.ordersService.getCompletedOrders();
    }
    async handleDeleteOrder(data) {
        await this.ordersService.deleteOrder(data.id);
        this.server.emit('order:deleted', { id: data.id });
    }
    async handleGetOrdersByTable(data) {
        return this.ordersService.getOrdersByTable(data.tableNumber);
    }
};
exports.OrdersGateway = OrdersGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], OrdersGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('order:create'),
    __param(0, (0, websockets_1.MessageBody)()),
    __param(1, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto,
        socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], OrdersGateway.prototype, "handleCreateOrder", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('order:get'),
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersGateway.prototype, "handleGetOrders", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('order:complete'),
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersGateway.prototype, "handleCompleteOrder", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('order:getCompleted'),
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersGateway.prototype, "handleGetCompletedOrders", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('order:delete'),
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersGateway.prototype, "handleDeleteOrder", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('order:getByTable'),
    (0, common_1.UseGuards)(ws_jwt_guard_1.WsJwtGuard),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersGateway.prototype, "handleGetOrdersByTable", null);
exports.OrdersGateway = OrdersGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: allowedOrigins,
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersGateway);
//# sourceMappingURL=orders.gateway.js.map