import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('micaellodev', 10);
    const user = await prisma.user.upsert({
        where: { username: 'micaello' },
        update: {},
        create: {
            username: 'micaello',
            password,
            role: 'OWNER',
        },
    });
    console.log('User created:', user);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
