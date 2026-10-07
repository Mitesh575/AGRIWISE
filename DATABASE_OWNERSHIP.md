# Keeping AgriWise under your control

The Supabase database in this project is deliberately owned by **your Supabase account**.
The project source contains only the public `anon` client key when you configure it;
never put a `service_role` secret into the frontend.

## During the hackathon

- Keep the Supabase account email/password private.
- If teammates need dashboard access, invite them only with the minimum role needed.
- Give them the application/repository access they need, not your account password.
- `.env.local` is ignored by Git and should not be uploaded to GitHub.

## After the hackathon

1. Remove collaborators from the GitHub repository.
2. Remove/revoke any Supabase dashboard/project members.
3. Rotate any credentials you gave to teammates.
4. If you want an immediate database lock, pause the Supabase project from your dashboard.
5. When you want to use AgriWise again, resume the project.

### Important limitation

A browser `anon` key is not a secret. Anyone who already has the application can see it.
The database is protected by Supabase Row Level Security rather than by hiding this key.
For a truly private production database, move database writes behind a server/Edge Function
using a secret `service_role` key and authenticate your users. That is a second-stage hardening
step and is not required for the hackathon demo setup included here.

No technical setup can remotely erase a source-code copy that somebody has already downloaded.
