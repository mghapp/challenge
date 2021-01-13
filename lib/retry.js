/**
 * Creates a
 * @param {*} func Function to be called
 * @param {Number} retryLimit The maximum number of retries that will be attempted after an initial failure.
 * @return {Function<Promise>} A version of `func` that retries on errors. The resulting function will *always* return a Promise.
 */
function makeRetryable(func, retryLimit) {
  if (typeof func !== "function") {
    throw new Error("makeRetryable: func argument must be a function.");
  }

  if (typeof retryLimit !== "number") {
    throw new Error(
      `makeRetryable: retryLimit argument must be a number, but was '${typeof retryLimit}'`
    );
  }

  if (retryLimit < 0 || isNaN(retryLimit)) {
    throw new Error(
      `makeRetryable: retryLimit argument must be greater than zero`
    );
  }

  return async function (...args) {
    let lastError;
    for (let attempts = 0; attempts < retryLimit + 1; attempts++) {
      try {
        const result = await func(...args);
        return result;
      } catch (err) {
        lastError = err;
      }
    }
    throw lastError;
  };
}

module.exports = { makeRetryable };
