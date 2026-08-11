"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueModule = void 0;
const common_1 = require("@nestjs/common");
const queue_service_1 = require("./queue.service");
const queue_controller_1 = require("./queue.controller");
const events_gateway_1 = require("../gateway/events.gateway");
const auth_module_1 = require("../auth/auth.module");
const orders_module_1 = require("../orders/orders.module");
const youtube_module_1 = require("../youtube/youtube.module");
let QueueModule = class QueueModule {
};
exports.QueueModule = QueueModule;
exports.QueueModule = QueueModule = __decorate([
    (0, common_1.Module)({
        imports: [orders_module_1.OrdersModule, youtube_module_1.YouTubeModule, auth_module_1.AuthModule],
        controllers: [queue_controller_1.QueueController],
        providers: [queue_service_1.QueueService, events_gateway_1.EventsGateway],
        exports: [queue_service_1.QueueService],
    })
], QueueModule);
//# sourceMappingURL=queue.module.js.map