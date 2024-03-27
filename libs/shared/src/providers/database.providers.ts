import { ConfigService } from '@nestjs/config';
import * as mongoose from 'mongoose';

export const databaseProviders = [
    {
        provide: 'DATABASE_CONNECTION',
        useFactory: (configService: ConfigService): Promise<typeof mongoose> =>
            mongoose.connect(configService.get('MONGODB_URI')),
        inject: [ConfigService],
    },
];