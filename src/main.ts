import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  //app instance is created here
  const app = await NestFactory.create(AppModule);

  //all middlewares are registered here
  app.useGlobalPipes(new ValidationPipe)

  //application start
  await app.listen(3000);
}
bootstrap();
