import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Cookie parser for session management
  app.use(cookieParser());

  // CORS configuration
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  // Global API route prefix
  app.setGlobalPrefix('api');

  // OpenAPI Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('TriAttendance API')
    .setDescription(
      'Location-Verified Employee Attendance Monitoring Portal & Mobile Ingestion API'
    )
    .setVersion('1.0.0')
    .addCookieAuth('session_id')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  // Log startup message
  console.log(`TriAttendance API is running on http://localhost:${port}/api`);
  console.log(`Swagger documentation available at http://localhost:${port}/api/docs`);
}

bootstrap().catch((err) => {
  console.error('Fatal error during API bootstrap:', err);
  process.exit(1);
});
