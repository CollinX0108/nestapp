import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Configurar CORS
  app.enableCors({
    origin: '*', // Configura según tus necesidades
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Aplicar el filtro de excepciones global
  app.useGlobalFilters(new HttpExceptionFilter());

  // Aplicar ValidationPipe globalmente
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    disableErrorMessages: false,
    validationError: { target: false, value: true },
    exceptionFactory: (errors) => {
      console.log('Validation errors:', JSON.stringify(errors, null, 2));
      return new BadRequestException(errors);
    },
  }));

  app.use((req, res, next) => {
    console.log(`Solicitud recibida: ${req.method} ${req.originalUrl}`);
    next();
  });
  
  const config = new DocumentBuilder()
    .setTitle('API de Reservas Deportivas')
    .setDescription('API para gestionar reservas de instalaciones deportivas')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  
  
  //const configService = app.get(ConfigService);
  //console.log('JWT_SECRET:', configService.get('JWT_SECRET')); // Agrega esta línea para verificar

  SwaggerModule.setup('api', app, document);

  console.log('Ambiente:', process.env.NODE_ENV);
  console.log('Puerto:', process.env.PORT);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();