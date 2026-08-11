import { Module } from '@nestjs/common';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { StorageModule } from '../storage/storage.module';

@Module({
    imports: [StorageModule],
    providers: [MenuService],
    controllers: [MenuController],
})
export class MenuModule {}
