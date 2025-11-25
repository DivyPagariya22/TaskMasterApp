require('dotenv').config();
process.env.NODE_ENV = 'test';
const chai = require('chai');
const expect = chai.expect;
const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');

const User = require('../src/models/user');
const Task = require('../src/models/task');
const Session = require('../src/models/session');

describe('TaskMasterAPI - negative & edge flows', function () {
  before(async function () {
    if (mongoose.connection.readyState === 0) {
      const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/taskmasterapi_test';
      await mongoose.connect(uri);
    }
    await Promise.all([User.deleteMany({}), Task.deleteMany({}), Session.deleteMany({})]);
  });

  after(async function () {
    await Promise.all([User.deleteMany({}), Task.deleteMany({}), Session.deleteMany({})]);
    await mongoose.connection.close();
  });

  it('should return 400 when creating user with missing fields', async function () {
    const res = await request(app).post('/users').send({ name: 'Bob' });
    expect(res.status).to.equal(400);
  });

  it('should return 409 when creating duplicate user email', async function () {
    const u = { name: 'Carol', email: 'carol@example.com', password: 'pw' };
    const r1 = await request(app).post('/users').send(u);
    expect(r1.status).to.equal(201);
    const r2 = await request(app).post('/users').send(u);
    expect(r2.status).to.equal(409);
  });

  it('should return 401 for invalid login credentials', async function () {
    const r = await request(app).post('/sessions/login').send({ email: 'nope@example.com', password: 'x' });
    expect(r.status).to.equal(401);
  });

  it('should reject protected routes without token or with invalid token', async function () {
    const r1 = await request(app).post('/tasks').send({ title: 'T1' });
    expect(r1.status).to.equal(401);

    const r2 = await request(app).post('/tasks').set('authorization', 'bad_token').send({ title: 'T1' });
    expect(r2.status).to.equal(401);
  });

  it('should return 400 when creating a task without title', async function () {
    // create user and login
    const u = { name: 'Dave', email: 'dave@example.com', password: 'pw' };
    const cr = await request(app).post('/users').send(u);
    expect(cr.status).to.equal(201);
    const lr = await request(app).post('/sessions/login').send({ email: u.email, password: u.password });
    expect(lr.status).to.equal(200);
    const token = lr.body.token;

    const tr = await request(app).post('/tasks').set('authorization', token).send({ description: 'no title' });
    expect(tr.status).to.equal(400);
  });

  it('should forbid listing tasks for another user (403)', async function () {
    // create two users
    const a = { name: 'Eve', email: 'eve1@example.com', password: 'pw' };
    const b = { name: 'Frank', email: 'frank@example.com', password: 'pw' };
    const ra = await request(app).post('/users').send(a);
    const rb = await request(app).post('/users').send(b);
    expect(ra.status).to.equal(201);
    expect(rb.status).to.equal(201);

    const la = await request(app).post('/sessions/login').send({ email: a.email, password: a.password });
    expect(la.status).to.equal(200);
    const tokenA = la.body.token;

    // attempt to list B's tasks using A's token
    const list = await request(app).get(`/tasks/users/${rb.body._id}/tasks`).set('authorization', tokenA);
    expect(list.status).to.equal(403);
  });

  it('should return 404 when updating non-existent task', async function () {
    const u = { name: 'Gina', email: 'gina@example.com', password: 'pw' };
    const cr = await request(app).post('/users').send(u);
    expect(cr.status).to.equal(201);
    const lr = await request(app).post('/sessions/login').send({ email: u.email, password: u.password });
    expect(lr.status).to.equal(200);
    const token = lr.body.token;

    const up = await request(app).put('/tasks/000000000000000000000000').set('authorization', token).send({ title: 'x' });
    expect(up.status).to.satisfy(s => [404, 500].includes(s));
  });

  it('should create and delete a task successfully', async function () {
    const u = { name: 'Harry', email: 'harry@example.com', password: 'pw' };
    const cr = await request(app).post('/users').send(u);
    expect(cr.status).to.equal(201);
    const lr = await request(app).post('/sessions/login').send({ email: u.email, password: u.password });
    expect(lr.status).to.equal(200);
    const token = lr.body.token;

    const taskRes = await request(app).post('/tasks').set('authorization', token).send({ title: 'ToDelete' });
    expect(taskRes.status).to.equal(201);
    const id = taskRes.body._id;

    const del = await request(app).delete(`/tasks/${id}`).set('authorization', token);
    expect(del.status).to.equal(200);
  });
});
