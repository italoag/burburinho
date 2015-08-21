'use strict';

var auth = require('basic-auth');

module.exports = function(username, password) {

    return function(req, res, next) {

        var credentials = auth(req);

        if (!credentials || credentials.name !== username || credentials.pass !== password) {                      
            res.statusCode = 401;
            res.setHeader('WWW-Authenticate', 'Basic realm="example"');
            res.end('Access denied');
        } else {
            next();
        }
    };

};
