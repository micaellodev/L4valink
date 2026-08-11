"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const schedule_1 = require("@nestjs/schedule");
const throttler_1 = require("@nestjs/throttler");
const auth_module_1 = require("./auth/auth.module");
const jwt_auth_guard_1 = require("./auth/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const queue_module_1 = require("./queue/queue.module");
const youtube_module_1 = require("./youtube/youtube.module");
const events_gateway_1 = require("./gateway/events.gateway");
const prisma_module_1 = require("./prisma.module");
const users_module_1 = require("./users/users.module");
const orders_module_1 = require("./orders/orders.module");
const scheduler_service_1 = require("./scheduler/scheduler.service");
const inventory_module_1 = require("./inventory/inventory.module");
const health_module_1 = require("./health/health.module");
const storage_module_1 = require("./storage/storage.module");
const menu_module_1 = require("./menu/menu.module");
const promotions_module_1 = require("./promotions/promotions.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            schedule_1.ScheduleModule.forRoot(),
            auth_module_1.AuthModule,
            queue_module_1.QueueModule,
            youtube_module_1.YouTubeModule,
            users_module_1.UsersModule,
            orders_module_1.OrdersModule,
            inventory_module_1.InventoryModule,
            health_module_1.HealthModule,
            storage_module_1.StorageModule,
            menu_module_1.MenuModule,
            promotions_module_1.PromotionsModule,
            prisma_module_1.PrismaModule,
        ],
        providers: [
            events_gateway_1.EventsGateway,
            scheduler_service_1.SchedulerService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map