import { HttpCode, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';

export type UserTesterParams = string | object;

export class UserTester {
  private userId;
  client: request.SuperTest<request.Test>;
  accessToken?: string;

  constructor(clinet: request.SuperTest<request.Test>) {
    this.client = clinet;
  }

  get Client() {
    return this.client;
  }

  get UserId() {
    return this.userId;
  }

  set AccessToken(token: string) {
    this.accessToken = token;
  }

  private addToken(req: request.Test) {
    if (this.accessToken) {
      req.set('Authorization', `Bearer ${this.accessToken}`);
    }
  }

  async get(path: string, params: UserTesterParams = {}) {
    const req = this.client.get(path);
    this.addToken(req);
    return req.query(params);
  }

  async patch(path: string, params?: UserTesterParams) {
    const req = this.client.patch(path);
    this.addToken(req);
    return req.send(params);
  }

  async post(path: string, params?: UserTesterParams) {
    const req = this.client.post(path);
    this.addToken(req);
    return req.send(params);
  }

  async filePost(path: string, file: string, params?: UserTesterParams) {
    const req = this.client.post(path);
    this.addToken(req);
    if (params) {
      Object.entries(params).map(([key, val]) => {
        req.field(key, val);
      });
    }
    return req.attach('file', file);
  }

  async put(path: string, params?: UserTesterParams) {
    const req = this.client.put(path);
    this.addToken(req);
    return req.send(params);
  }

  async delete(path: string, params?: UserTesterParams) {
    const req = this.client.delete(path);
    this.addToken(req);
    return req.send(params);
  }

  async login(email: string, pw: string) {
    const rep = await this.post('/api/auth/login', {
      email,
      pass: pw,
    });
    expect(rep.status).toEqual(HttpStatus.CREATED);
    // console.log('---->', rep.body);
    this.accessToken = rep.body.access_token;
  }
}
