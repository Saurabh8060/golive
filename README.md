# GoLiveHub

Live streaming web app built with Next.js, Clerk, Stream Video/Chat, and Supabase.

Live app: https://golivehub.vercel.app/

## What It Does

- Authenticates users with Clerk
- Onboards new users and stores profile data in Supabase
- Lets creators start a livestream with camera, mic, and screen sharing controls
- Shows active livestreams in the app feed
- Opens live chat for stream sessions
- Supports interests, follows, and livestream records through a Supabase-backed API route

## Core Flow

1. Visitors land on the app and are redirected to login if not signed in.
2. Signed-in users are routed through onboarding if they do not yet exist in the database.
3. Users without interests complete the interest-selection step.
4. The app home view loads available livestreams and recommended categories.
5. Streamers can enter the dashboard, configure devices, and go live.
6. Viewers can open a creator stream page and join the live experience with chat.

## Tech Stack

- Next.js App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Clerk authentication
- Stream Video and Stream Chat
- Supabase
- Framer Motion

## Project Structure

```text
app/
  api/supabase-proxy/     Server route for database actions
  app/                    Signed-in app routes
  components/             UI for auth, onboarding, feeds, stream, and chat
  createStreamUser/       Stream user bootstrap page
  login/                  Authentication entry page
contexts/                 Shared React context, including database access
database/                 Generated database types and mock data
lib/                      Shared helpers and config
public/                   Static assets
```

## Environment Variables

Create `.env.local` or `.env` with:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
STREAM_API_KEY=
NEXT_PUBLIC_STREAM_API_KEY=
STREAM_SECRET=
NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL=/app
```

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Important App Areas

- `/login`: sign in and sign up
- `/app`: post-login home, onboarding checks, livestream feed
- `/app/dashboard`: streamer dashboard with camera, mic, screen share, and chat
- `/app/[user]`: viewer-facing livestream page
- `/createStreamUser`: creates the Stream user record for the signed-in user
- `/api/supabase-proxy`: server-side route used by the frontend for user and livestream data operations

## Supabase Responsibilities

The app currently uses the proxy route to handle actions such as:

- fetching user records
- creating or updating user profiles
- saving user interests
- listing livestreams
- creating and deleting livestream records
- following and unfollowing users
- seeding or removing mock livestream data

## Notes

- The repo currently uses `next build --webpack` for production builds.
- Remote image hosts are configured in `next.config.ts` for Clerk and other external sources.
- Stream tokens are created on the server through `app/actions.ts`.
