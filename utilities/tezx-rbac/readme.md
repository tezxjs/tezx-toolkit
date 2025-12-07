চমৎকার! তুমি `@tezx/webhooks` নামে একটা plugin/module বানাতে চাচ্ছো — যার কাজ হবে:

* ইনকামিং HTTP ওয়েবহুক রিকোয়েস্ট হ্যান্ডেল করা
* সিগনেচার ভেরিফিকেশন (যেমন Stripe বা GitHub-style)
* ডাইনামিক ইভেন্ট হ্যান্ডলার চালানো
* নিরাপত্তা, লজিং, এবং থ্রটলিং নিশ্চিত করা

---

## ✅ উদ্দেশ্য

একটি সহজ API দিয়ে ডেভেলপাররা যেন এভাবে Webhook হ্যান্ডেল করতে পারে:

```ts
webhook.on("order.created", async (event) => {
  console.log("New order", event.data);
});
```

---

## 📦 Package Name

```
@tezx/webhooks
```

---

## 🧱 স্ট্রাকচার

```bash
packages/
  webhooks/
    src/
      index.ts
      verifier.ts
      types.ts
      parser.ts
    package.json
```

---

## 🧪 ১. ব্যবহার উদাহরণ (Usage Example)

```ts
// app.ts
import { TezX } from "@tezx/core";
import { nodeAdapter } from "@tezx/node";
import { createWebhookHandler } from "@tezx/webhooks";

const app = new TezX();

// Create webhook handler
const webhook = createWebhookHandler({
  secret: "my_super_secret", // Optional signature check
  signatureHeader: "x-signature", // Optional
  algorithm: "sha256",
});

// Register event handler
webhook.on("payment.success", async (event) => {
  console.log("✅ Payment Success:", event.data);
});

webhook.on("*", async (event) => {
  console.log("📦 Caught Generic Webhook:", event.event);
});

// Attach route
app.post("/webhook", webhook.handle());

nodeAdapter(app).listen(3000, () => {
  console.log("Listening for webhooks on port 3000");
});
```

---

## ⚙️ ২. API Design

```ts
type WebhookHandlerOptions = {
  secret?: string;
  signatureHeader?: string; // default: "x-signature"
  algorithm?: "sha1" | "sha256" | "none"; // default: "none"
};

type WebhookEvent = {
  event: string;
  data: any;
  headers: Record<string, string>;
};

type WebhookHandler = {
  on(event: string | "*", handler: (e: WebhookEvent) => Promise<void>): void;
  handle(): (ctx: TezXContext) => Promise<void>;
};
```

---

## 🔐 ৩. Signature Verification (verifier.ts)

```ts
import crypto from "crypto";

export function verifySignature({
  body,
  signature,
  secret,
  algorithm = "sha256",
}: {
  body: string;
  signature: string;
  secret: string;
  algorithm?: "sha1" | "sha256";
}): boolean {
  const hash = crypto
    .createHmac(algorithm, secret)
    .update(body)
    .digest("hex");

  return hash === signature;
}
```

---

## 📄 ৪. Core Logic (index.ts)

```ts
import { verifySignature } from "./verifier";

export function createWebhookHandler(opts: WebhookHandlerOptions = {}): WebhookHandler {
  const listeners = new Map<string, ((event: WebhookEvent) => Promise<void>)[]>();

  function on(event: string | "*", handler: (e: WebhookEvent) => Promise<void>) {
    if (!listeners.has(event)) listeners.set(event, []);
    listeners.get(event)!.push(handler);
  }

  function handle() {
    return async (ctx: any) => {
      const raw = await ctx.rawBody(); // raw body support required
      const json = JSON.parse(raw);
      const signature = ctx.headers[opts.signatureHeader || "x-signature"];

      if (opts.secret && opts.algorithm !== "none") {
        const isValid = verifySignature({
          body: raw,
          signature,
          secret: opts.secret!,
          algorithm: opts.algorithm,
        });

        if (!isValid) {
          ctx.status(401);
          return ctx.text("Invalid signature");
        }
      }

      const eventName = json.event;
      const handlers = [...(listeners.get(eventName) || []), ...(listeners.get("*") || [])];

      for (const handler of handlers) {
        await handler({
          event: json.event,
          data: json.data,
          headers: ctx.headers,
        });
      }

      ctx.status(200);
      ctx.text("ok");
    };
  }

  return { on, handle };
}
```

---

## ✅ Features

| Feature                 | Support                        |
| ----------------------- | ------------------------------ |
| Signature verify (HMAC) | ✅                              |
| Raw body support        | ✅                              |
| Event-based handler     | ✅                              |
| `*` wildcard handler    | ✅                              |
| Framework agnostic      | ✅ (works in TezX but portable) |
| Deno compatible         | ✅                              |

---

## 🧪 চাইলে টেস্ট ফাইল / ডকস / publish-ready structure দিয়ে দিতে পারি।

তুমি চাও কি আমি এই `@tezx/webhooks` package টা GitHub boilerplate আকারে বানিয়ে দিই? না হলে তুমি নিজেই বানালে আমি review করে optimize করে দিই।

Let me know! 🔥
