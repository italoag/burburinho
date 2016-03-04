Burburinho
==========

[![Build Status](https://snap-ci.com/brasil-de-fato/burburinho/branch/master/build_image)](https://snap-ci.com/brasil-de-fato/burburinho/branch/master)
[![Coverage Status](https://coveralls.io/repos/brasil-de-fato/burburinho/badge.svg?branch=master)](https://coveralls.io/r/brasil-de-fato/burburinho?branch=master)

Burburinho is the backend and administrative interface of [cobertura](https://github.com/brasil-de-fato/cobertura): our website for live news and events coverage.

## Prerequisites

* [Node.js](https://nodejs.org)
* [MongoDB](https://www.mongodb.com/)

Before running Burburinho or its tests, it is necessary to define the following environment variables: 

```
EDITOR_USERNAME=<editor username>
EDITOR_PASSWORD=<editor password>
COLLABORATOR_USERNAME=<collaborator username>
COLLABORATOR_PASSWORD=<collaborator password>
COBERTURA_DATABASE_URL=<mongo database url>
```

## Installing node packages


```
$ npm install
```

## Running the tests
```
$ npm test
```

## Starting it

```
$ npm run nodemon
```

You can access the UI for the editors on http://localhost:5000/criando.html and for collaborators on http://localhost:5000/colaborando.html.
