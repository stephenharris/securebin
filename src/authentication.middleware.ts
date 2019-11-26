import { Injectable, NestMiddleware, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import {OAuth2Client} from 'google-auth-library';
import { ConfigService } from './config/config.service';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {

  constructor(private config: ConfigService) {
  }

  use(request: Request, response: Response, next: () => void) {

    if (request.get('Authorization')) {
      
      const googleCLientId = this.config.get('GOOGLE_CLIENT_ID');
      const client = new OAuth2Client(googleCLientId);
      
      async function verify() {
          const ticket = await client.verifyIdToken({
              idToken: request.get('Authorization').replace("Bearer","").trim(),
              audience: googleCLientId,// Specify the CLIENT_ID of the app that accesses the backend
          });
          const payload = ticket.getPayload();    
          return payload['email'];
      }
    
      verify().then((email) => {
        response.locals.authorizedUser = email;
        console.log("authenticated as " + email);
        next();
      }).catch((error) => {
        console.log("authentication error", error);  
        next();
      });
    
    } else {
      next();
    }
    
  }
}
