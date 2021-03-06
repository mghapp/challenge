# NOC List Challenge

This repository contains code for the [NOC List Ad Hoc Challenge][noclist]. The code is written in Javascript, and is meant to be run via [Node.js][nodejs].

## Requirements

- Node.js >= 10
- Docker
- GNU Make

## Running the Challenge

To run the challenge, first start the BADSEC API server:

```shell
$ make start-badsec-api
```

Then, run the challenge:

```shell
$ ./challenge.js
```

The challenge expects the BADSEC API server to be running at <http://localhost:8888>. To connect to a different URL, use the `BASE_URL` environment variable:

```shell
$ BASE_URL=https://example.org ./challenge.js
```

## Unit Tests

Unit tests are managed via [Jest][jest]. A `make` goal is included to install dependencies and run unit tests:

```shell
$ make unit-tests
```

## Integration Tests

A limited integration test is provided, and can be run via `make`:

```shell
$ make integration-test
```

[noclist]: https://homework.adhoc.team/noclist/
[nodejs]: https://nodejs.org/
[jest]: https://jestjs.io/
