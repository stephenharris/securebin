import { Module, NestModule, MiddlewareConsumer} from '@nestjs/common';
import { APP_INTERCEPTOR, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { SecretsController } from './secrets/secrets.controller';
import { SecretsService } from './secrets/secrets.service';
import { LoggerMiddleware } from './logger.middleware';
import { AuthenticationMiddleware } from './authentication.middleware';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule],
  controllers: [SecretsController],
  providers: [SecretsService]
})
export class AppModule implements NestModule{
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware, AuthenticationMiddleware)
      .forRoutes('*');
  }
}
