// tests/mocha_tests.js
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

describe('TaskMasterAPI - basic flows (MongoDB)', function () {
  before(async function () {
    // ensure connected
    if (mongoose.connection.readyState === 0) {
      const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/taskmasterapi_test';
      await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    }
    // clean DB
    await Promise.all([User.deleteMany({}), Task.deleteMany({}), Session.deleteMany({})]);
  });

  after(async function () {
    // clean DB after tests
    await Promise.all([User.deleteMany({}), Task.deleteMany({}), Session.deleteMany({})]);
    await mongoose.connection.close();
  });

  it('should create a user, login, create a task and list it', async function () {
    // create user
    const u = { name: 'Alice', email: 'alice@example.com', password: 'pass123' };
    const createRes = await request(app).post('/users').send(u);
    expect(createRes.status).to.equal(201);
    expect(createRes.body).to.have.property('_id');

    // login
    const loginRes = await request(app).post('/sessions/login').send({ email: u.email, password: u.password });
    expect(loginRes.status).to.equal(200);
    expect(loginRes.body).to.have.property('token');
    const token = loginRes.body.token;

    // create task
    const taskRes = await request(app).post('/tasks').set('authorization', token).send({ title: 'Test task' });
    expect(taskRes.status).to.equal(201);
    expect(taskRes.body.title).to.equal('Test task');

    // list tasks for user
    const userId = createRes.body._id;
    const listRes = await request(app).get(`/tasks/users/${userId}/tasks`).set('authorization', token);
    expect(listRes.status).to.equal(200);
    expect(listRes.body.tasks).to.be.an('array').with.lengthOf(1);
    expect(listRes.body.tasks[0].title).to.equal('Test task');
  });
});
