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
        // Update the expected status code to 302 your server successfully redirects to /login for unauthorized access
        console.log("response", res);
        // expect(res).to.have.status(302);
        // Check if the response header contains the 'Location' field with the login page URL
        expect(res).to.redirectTo('http://localhost:8080/login');
      });
  });

  it('should redirect to login page when accessing /urls/new', function() {
    return agent
      .get('/urls/new')
      .then(function(res) {
        // Update the expected status code to 302 since your server redirects to /login for unauthorized access
        // expect(res).to.have.status(302);
        expect(res).to.redirectTo('http://localhost:8080/login');
      });
  });

  it('should return status code 404 for a non-existent URL', function() {
    return agent
      .get('/urls/NOTEXISTS')
      .then(function(res) {
        // Update the expected status code to 404 since your server returns 404 for non-existent URLs
        expect(res).to.have.status(404);
      });
  });

  it('should return status code 403 for accessing a URL without permission', function() {
    return agent
      .get('/urls/b6UTxQ')
      .then(function(res) {
        console.log("response", res);
        // Update the expected status code to 403 since your server returns 403 for unauthorized access
        expect(res).to.have.status(403);
      });
  });

  after(function() {
    agent.close();
  });
});
