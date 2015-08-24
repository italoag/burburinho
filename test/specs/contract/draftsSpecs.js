var assert = require('assert'),
    CONFIG = require('../helpers/config'),
    supertest = require('supertest'),
    api = supertest('http://localhost:5000')
;

describe('Drafts:', function() {
  var buzzDraft;
  before(function(done){
    require(CONFIG.ROOT_DIRECTORY + '/lib/server').startServer();
    buzzDraft = {
    content: 'This is a test',
      local: 'São Paulo (SP)',
      timestamp: CONFIG.FORMATTED_TIMESTAMP,
      type: 'text'
    };
    done();
  });

  it('UNAUTHENTICATED POST: /api/drafts', function(done){
    api.post('/api/drafts')
      .send(buzzDraft)
      .expect(401, done);
  });

  it('WRONG CREDENTIALS POST: /api/drafts', function(done){
    api.post('/api/drafts')
      .auth('inexistent_user', 'inexistent_password')
      .send(buzzDraft)
      .expect(401, done);
  });

  it('EDITOR CREDENTIALS POST: /api/drafts', function(done){
    api.post('/api/drafts')
      .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
      .send(buzzDraft)
      .expect(201)
      .end(function(err, res) {
        assert(typeof res.body.id !== 'undefined');
        done();
      });
  });

  it('COLLABORATOR CREDENTIALS POST: /api/drafts', function(done){
    api.post('/api/drafts')
      .auth(process.env.COLLABORATOR_USERNAME, process.env.COLLABORATOR_PASSWORD)
      .send(buzzDraft)
      .expect(201)
      .end(function(err, res) {
        assert(typeof res.body.id !== 'undefined');
        done();
      });
  });

  it('GET: /api/drafts', function(done){
    buzzDraft.local = 'MyLocal' + Math.random().toString(36).substring(7); 

    api.post('/api/drafts')
      .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
      .send(buzzDraft)
      .expect(201)
      .end(function() {
          api.get('/api/drafts')
            .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
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

                var draftExistInResponse = res.body.filter(function(element){
                    return element.local === buzzDraft.local;
                }).length === 1;

                assert(draftExistInResponse);

                done();
            });
      });
  });

  it('UNAUTHENTICATED DELETE: /api/drafts/<id>', function(done){
    api.delete('/api/drafts/someid')
      .expect(401, done);
  });

  it('DELETE: /api/drafts/<id>', function(done){

    api.post('/api/drafts')
      .auth(process.env.COLLABORATOR_USERNAME, process.env.COLLABORATOR_PASSWORD)
      .send(buzzDraft)
      .expect(201)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        var draftId = res.body.id;

        api.delete('/api/drafts/' + draftId)
          .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_USERNAME)
          .expect(200);

        done();
      });
  });

  it('UNAUTHENTICATED PUT: /api/drafts/<id>', function(done){
    api.post('/api/drafts')
      .auth(process.env.COLLABORATOR_USERNAME, process.env.COLLABORATOR_PASSWORD)
      .send(buzzDraft)
      .expect(201)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        var draftId = res.body.id;

        api.put('/api/drafts/' + draftId)
          .send(buzzDraft)
          .expect(401);

        done();
      });
  });

  it('PUT: /api/drafts/<id>', function(done){

    api.post('/api/drafts')
      .auth(process.env.COLLABORATOR_USERNAME, process.env.COLLABORATOR_PASSWORD)
      .send(buzzDraft)
      .expect(201)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        var draftId = res.body.id;

        api.put('/api/drafts/' + draftId)
          .auth(process.env.EDITOR_USERNAME, process.env.EDITOR_PASSWORD)
          .send(buzzDraft)
          .expect(204);

        done();
      });
  });
});
