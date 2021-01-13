#!/usr/bin/env node

let buffer = Buffer.from("");
process.stdin.on("data", (chunk) => {
  buffer = Buffer.concat([buffer, chunk]);
});

process.stdin.on("close", () => {
  const parsed = JSON.parse(buffer.toString("utf-8"));
  process.stdout.write(JSON.stringify(parsed, null, 2));
  process.stdout.write("\n");
});
