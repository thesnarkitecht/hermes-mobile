// Run with: node lib.test.js
const assert = require('node:assert/strict');
const { parseSSE, toCron } = require('./lib.js');

// SSE: events split across chunks, keepalive comments, Hermes tool-progress events, [DONE].
let r = parseSSE('data: {"a":1}\n\n: keepalive\n\nevent: hermes.tool.progress\ndata: {"tool":"web_search"}\n\ndata: {"b"');
assert.deepEqual(r.events, [
  { event: 'message', data: '{"a":1}' },
  { event: 'hermes.tool.progress', data: '{"tool":"web_search"}' },
]);
assert.equal(r.rest, 'data: {"b"');
r = parseSSE(r.rest + ':2}\r\n\r\ndata: [DONE]\n\n');
assert.deepEqual(r.events.map(e => e.data), ['{"b":2}', '[DONE]']);
assert.equal(r.rest, '');

// Natural-language schedule to cron.
assert.equal(toCron('Every weekday at 7:30'), '30 7 * * 1-5');
assert.equal(toCron('every day at 8pm'), '0 20 * * *');
assert.equal(toCron('daily at 12am'), '0 0 * * *');
assert.equal(toCron('Every Monday at 9'), '0 9 * * 1');
assert.equal(toCron('every 2 hours'), '0 */2 * * *');
assert.equal(toCron('every hour'), '0 * * * *');
assert.equal(toCron('every day at 25:00'), null);
assert.equal(toCron('every day at 13pm'), null);
assert.equal(toCron('the first Friday of each month'), null);

console.log('lib.test.js: all passed');
