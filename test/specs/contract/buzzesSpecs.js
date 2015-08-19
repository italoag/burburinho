var assert = require('assert'),
    CONFIG = require('../helpers/config'),
    supertest = require('supertest'),
    api = supertest('http://localhost:5000')
;

describe('Buzzes:', function() {

  before(function(done){
    require(CONFIG.ROOT_DIRECTORY + '/lib/server').startServer();
    done();
  });

  it('UNAUTHENTICATED POST: /api/burburinhos', function(done){
    api.post('/api/burburinhos')
      .send({
        type: 'text',
        content: 'content test',
        timestamp: '2015-08-08 12:12:12'
      })
      .expect(401, done);
  });

  it('POST: /api/burburinhos', function(done){
    api.post('/api/burburinhos')
      .auth(process.env.USERNAME, process.env.PASSWORD)
      .send({
        type: 'text',
        content: 'content test',
        timestamp: '2015-08-08 12:12:12'
      })
      .expect(201, done);
  });

  it('GET: /api/burburinhos', function(done){
    var buzz = {
      type: 'text',
      content: 'content test',
      timestamp: new Date().getTime()
    }
    api.post('/api/burburinhos')
      .auth(process.env.USERNAME, process.env.PASSWORD)
      .send(buzz)
      .expect(201, done);

    api.get('/api/burburinhos')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        assert(res.body instanceof Array);

        console.log('AQUI');

        res.body.forEach(function (response) {
          assert(typeof response.type !== 'undefined');
          assert(typeof response.content !== 'undefined');
          assert(typeof response.timestamp !== 'undefined');
        });

        console.log('AQUI OUTRO');

        console.log(res.body);
        var buzzExistInResponse = res.body.filter(function(element){
          console.log(element);
          return element.timestamp === buzz.timestamp;
        });

        // var index, buzzExistInResponse = false;
        // for(index = 0; res.body.length > index; index++) {
        //   if () {
        //
        //   }
        // }

        console.log(buzzExistInResponse);

        assert.equal(buzzExistInResponse);

        done();
      });
  });
});
