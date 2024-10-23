import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import * as cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // TODO: Domain
  app.setGlobalPrefix("api");

  //  TODO: Swagger
  const config = new DocumentBuilder()
    .setTitle("NestJS API")
    .setDescription("")
    .setVersion("1.0")
    .addBearerAuth()
    .build();

  // TODO: Cors
  app.enableCors();

  // TODO: Versions
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // TODO: Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(cookieParser());

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
