import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // allow Next.js to hit this API
  await app.listen(process.env.PORT ?? 3001); // Using 3001 since frontend will be on 3000
}
bootstrap();
