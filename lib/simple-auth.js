'use strict';

var auth = require('basic-auth');

var USERNAME        = process.env.USERNAME;
var PASSWORD        = process.env.PASSWORD;

module.exports = function() {

    return function(req, res, next) {

        var credentials = auth(req);

        if (!credentials || credentials.name !== USERNAME || credentials.pass !== PASSWORD) {
            res.statusCode = 401;
            res.setHeader('WWW-Authenticate', 'Basic realm="example"');
            res.end('Access denied');
        } else {
            next();
        }
    }
    
};
