const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;

chai.use(chaiHttp);

describe('Access Control Tests', function() {
  const agent = chai.request.agent('http://localhost:8080');

  it('should redirect to login page when accessing root URL', function() {
    return agent
      .get('/')
      .then(function(res) {
        // Check if the response status code is 302 (redirect)
        expect(res).to.have.status(200);
        // Check if the response header contains the 'Location' field with the login page URL
        expect(res).to.redirectTo('http://localhost:8080/login');
      });
  });

  it('should redirect to login page when accessing /urls/new', function() {
    return agent
      .get('/urls/new')
      .then(function(res) {
        expect(res).to.redirectTo('http://localhost:8080/login');
        expect(res).to.have.status(200);
      });
  });

  it('should return status code 404 for a non-existent URL', function() {
    return agent
      .get('/urls/NOTEXISTS')
      .then(function(res) {
        expect(res).to.have.status(404);
      });
  });

  it('should return status code 403 for accessing a URL without permission', function() {
    return agent
      .get('/urls/b2xVn2')
      .then(function(res) {
        expect(res).to.have.status(403);
      });
  });

  after(function() {
    agent.close();
  });
});
