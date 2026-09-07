import { test } from "node:test";
import assert from "node:assert/strict";
import { sessionStatus } from "./session";
const sessions = [
  { open: 100, close: 200 },
  { open: 400, close: 500 },
];
test("session includes opening and excludes closing, skips holidays and stops at calendar end", () => {
  assert.deepEqual(sessionStatus(sessions, 99), { state: "closed", at: 100 });
  assert.deepEqual(sessionStatus(sessions, 100), { state: "open", at: 200 });
  assert.deepEqual(sessionStatus(sessions, 200), { state: "closed", at: 400 });
  assert.deepEqual(sessionStatus(sessions, 300), { state: "closed", at: 400 });
  assert.deepEqual(sessionStatus(sessions, 500), {
    state: "unavailable",
    at: null,
  });
});
