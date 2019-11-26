import { Controller, Get, Query, Post, Body, Put, Param, Delete, HttpCode, UsePipes } from '@nestjs/common';
import { SecretsService } from './secrets.service';
import { SecretsValidationPipe } from './secrets.validation.pipe';
import { BadRequestException} from '@nestjs/common';
import {User} from '../user.dectorator';

@Controller()
export class SecretsController {

  constructor(private readonly secretsService: SecretsService) {}

  @Post('secrets/')
  @HttpCode(200)
  async createSecret(@Body(new SecretsValidationPipe()) body: any) {
    console.log('[controller]');
    console.log(body);
    try {
        let response = await this.secretsService.storeSecret(body);
        return response;
    } catch (error) {
        console.log("error=======================>");
        console.log("error", error);
        throw error;   
    }
  }

  @Get('secrets/:uuid/:key')
  @HttpCode(200)
  async getSecret(@Param('uuid') uuid: string, @Param('key') key: string, @User() user) {

    return this.secretsService.retrieveSecret(uuid, key, user)
    .catch((error) => {
      console.log(error.message);
      throw new BadRequestException({
        'error': 'errorRetrievingSecret',
        'message': error.message
      });
    });
    
  }


}
