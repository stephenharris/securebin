import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/secrets (POST)', (done) => {
    return request(app.getHttpServer())
      .post('/secrets')
      .send({
        "secret": "somevalue", 
        "expires": Math.floor(Date.now() / 1000) + 30
      })
      .expect(200)
      .expect((res) => {
        if (!('uuid' in res.body)) throw new Error("missing uuid key");
        if (!('key' in res.body)) throw new Error("missing key key");
        if (!('url' in res.body)) throw new Error("missing url key");
        if (!('expires' in res.body)) throw new Error("missing expires key");
      })
      .then(async res => {
        await request(app.getHttpServer())
          .get(`/secrets/${res.body.uuid}/${res.body.key}`)
          .expect(200)
          .expect((res) => {
            if (!('secret' in res.body)) throw new Error("missing secret key");
            if (res.body.secret !== "somevalue") throw new Error("secret is incorrect");
          })
          .then(() => done())
      })
  });


  it('secrets should expire', (done) => {
    return request(app.getHttpServer())
      .post('/secrets')
      .send({
        "secret": "somevalue", 
        "expires": Math.floor(Date.now() / 1000) + 1
      })
      .expect(200)
      .then(async res => {

        //wait two seconds for secret to expire
        await new Promise(r => setTimeout(r, 2000));

        await request(app.getHttpServer())
          .get(`/secrets/${res.body.uuid}/${res.body.key}`)
          .expect(400)
          .expect((res) => {
            if (res.body.error !== 'errorRetrievingSecret') throw new Error("error property should be set");
            if (res.body.message !== 'Secret expired') throw new Error("message should say secret expired");
          })
          .then(() => done())
      })
  });
  

  it('secrets not return if secret key is invalid', (done) => {
    return request(app.getHttpServer())
      .post('/secrets')
      .send({
        "secret": "somevalue", 
        "expires": Math.floor(Date.now() / 1000) + 30
      })
      .expect(200)
      .then(async res => {

        await request(app.getHttpServer())
          .get(`/secrets/${res.body.uuid}/INVALID`)
          .expect(400)
          .expect((res) => {
            if (res.body.error !== 'errorRetrievingSecret') throw new Error("error property should be set");
            if (res.body.message !== 'Decryption failed') throw new Error("message should say decryption failed");
          })
          .then(() => done())
      })
  });

  it('secrets not return if uuid is invalid', (done) => {
    return request(app.getHttpServer())
      .post('/secrets')
      .send({
        "secret": "somevalue", 
        "expires": Math.floor(Date.now() / 1000) + 30
      })
      .expect(200)
      .then(async res => {

        await request(app.getHttpServer())
          .get(`/secrets/INVALID/${res.body.key}`)
          .expect(400)
          .expect((res) => {
            if (res.body.error !== 'errorRetrievingSecret') throw new Error("error property should be set");
            if (res.body.message !== 'Secret not found') throw new Error("message should say secret not found");
          })
          .then(() => done())
      })
  });

});
