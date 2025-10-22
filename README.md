# AnonyLink.fun — static demo

This repository contains a lightweight, mobile-first, single-page app for anonymous messaging links (demo). It uses a seeded embedded database (`data.js`) and stores newly submitted messages in the user's browser (`localStorage`).

**Mode**: Static seed + localStorage overlay (messages persist only in the browser that submitted them).

## Files
- `index.html` — SPA shell and templates.
- `styles.css` — styles (mobile-first).
- `app.js` — main JavaScript.
- `data.js` — embedded seed DB (profiles, messages, config).
- `assets/` — icons (optional).
- `README.md` — this file.

## How it works
- Seeded profiles/messages are defined in `data.js`.
- New messages created in the UI are saved into `localStorage` and merged with seeded data in the current browser.
- Owner moderation is handled via a per-profile `ownerKey` included in the seed or generated when you create a local profile. This is a client-only key (not secure for production).

## Quick start — publish on GitHub Pages
1. Create a new GitHub repo (e.g. `anonyLink-fun`).
2. Add the files above and commit.
3. Push to `main`.
4. Go to the repository Settings → Pages → Choose `main` branch and `/ (root)` as source, Save.
5. Wait a minute — your site should be available at `https://<username>.github.io/<repo>/`.
6. (Optional) Add a `CNAME` file with your custom domain and configure DNS accordingly.

## Editing seeded data
Open `data.js` and modify the `DB.profiles` and `DB.messages` arrays. Deploy the updated file to change seeded data.

## Converting to production (recommended steps)
1. Add a backend (Supabase, Firebase, or serverless function) to store profiles and messages.
   - Create profiles table and messages table.
   - Implement POST endpoint for submitting messages and GET endpoint for fetching messages.
2. Add rate-limiting and CAPTCHA (reCAPTCHA or hCaptcha) to prevent spam.
3. Implement owner authentication (email verification or secret tokens stored server-side).
4. Add server-side moderation, reporting, and retention policies.
5. Update the front-end to call your backend endpoints instead of reading `data.js` (I can provide step-by-step migration help).

## Privacy & Terms
Long-form Terms of Service and Privacy Policy are included in the site (links in header). For production, update these and include the operator's real contact details.

## Support
Contact `support@anonyLink.fun` (demo) or edit the support contact in `index.html`.

## License
This demo is provided under the MIT License. See LICENSE.
