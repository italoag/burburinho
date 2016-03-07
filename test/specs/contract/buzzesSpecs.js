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
    content: 'This is a test',
      local: 'São Paulo (SP)',
      author: 'test',
      timestamp: CONFIG.FORMATTED_TIMESTAMP,
      type: 'text'
    };
    done();
  });

  it('UNAUTHENTICATED POST: /api/buzzes', function(done){
    api.post('/api/buzzes')
      .send(buzz)
      .expect(401, done);
  });

  it('POST: /api/buzzes', function(done){
    api.post('/api/buzzes')
      .auth(process.env.COBERTURA_EDITOR_USERNAME, process.env.COBERTURA_EDITOR_PASSWORD)
      .send(buzz)
      .expect(201)
      .end(function(err, res) {
        assert(typeof res.body.id !== 'undefined');
        done();
      });
  });

  it('GET: /api/buzzes', function(done){

    api.post('/api/buzzes')
      .auth(process.env.COBERTURA_EDITOR_USERNAME, process.env.COBERTURA_EDITOR_PASSWORD)
      .send(buzz)
      .expect(201);

    api.get('/api/buzzes')
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
          assert.equal(typeof response.author !== 'undefined', true);
        });

        var buzzExistInResponse = res.body.filter(function(element){
          return element.timestamp === buzz.timestamp;
        }).length === 1;

        assert(buzzExistInResponse);

        done();
      });
  });

  it('GET: /api/buzzes/<id>', function(done){

    buzz.local = 'MyLocal' + Math.random().toString(36).substring(7);

    api.post('/api/buzzes')
      .auth(process.env.COBERTURA_EDITOR_USERNAME, process.env.COBERTURA_EDITOR_PASSWORD)
      .send(buzz)
      .expect(201)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        var buzzId = res.body.id;

        api.get('/api/buzzes/' + buzzId)
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function(err, res) {
            assert.equal(res.body._id, buzzId);
            done();
          });
      });

  });

  it('DELETE: /api/buzzes/<id>', function(done){

    api.post('/api/buzzes')
      .auth(process.env.COBERTURA_EDITOR_USERNAME, process.env.COBERTURA_EDITOR_PASSWORD)
      .send(buzz)
      .expect(201)
      .end(function(err, res) {
        if (err) return done(err);

        var buzzId = res.body.id;

        api.delete('/api/buzzes/' + buzzId)
          .auth(process.env.COBERTURA_EDITOR_USERNAME, process.env.COBERTURA_EDITOR_PASSWORD)
          .expect(204)
          .end(function(err, res){
            done(err);
          });
      });
  });

  it('UNAUTHENTICATED DELETE: /api/buzzes', function(done) {
    api.delete('/api/buzzes/' + 123)
      .expect(401, done);
  });

  it('UNAUTHENTICATED PUT: /api/buzzes/<id>', function(done){
    api.post('/api/buzzes')
      .auth(process.env.COBERTURA_EDITOR_USERNAME, process.env.COBERTURA_EDITOR_PASSWORD)
      .send(buzz)
      .expect(201)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        var buzzId = res.body.id;

        api.put('/api/buzzes/' + buzzId)
          .send(buzz)
          .expect(401);

        done();
      });
  });

  it('PUT: /api/buzzes/<id>', function(done){

    api.post('/api/buzzes')
      .auth(process.env.COBERTURA_EDITOR_USERNAME, process.env.COBERTURA_EDITOR_PASSWORD)
      .send(buzz)
      .expect(201)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        var buzzId = res.body.id;

        buzz.local = 'MyLocal' + Math.random().toString(36).substring(7);
        api.put('/api/buzzes/' + buzzId)
          .auth(process.env.COBERTURA_EDITOR_USERNAME, process.env.COBERTURA_EDITOR_PASSWORD)
          .send(buzz)
          .expect(204)
          .end(function(err, res) {
            if(err) {
              return done(err);
            }

            api.get('/api/buzzes')
              .auth(process.env.COBERTURA_EDITOR_USERNAME, process.env.COBERTURA_EDITOR_PASSWORD)
              .expect(200)
              .expect('Content-Type', /json/)
              .end(function(err, res) {
                  if (err) {
                      return done(err);
                  }

                  var modifiedDraftExistInResponse = res.body.filter(function(element){
                      return element.local === buzz.local;
                  }).length;

                  assert.equal(modifiedDraftExistInResponse, 1);

                  done();
              });
          });
    });
  });

});
