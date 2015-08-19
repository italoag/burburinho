var assert = require('assert'),
    CONFIG = require('../helpers/config'),
    supertest = require('supertest'),
    api = supertest('http://localhost:5000')
;

describe('Buzzes:', function() {
  var buzz;
  before(function(done){
    require(CONFIG.ROOT_DIRECTORY + '/lib/server').startServer();
    buzz = {
      type: 'text',
      content: 'This is a test',
      timestamp: new Date().getTime()
    };
    done();
  });

  it('UNAUTHENTICATED POST: /api/burburinhos', function(done){
    api.post('/api/burburinhos')
      .send(buzz)
      .expect(401, done);
  });

  it('POST: /api/burburinhos', function(done){
    api.post('/api/burburinhos')
      .auth(process.env.API_USERNAME, process.env.API_PASSWORD)
      .send(buzz)
      .expect(201, done);
  });

  it('GET: /api/burburinhos', function(done){


    api.post('/api/burburinhos')
      .auth(process.env.API_USERNAME, process.env.API_PASSWORD)
      .send(buzz)
      .expect(201);

    api.get('/api/burburinhos')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {

        if (err) {
          return done(err);
        }

        assert(res.body instanceof Array);

        res.body.forEach(function (response) {
          assert.equal(typeof response.type !== 'undefined', true);
          assert.equal(typeof response.content !== 'undefined', true);
          assert.equal(typeof response.timestamp !== 'undefined', true);
        });

        var buzzExistInResponse = res.body.filter(function(element){
          return element.timestamp === buzz.timestamp;
        }).length === 1;

        assert(buzzExistInResponse);

        done();
      });
  });
});
