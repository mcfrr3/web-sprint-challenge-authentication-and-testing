const db = require('../data/dbConfig');
const express = require('express');
const request = require('supertest');
const server = require('./server');

server.use(express.json());

/* SET UP */
test('check environment', () => {
  expect(process.env.NODE_ENV).toBe('testing');
});

// at the beginning of all tests, set up the schema of the db
beforeAll(async () => {
  await db.migrate.rollback();
  await db.migrate.latest();
});

// before each test, truncate everything
beforeEach(async () => {
  await db('users').truncate();
});

afterAll(async () => {
  await db.destroy();
});

/* END SET UP */

// Write your tests here
test('sanity', () => {
  expect(true).toBe(true)
});

describe('testing the POST /api/auth/register endpoint', () => {
  test('the endpoint works as expected with valid properties', async () => {
    let response = await request(server)
      .post('/api/auth/register')
      .send({
        username: 'mike',
        password: 'letMeIn'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id', 1);
    expect(response.body).toHaveProperty('username', 'mike');
  });

  test('the endpoint returns the correct status code and error message if either username or password is omitted', async () => {
    let response = await request(server)
      .post('/api/auth/register')
      .send({ username: 'mike' });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('message', 'username and password required');

    response = await request(server)
      .post('/api/auth/register')
      .send({ password: '1234' });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('message', 'username and password required');
  });
  
  test('the endpoint returns the correct status code and error message if the given username already exists in the DB', async () => {
    let response = await request(server)
    .post('/api/auth/register')
    .send({
      username: 'mike',
      password: 'letMeIn'
    });
    expect(response.status).toBe(201);

    response = await request(server)
      .post('/api/auth/register')
      .send({
        username: 'mike',
        password: 'letMeIn'
      });
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('message', 'username taken');
  });
});

describe('testing the POST /api/auth/login endpoint', () => {
  test('the endpoint works as expected with valid properties', async () => {
    let response = await request(server).post('/api/auth/register').send({
      username: 'mike',
      password: 'letMeIn'
    });
    expect(response.status).toBe(201);

    response = await request(server)
      .post('/api/auth/login')
      .send({
        username: 'mike',
        password: 'letMeIn'  
      });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'welcome, mike');
  });
  
  test('the endpoint returns the correct status code and error message if either username or password is omitted', async () => {
    let response = await request(server)
      .post('/api/auth/login')
      .send({ username: 'mike' });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('message', 'username and password required');

    response = await request(server)
      .post('/api/auth/login')
      .send({ password: '1234' });

    expect(response.status).toBe(422);
    expect(response.body).toHaveProperty('message', 'username and password required');
  });

  test('correct status code and error message are given if a user doesn\'t exist in the DB', async () => {
    let response = await request(server)
      .post('/api/auth/login')
      .send({ username: 'james', password: '1234' });
  
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'invalid credentials');  
  });

  test('correct status code and error message are given if a user doesn\'t provide the correct password', async () => {
    let response = await request(server).post('/api/auth/register').send({
      username: 'mike',
      password: 'letMeIn'
    });
    expect(response.status).toBe(201);

    response = await request(server).post('/api/auth/login').send({ 
      username: 'mike', 
      password: '1234' 
    });
  
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message', 'invalid credentials');  
  });
});

describe('testing the GET /api/jokes endpoint', () => {
  test('A user that has registered and logged in can successfully access the endpoint', async () => {
    let response = await request(server).post('/api/auth/register').send({
      username: 'mike',
      password: 'letMeIn'
    });
    expect(response.status).toBe(201);
  
    response = await request(server).post('/api/auth/login').send({
      username: 'mike',
      password: 'letMeIn'
    });
    expect(response.status).toBe(200);
  
    const token = response.body.token;
    response = await request(server).get('/api/jokes').set({
      'Authorization': token
    });
    expect(response.status).toBe(200);
    expect(response.body.length).toBe(3);
  });

  test('correct status code and error message are given if the endpoint is accessed with no token', async () => {
    let response = await request(server).post('/api/auth/register').send({
      username: 'mike',
      password: 'letMeIn'
    });
    expect(response.status).toBe(201);
  
    response = await request(server).post('/api/auth/login').send({
      username: 'mike',
      password: 'letMeIn'
    });
    expect(response.status).toBe(200);

    response = await request(server).get('/api/jokes');
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'token required');
  });

  test('correct status code and error message are given if the endpoint is accessed with an incorrect token', async () => {
    let response = await request(server).get('/api/jokes').set({
      'Authorization': 'a;sodif743oijn:LKN'
    });
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message', 'token invalid');
  });
});