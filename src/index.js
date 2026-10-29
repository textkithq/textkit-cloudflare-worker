import { TextKit, verifyWebhook } from 'jointextkit';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    // Send a text. Here it goes to the sandbox number; in your app, send from
    // wherever the event happens (a signup, an order) instead of an open route.
    if (request.method === 'POST' && pathname === '/send') {
      // Pass fetch in: Workers refuse the global fetch when a library calls it detached.
      const sms = new TextKit(env.TEXTKIT_API_KEY, { fetch: (...args) => fetch(...args) });
      const message = await sms.messages.send({
        to: '+15005550006',
        body: 'Hello from a Cloudflare Worker',
      });
      return Response.json({ id: message.id, status: message.status });
    }

    // Receive texts: TextKit POSTs a signed message.received event here.
    if (request.method === 'POST' && pathname === '/webhooks/textkit') {
      const rawBody = await request.text();
      let event;
      try {
        event = await verifyWebhook({
          payload: rawBody,
          headers: request.headers,
          secret: env.TEXTKIT_WEBHOOK_SECRET,
        });
      } catch {
        return new Response('Invalid signature', { status: 400 });
      }
      if (event.type === 'message.received') {
        console.log(`Text from ${event.data.from}: ${event.data.body}`);
      }
      return new Response('ok');
    }

    return new Response('Not found', { status: 404 });
  },
};
