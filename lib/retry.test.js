const { makeRetryable } = require("./retry");

const SUCCESSFUL_RESULT = 42;

describe("makeRetryable", () => {
  describe("argument validation", () => {
    test("func argument not a function", () => {
      expect(() => makeRetryable("not a function", 4)).toThrow();
    });
    test("retryLimit argument not a number", () => {
      expect(() => makeRetryable(() => {}, "obviously not a number")).toThrow();
    });
    test("retryLimit argument negative", () => {
      expect(() => makeRe(() => {}, -1)).toThrow();
    });
    test("retryLimit argument NaN", () => {
      expect(() => makeRetryable(() => {}, NaN)).toThrow();
    });
  });

  describe("retry logic", () => {
    test("returns successful result", async () => {
      function functionThatSucceeds() {
        return SUCCESSFUL_RESULT;
      }

      const retryable = makeRetryable(functionThatSucceeds, 2);

      expect(await retryable()).toBe(SUCCESSFUL_RESULT);
    });

    test("returns result after initial failure", async () => {
      const functionThatEventuallySucceeds = createFunctionThatFailsOnce();
      const retryable = makeRetryable(functionThatEventuallySucceeds, 2);
      expect(await retryable()).toBe(SUCCESSFUL_RESULT);
    });

    test("returns result when successful at retryLimit", async () => {
      const functionThatEventuallySucceeds = createFunctionThatFailsOnce();
      const retryable = makeRetryable(functionThatEventuallySucceeds, 1);
      expect(await retryable()).toBe(SUCCESSFUL_RESULT);
    });

    test("throws when retryLimit reached", async () => {
      const functionThatFailsOnce = createFunctionThatFailsOnce();
      const retryable = makeRetryable(functionThatFailsOnce, 0);
      try {
        await retryable();
      } catch (err) {
        if (err.message !== "This function always fails the first time.") {
          throw err;
        }
      }
    });
  });
});

function createFunctionThatFailsOnce() {
  let calls = 0;
  return function () {
    calls++;
    if (calls === 1) {
      throw new Error("This function always fails the first time.");
    }
    return SUCCESSFUL_RESULT;
  };
}
