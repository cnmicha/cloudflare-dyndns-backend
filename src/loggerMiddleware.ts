import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware, Logger } from '@nestjs/common';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    // Generate unique string
    const requestId = Math.round(Math.random() * 36 ** 12).toString(36);

    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';

    this.logger.log(`${requestId} [START] ${method} ${originalUrl} - ${userAgent} - ${ip}`);

    response.on('finish', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');

      this.logger.log(`${requestId} [FINISHED] status ${statusCode}, ${contentLength} bytes`);
    });

    response.on('close', () => {
      this.logger.log(`${requestId} [CLOSED]`);
    });

    next();
  }
}
