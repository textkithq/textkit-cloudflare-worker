# TextKit Cloudflare Worker

A Cloudflare Worker that sends texts with [TextKit](https://jointextkit.com) and receives replies through a signed webhook.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/textkithq/textkit-cloudflare-worker)

- `POST /send` sends a text to `+15005550006`, a sandbox number that always ends `delivered`.
- `POST /webhooks/textkit` checks the `textkit-signature` header and logs each `message.received` event.

Full guide: https://jointextkit.com/integrations/cloudflare-workers

## Run it locally

```bash
npm install
cp .dev.vars.example .dev.vars   # paste your test key
npx wrangler dev
curl -X POST http://localhost:8787/send
```

Get a free test key in the [console](https://jointextkit.com/console). It runs in the sandbox: nothing reaches a real phone.

## Deploy

```bash
npx wrangler deploy
npx wrangler secret put TEXTKIT_API_KEY
```

## Receive texts

1. In the TextKit console, open **Webhooks** and add an endpoint: `https://textkit-worker.<your-subdomain>.workers.dev/webhooks/textkit`, subscribed to `message.received`.
2. Store its signing secret: `npx wrangler secret put TEXTKIT_WEBHOOK_SECRET`.
3. Simulate a reply and watch it with `npx wrangler tail`:

```bash
curl -X POST https://api.jointextkit.com/v1/test/inbound \
  -H "Authorization: Bearer $TEXTKIT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"from":"+14155550132","body":"Hey, got your message!"}'
```

In your own app, send from wherever the event happens (a signup, an order) rather than an open `/send` route.
