// Pure helpers shared by the app (as globals) and lib.test.js (as a CommonJS module).
(function (root) {
  // Splits a Server-Sent Events buffer into complete events; `rest` is the unfinished tail to keep.
  function parseSSE(buffer) {
    const blocks = buffer.split(/\r?\n\r?\n/);
    const rest = blocks.pop();
    const events = [];
    for (const block of blocks) {
      let event = 'message';
      const data = [];
      for (const line of block.split(/\r?\n/)) {
        if (!line || line.startsWith(':')) continue; // ": keepalive" comments
        const i = line.indexOf(':');
        const field = i < 0 ? line : line.slice(0, i);
        const value = i < 0 ? '' : line.slice(i + 1).replace(/^ /, '');
        if (field === 'event') event = value;
        else if (field === 'data') data.push(value);
      }
      if (data.length) events.push({ event, data: data.join('\n') });
    }
    return { events, rest };
  }

  const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  // shortcut: understands a few common phrasings only; anything else is sent to Hermes as natural language, which it parses itself.
  function toCron(text) {
    const s = text.toLowerCase().trim().replace(/\s+/g, ' ');
    if (/^every hour$/.test(s)) return '0 * * * *';
    let m = s.match(/^every (\d{1,2}) hours?$/);
    if (m) return +m[1] >= 1 && +m[1] <= 23 ? `0 */${+m[1]} * * *` : null;
    m = s.match(/^(?:every )?(day|daily|weekday|sunday|monday|tuesday|wednesday|thursday|friday|saturday)s? at (\d{1,2})(?::(\d{2}))? ?(am|pm)?$/);
    if (!m) return null;
    let h = +m[2];
    const min = +(m[3] || 0);
    if (m[4] && (h < 1 || h > 12)) return null;
    if (m[4] === 'pm' && h < 12) h += 12;
    if (m[4] === 'am' && h === 12) h = 0;
    if (h > 23 || min > 59) return null;
    const dow = m[1] === 'day' || m[1] === 'daily' ? '*' : m[1] === 'weekday' ? '1-5' : String(DAYS.indexOf(m[1]));
    return `${min} ${h} * * ${dow}`;
  }

  const api = { parseSSE, toCron };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else Object.assign(root, api);
})(this);
