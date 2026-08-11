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
exports.YouTubeController = void 0;
const common_1 = require("@nestjs/common");
const youtube_service_1 = require("./youtube.service");
const optional_jwt_auth_guard_1 = require("../auth/optional-jwt-auth.guard");
const public_decorator_1 = require("../common/decorators/public.decorator");
let YouTubeController = class YouTubeController {
    constructor(youtubeService) {
        this.youtubeService = youtubeService;
    }
    async search(query, req) {
        const user = req.user;
        const isUnrestricted = user && (user.role === 'WORKER' || user.role === 'OWNER');
        return this.youtubeService.search(query, isUnrestricted);
    }
    async verify(videoId) {
        return this.youtubeService.verifyVideo(videoId);
    }
    async refreshNodes() {
        return this.youtubeService.refreshNodesFromPublicLists();
    }
};
exports.YouTubeController = YouTubeController;
__decorate([
    (0, common_1.Get)('search'),
    (0, public_decorator_1.Public)(),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], YouTubeController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('verify'),
    (0, public_decorator_1.Public)(),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    __param(0, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], YouTubeController.prototype, "verify", null);
__decorate([
    (0, common_1.Post)('refresh-nodes'),
    (0, public_decorator_1.Public)(),
    (0, common_1.UseGuards)(optional_jwt_auth_guard_1.OptionalJwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], YouTubeController.prototype, "refreshNodes", null);
exports.YouTubeController = YouTubeController = __decorate([
    (0, common_1.Controller)('youtube'),
    __metadata("design:paramtypes", [youtube_service_1.YouTubeService])
], YouTubeController);
//# sourceMappingURL=youtube.controller.js.map