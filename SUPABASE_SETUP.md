# AgriWise Connect — Supabase database setup

This project is database-ready without changing the existing seven-module UI.
The cloud database is optional for local demos, but recommended for the hackathon.

## 1. Create the database under YOUR account

1. Create a Supabase account using an email/account you control.
2. Create a new project, e.g. `agriwise-connect`.
3. Do not give the Supabase account password to teammates.
4. Open **SQL Editor** and run `supabase/schema.sql` from this project.

## 2. Connect this project

In the Supabase dashboard, copy:
- Project URL
- Project API key / anon (public) key

In the AgriWise project folder, create `.env.local` from `.env.example`:

```
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

Never put a `service_role` key in `.env.local` for this browser application.

## 3. Install and run

Windows PowerShell:

```
npm.cmd install
npm.cmd run dev
```

After installing the dependency once, normal `npm install` also works if PowerShell
execution policy is configured appropriately.

## 4. What is stored

Successful analyses from the modules can be recorded in `field_analyses` as compact
JSON input/result records. Images themselves are NOT uploaded to the database.

If Supabase variables are missing, the app still runs in local/demo mode.

## 5. After the hackathon — retain control

- Keep the Supabase project under YOUR account.
- Remove the teammate from the Supabase organization/project if you added them.
- Revoke/rotate any credentials you gave them.
- Keep `.env.local` private and do not commit it.
- If you need an immediate hard stop, pause/disable the Supabase project.

Important: this controls the cloud database. It cannot delete a source-code copy
that someone already downloaded to their own computer.
