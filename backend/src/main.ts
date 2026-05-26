import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ConfigService } from '@nestjs/config'
import { ResponseInterceptor } from './common/interceptors/response.interceptor'
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter'
import { ValidationPipe } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { getUploadDir } from './common/utils/upload-dir'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const config = app.get(ConfigService)
  const port = Number(config.get('APP_PORT')) || 3000
  app.useGlobalInterceptors(new ResponseInterceptor())
  app.useGlobalFilters(new AllExceptionsFilter())
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
  app.useStaticAssets(getUploadDir(), { prefix: '/uploads' })
  await app.listen(port, '0.0.0.0')
}

bootstrap()
