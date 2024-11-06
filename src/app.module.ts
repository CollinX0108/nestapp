import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ReservasModule } from './reservas/reservas.module';
import { EquiposModule } from './equipos/equipos.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env.production',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('POSTGRES_URL'),
        ssl: {
          rejectUnauthorized: false,
        },
        autoLoadEntities: true,
        synchronize: true, // Ten cuidado con esto en producción
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ReservasModule,
    EquiposModule,
  ],
})
export class AppModule {}