import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(body: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            username: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    me(req: any): Promise<{
        id: any;
        username: any;
        role: any;
    }>;
}
