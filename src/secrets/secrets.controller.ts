import { Controller, Get, Query, Post, Body, Put, Param, Delete, HttpCode, UsePipes } from '@nestjs/common';
import { SecretsService } from './secrets.service';
import { SecretsValidationPipe } from './secrets.validation.pipe';
import { BadRequestException} from '@nestjs/common';

@Controller()
export class SecretsController {

  constructor(private readonly secretsService: SecretsService) {}

  
  @Post('secrets/')
  @HttpCode(200)
  async createSecret(@Body(new SecretsValidationPipe()) body: any) {
    try {
        let response = await this.secretsService.storeSecret(body);
        return response;
    } catch (error) {
        console.log("error", error);
        throw error;   
    }
  }

  @Get('secrets/:uuid/:serverSecretKey')
  @HttpCode(200)
  async getSecret(@Param('uuid') uuid: string, @Param('serverSecretKey') serverSecretKey: string) {

    return this.secretsService.retrieveSecret(uuid, serverSecretKey)
    .catch((error) => {
      console.log(error.message);
      throw new BadRequestException({
        'error': 'errorRetrievingSecret',
        'message': error.message
      });
    });
    
  }


}
