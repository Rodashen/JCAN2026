# Free-tier paid exam access setup

The website changes and access service are prepared. Email access is **not live until you complete this setup**. GitHub Pages cannot run the secure access service. Use the free Cloudflare Workers address for the protected website; no custom domain is required for hosting.

## What students receive

1. You confirm payment directly, then open `/exam-admin.html` on your Cloudflare site.
2. Enter your administrator key and the student's email, confirm payment, and send the code.
3. A random activation code is emailed to that address. It expires after seven days and works only once, only for that email.
4. Activation grants unlimited practice attempts without an automatic membership expiry. You can revoke access.
5. The browser stays signed in for 30 days. A returning student requests a new one-time sign-in code, valid for 15 minutes; no second payment is required.

The administrator key and email API key must never go into website JavaScript, GitHub, or chat. Enter them in the service's secret settings. Use the administrator page only on your own trusted device. The system proves control of the email inbox, not the student's identity; sharing an inbox or an active device still shares access.

## Accounts and free limits

- Create a **Cloudflare Free** account. Workers and D1 have daily free allowances. Keep the free plan selected; do not enable a paid plan.
- Create a **Brevo Free** account and enable transactional email. Its documented free allowance is 300 emails/day. This app caps sending requests at 240/day to leave headroom. Brevo account approval and sender verification are required.
- Verify a sender address in Brevo. If you use a free email address such as Gmail, Brevo may replace the displayed sender with its compliant address. Test delivery to real inboxes before accepting paid users. A custom domain improves sender identity, but this implementation does not require you to buy one. Service policies and allowances can change; verify the current free plan when signing up.

Official references: [Cloudflare pricing](https://developers.cloudflare.com/workers/platform/pricing/), [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/), [Brevo free plan](https://help.brevo.com/hc/en-us/articles/208580669-FAQs-What-are-the-limits-of-the-Free-plan), [Brevo sender requirements](https://help.brevo.com/hc/en-us/articles/14925263522578-Comply-with-Gmail-Yahoo-and-Microsoft-s-requirements-for-email-senders).

## Deployment

Run these commands in this repository with Node.js 24 or newer. Wrangler will ask you to sign in to Cloudflare. Use the current Wrangler 4 release.

```text
npx wrangler@4 login
npx wrangler@4 d1 create jcan-exam-access
```

Copy the returned database ID into `wrangler.jsonc` under `database_id`. Update `SITE_ORIGIN` to your exact HTTPS Workers origin, without a trailing slash or a path. Set `SENDER_EMAIL` to the verified Brevo sender address. The Workers name is `jcan-exam-access`; your account determines the subdomain.

```text
npx wrangler@4 d1 execute jcan-exam-access --remote --file access/schema.sql
npx wrangler@4 secret put BREVO_API_KEY
npx wrangler@4 secret put ADMIN_KEY
npx wrangler@4 secret put CODE_PEPPER
```

Use independently generated random secrets of at least 32 characters for `ADMIN_KEY` and `CODE_PEPPER`. Store the administrator key in your password manager. Rotating `CODE_PEPPER` invalidates existing codes and sessions. Do not reuse your email password.

```text
npm test
node tools/build-access-site.mjs
npx wrangler@4 deploy
```

The deploy uploads only the `dist` static assets and the server separately. `run_worker_first: true` is required: it enforces authentication before serving CBT/UBT pages, their JavaScript, question JSON, and exam media. **Never disable it or publish `dist` directly on an unprotected static host.**

## Before announcing paid access

Test with your own email: send an activation code, try it with a different email (must fail), activate it, retry it (must fail), start several exams, sign out, request a sign-in code, and sign back in. Check both CBT and UBT, sound playback, direct question-data links while signed out, and access revocation. Live email delivery has not been tested without your accounts.

Point students to the new Cloudflare site. The old GitHub Pages site remains public until you disable it or replace its exam links with the protected site. This repository and its existing question/media history may also be public: access codes cannot erase previously published files or stop students copying materials they can view. To make access exclusive, disable the old public exam deployment and use a private repository for future protected material. These account-level changes have not been made automatically.

## Privacy and recovery

The service stores email addresses, activation/revocation status, hashed codes, hashed session tokens, and temporary hashed rate-limit keys in your D1 database. Expired sessions, sign-in codes, and rate-limit rows are removed daily. The browser stores exam progress locally. Use the student page's Sign out button on shared devices; it clears the local exam history and saved answers.

To delete an account, first revoke it in the administrator page, then delete its `members` row in D1. Revocation removes its sessions and sign-in codes. A lost activation code can be replaced by sending a new activation from the administrator page; this invalidates the previous unused activation code. Active users should use the student sign-in-code button.

No payment gateway is included. Payment confirmation is your manual decision. Emails are sent only when you explicitly issue access or the student requests a sign-in code.
