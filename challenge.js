#!/usr/bin/env node
"use strict";

const { getAuthToken, getUserStream } = require("./lib/api");
const { makeRetryable } = require("./lib/retry");

const DEFAULT_RETRY_LIMIT = 2;
const MIN_NODE_VERSION = 10;

run().catch((err) => {
  console.error(err);
  process.exitCode = err.exitCode || 1;
});

async function run(...args) {
  checkNodeVersion();

  let retryLimit = parseInt(process.env.RETRY_LIMIT, 10);
  retryLimit = isNaN(retryLimit) ? DEFAULT_RETRY_LIMIT : RETRY_LIMIT;

  const getAuthTokenWithRetry = makeRetryable(getAuthToken, retryLimit);
  const authToken = await getAuthTokenWithRetry();

  const getUserStreamWithRetry = makeRetryable(getUserStream, retryLimit);
  const stream = await getUserStreamWithRetry(authToken);

  await streamAsJsonArray(stream, process.stdout);
}

function streamAsJsonArray(inputStream, outputStream) {
  return new Promise((resolve, reject) => {
    let leftover = "";
    let writtenFirstId = false;
    outputStream.write("[\n");

    inputStream.on("data", (chunk) => {
      const lines = (leftover + chunk.toString("utf8")).split("\n");
      leftover = lines.pop();
      lines.forEach(writeId);
    });

    inputStream.on("close", () => {
      leftover.length > 0 && writeId(leftover);
      outputStream.write("]\n");
      resolve();
    });

    inputStream.on("error", reject);

    function writeId(id) {
      const prefix = writtenFirstId ? "," : "";
      outputStream.write(`${prefix}${JSON.stringify(id)}\n`);
      writtenFirstId = true;
    }
  });
}

function checkNodeVersion() {
  const majorVersion = parseInt(/^v(\d+)/.exec(process.version)[1], 10);
  if (majorVersion < MIN_NODE_VERSION) {
    throw new Error("This program requires Node.js 10 or later.");
  }
}
