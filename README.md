# Saheli

Saheli is a private safety-planning web app. Users sign in, save trusted
contacts and safety-plan checkboxes to their account, and can delete that saved
data from the app. Incident notes remain in page memory only and are not sent to
the server.

## What Saheli does and does not do

- Saved contacts and safety-plan steps are scoped to the signed-in Clerk user.
- SOS and check-in actions prepare a message or open the device share sheet;
  the user must choose a recipient and confirm sharing.
- Saheli does not send SMS, dispatch emergency services, guarantee delivery, or
  track live location.
- Saheli is not a monitored emergency service. In immediate danger, contact
  local emergency services or a trusted person directly.

## Run locally

Requirements: Node.js 20.19 or newer and npm.

1. Copy `.env.example` to `.env` and set `SUPABASE_DB_URL` to the server-side
   PostgreSQL connection string from your Supabase project. Use a connection
   string with SSL enabled (`sslmode=require`). Configure the Clerk keys too.
   Never commit `.env` or real credentials.
2. Run `db/schema.sql` in the Supabase SQL Editor. The app stores each user's
   contacts and checked safety-plan steps in one private row keyed by Clerk's
   verified user ID. The script enables row-level security and intentionally
   adds no browser-access policies; the server accesses the table with its
   private PostgreSQL connection and always filters by the signed-in user.
3. Install dependencies and start the app:

   ```sh
   npm install
   npm start
   ```

The development server serves the Vite app and API on port `5000`.

## Build for a Node.js host

Configure the environment variables listed in `.env.example`, run
`db/schema.sql` in Supabase, and run:

```sh
npm install
npm run build
NODE_ENV=production npm start
```

The production host must run a Node.js server and provide `SUPABASE_DB_URL` and
the Clerk keys. In production, the app refuses to fall back to a development
`DATABASE_URL`. GitHub stores the source code; GitHub Pages alone cannot run
this app's authenticated API or database.

## Privacy and deployment notes

Contacts and checklist steps are stored in PostgreSQL under the authenticated
Clerk user ID. The API derives that ID from the verified Clerk session; clients
cannot choose which account's row to read or change. Incident notes are
deliberately excluded from the database.

Do not put `SUPABASE_DB_URL` in a `VITE_` variable or in browser code. The
uploaded HTML contains a Supabase browser client for sign-in, but Saheli keeps
Clerk as its account provider and uses Supabase only through the server-side
database connection.

Before inviting real users, review the privacy notice and data-retention policy
for the deployment host, configure production Clerk sign-in, and test account
creation, saved-data deletion, and manual sharing on the target devices.
