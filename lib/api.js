"use strict";

const crypto = require("crypto");
const http = require("http");
const https = require("https");
const { URL } = require("url");

const DEFAULT_BASE_URL = "http://localhost:8888";

const AUTH_TOKEN_HEADER = "Badsec-Authentication-Token";
const CHECKSUM_HEADER = "X-Request-Checksum";

/**
 * @returns {string} An auth token to use for future API calls.
 */
async function getAuthToken() {
  const res = await apiGet("/auth");
  return res.headers[AUTH_TOKEN_HEADER.toLowerCase()];
}

/**
 * Returns a line-oriented stream of user identifiers.
 * @param {string} authToken
 * @returns {ReadableStream}
 */
function getUserStream(authToken) {
  return apiGet("/users", authToken);
}

/**
 * Helper that makes an HTTP GET-based call to the API.
 * @param {string} requestPath
 * @param {string|null|undefined} authToken
 * @returns {Promise<http.IncomingMessage>} A Promise that resolves to the HTTP response. If the response has a non-200 status code, the Promise will be rejected with an Error instead.
 */
function apiGet(requestPath, authToken) {
  return new Promise((resolve, reject) => {
    const baseUrl = new URL(process.env.BASE_URL || DEFAULT_BASE_URL);
    const url = new URL(requestPath, baseUrl);

    // Use http / https as appropriate
    const PROTOCOLS = {
      "http:": http,
      "https:": https,
    };
    const impl = PROTOCOLS[url.protocol];
    if (!impl) {
      reject(new Error("URL has invalid protocol."));
      return;
    }

    const headers = {};
    if (authToken != null) {
      headers[CHECKSUM_HEADER] = calculateChecksum(authToken, requestPath);
    }

    const req = impl.get(url, { headers });

    req.on("response", (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Received HTTP status code ${res.statusCode}`));
        return;
      }
      resolve(res);
    });
    req.on("error", reject);

    req.end();
  });

  function calculateChecksum(authToken, requestPath) {
    const hash = crypto.createHash("sha256");
    hash.update(`${authToken}${requestPath}`);
    return hash.digest("hex");
  }
}

module.exports = {
  getAuthToken,
  getUserStream,
};
