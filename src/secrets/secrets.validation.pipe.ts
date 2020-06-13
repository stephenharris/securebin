import { ArgumentMetadata, Injectable, PipeTransform, BadRequestException} from '@nestjs/common';

@Injectable()
export class SecretsValidationPipe implements PipeTransform {

  private vulnerabilities = [ 'blind', 'deaf', 'over65' ];

  transform(value: any, metadata: ArgumentMetadata) {
    console.log('[pipe] psr validation');

    let expires = value.expires ? parseInt(value.expires, 10) : null;

    if(!expires) {
      throw new BadRequestException({
        'error': 'invalidExpires',
        'message': 'No expiration date set'
      });
    }
    
    if(expires <= Math.floor(Date.now() / 1000)) {
      throw new BadRequestException({
        'error': 'invalidExpires',
        'message': 'Expiration date must be in the future'
      });
    }


    if( expires - Math.floor(Date.now() / 1000) > 7 * 24 * 60 * 60) {
      throw new BadRequestException({
        'error': 'invalidExpires',
        'message': 'Expiration date cannot be longer than one week'
      });
    }

    return {
      'secret': value.secret,
      'expires': expires
    };
  }
}
