# Hermes Mobile

A phone app for [Hermes Agent](https://hermes-agent.nousresearch.com), the companion to the desktop app. It's an installable PWA, so the same code runs on iOS and Android. There's no build step.

- **Chat**: streams replies, shows each tool call (`web_search`, `terminal`, `cronjob`…) as it runs, has slash commands (`/new`, `/model`, `/personality`, `/usage`, `/skills`, `/rollback`), and puts an approval card in front of risky commands (allow once, allow for this chat, always allow, deny).
- **Schedules**: lists cron jobs with pause/resume, run now and delete (with undo). You create a job by describing the schedule in plain words ("every weekday at 7:30").
- **Skills**: shows installed skills, including the ones Hermes wrote itself, and lets you install skills from the Skills Hub.
- **Memory**: lets you view, add and remove entries in `USER.md` and `MEMORY.md`, with each file's character budget shown.
- **Settings**: picks between the demo agent and your own server, and sets the model, personality and approval mode. Display options are theme, four text sizes, more contrast and reduce motion.

Accessibility: Atkinson Hyperlegible type, touch targets of at least 44 px, native `<dialog>` sheets (they trap focus and close on Esc), screen-reader announcements when tools run and when replies finish, real radio groups and switches, visible focus rings, and support for forced colors. The app also follows the system's reduced-motion and contrast settings.

## Run it

```sh
python3 -m http.server 8080   # then open http://localhost:8080 on your phone (same network) and "Add to Home Screen"
node lib.test.js              # helper tests
```

Opening `index.html` straight from disk works too, but the service worker (offline support) needs `http(s)`.

## Connect your Hermes server

Out of the box the app runs in **demo mode** with example data. To talk to your own agent, turn on the Hermes API server on the machine running Hermes by adding this to `~/.hermes/.env`:

```sh
API_SERVER_ENABLED=true
API_SERVER_KEY=pick-a-long-random-key
API_SERVER_CORS_ORIGINS=https://where-you-host-this-app
```

Then run `hermes gateway`. In the app, go to **Settings → My Hermes server**, enter the address (port `8642` by default) and the key, and tap **Test connection**. To reach a server from your phone, bind it to your LAN with `API_SERVER_HOST=0.0.0.0` or put it behind a tunnel or Tailscale, and use HTTPS when it's not on your local network.

What talks to the live server today: chat over streaming `/v1/chat/completions` (including `hermes.tool.progress` events), plus `/health` and `/v1/models` for the connection test. Schedules, skills and memory still use demo data. The next step is to wire them to `/api/jobs`, `/v1/skills` and `/v1/runs` (which carries approvals).

The API key is stored in the browser's `localStorage` on the device.

## Files

| File | What it is |
|---|---|
| `index.html` | The whole app: markup, styles, logic |
| `lib.js` | SSE parser and plain-words-to-cron helper, shared with tests |
| `lib.test.js` | `node lib.test.js` |
| `sw.js`, `manifest.webmanifest`, `icon*` | PWA install and offline shell |
