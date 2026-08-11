import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    validateUser(username: string, password: string): Promise<{
        id: string;
        username: string;
        role: import(".prisma/client").$Enums.UserRole;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(username: string, password: string): Promise<{
        access_token: string;
        user: {
            id: string;
            username: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
}
