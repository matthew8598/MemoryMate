const request = require('supertest');
const app = require('../app');
const sinon = require('sinon');
const schedule = require('node-schedule');

// TEST RUNS INDIFINITELY DO NOT USE


// Mock node-schedule to prevent actual scheduling during tests
sinon.stub(schedule, 'scheduleJob').callsFake((date, callback) => {
  setTimeout(callback, 0); // Immediately invoke the callback for testing
  return { cancel: sinon.stub() };
});

// Replace the require statement for chai with a dynamic import
let expect;
(async () => {
  const chai = await import('chai');
  expect = chai.expect;
})();

describe('API Endpoints', () => {
  describe('Entries Endpoints', () => {
    it('should create a new entry', async () => {
      const res = await request(app)
        .post('/entries')
        .send({
          title: 'Test Entry',
          content: 'This is a test entry.',
          type: 'journal',
          dueDate: '2025-05-15T10:00:00Z',
          reminder: '2025-05-14T10:00:00Z',
        });
      // Log response body for debugging
      console.log('Response body:', res.body);
      expect(res.statusCode).to.equal(201);
      expect(res.body).to.have.property('message', 'Entry created successfully');
    });

    it('should retrieve all entries', async () => {
      const res = await request(app).get('/entries');
      // Log response body for debugging
      console.log('Response body:', res.body);
      expect(res.statusCode).to.equal(200);
      expect(Array.isArray(res.body)).to.be.true;
    });
  });

  describe('Lists Endpoints', () => {
    it('should retrieve all lists', async () => {
      const res = await request(app).get('/lists');
      // Log response body for debugging
      console.log('Response body:', res.body);
      expect(res.statusCode).to.equal(200);
      expect(Array.isArray(res.body)).to.be.true;
    });

    it('should retrieve lists formatted for the dashboard', async () => {
      const res = await request(app).get('/lists/dashboard');
      // Log response body for debugging
      console.log('Response body:', res.body);
      expect(res.statusCode).to.equal(200);
      expect(Array.isArray(res.body)).to.be.true;
    });
  });
});
