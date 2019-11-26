import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: () => void) {
    const now = Date.now();
    console.log('[middleware] logger');
    response.on('finish', () => {
      console.log(request.method + " " + request.originalUrl + " " + response.statusCode + " " + `${Date.now() - now}ms` );        
    });

    next();
  }
}
