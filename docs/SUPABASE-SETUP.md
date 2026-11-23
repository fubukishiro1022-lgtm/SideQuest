# Supabase setup

SideQuest can keep its data in Supabase so organizers can sign in on different devices and players can open a live, read-only queue link.

## Create the backend

1. Create a Supabase project.
2. Open **SQL Editor**, run [`supabase/schema.sql`](../supabase/schema.sql), and wait for it to finish.
3. Click **Connect** near the top of the project dashboard to copy the Project URL. Copy the publishable key from **Project Settings → API Keys**. Put both into `assets/config.js`:

   ```js
   window.SQ_SUPABASE = {
     url: 'https://YOUR-PROJECT.supabase.co',
     anonKey: 'YOUR-PUBLISHABLE-OR-ANON-KEY'
   };
   ```

   The browser key is public by design. Never put a service-role key in this website. The SQL enables row-level security so each organizer can access only their own private club data.

4. In **Authentication → URL Configuration**, set the production site as the Site URL and add the site and local development URL to the redirect allow list.
5. Decide whether to require email confirmation in **Authentication → Providers → Email**. If confirmation is on, new organizers must confirm their address before logging in.
6. Deploy the site over HTTPS. The app will use the cloud login when both config values are present; without them, the existing local-only login and demo still work.

## How data is stored

- Organizer credentials are handled by Supabase Auth. SideQuest never stores the organizer password.
- `club_data` stores the app's session state, history, and all-time player stats in a private JSON record protected by RLS.
- `public_queues` stores only the current session name, checked-in names/queue order, active court player names, and update time. It is published only after the organizer chooses **Create / refresh player link**.
- The player URL is the deployed site plus `?queue=club-link`. The QR in the organizer app points to that URL and refreshes live through Supabase Realtime.

Existing browser data remains on that device. To move it, sign in/create the cloud club using the same club link on that device; the app uploads any saved session/history for that link on first cloud save. Download a backup before migrating important records.

## Important

The public queue intentionally shows player names. Share the QR only with people who should see the current queue. Supabase free projects can pause when inactive; check the project's current limits and availability before relying on it for a live event.
