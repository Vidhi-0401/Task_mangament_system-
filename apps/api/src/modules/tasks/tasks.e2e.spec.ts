import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../app.module';
import * as request from 'supertest';

describe('API smoke e2e', () => {
  let app: INestApplication;
  let server: any;

  beforeAll(async () => {
    process.env.SEED_ON_BOOT = 'true';
    process.env.JWT_SECRET = 'test_secret';
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('logs in and lists tasks', async () => {
    const login = await request(server).post('/auth/login').send({ email: 'owner@acme.com', password: 'Password@123' });
    expect([200, 201]).toContain(login.status);
    expect(login.body.accessToken).toBeTruthy();

    const res = await request(server).get('/tasks').set('Authorization', `Bearer ${login.body.accessToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('viewer cannot create tasks', async () => {
    const login = await request(server).post('/auth/login').send({ email: 'viewer@eng.acme.com', password: 'Password@123' });
    const token = login.body.accessToken;

    const res = await request(server)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Should fail' });

    expect([401, 403]).toContain(res.status);
  });
});
